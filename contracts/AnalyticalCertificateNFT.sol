// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AnalyticalCertificateNFT is ERC1155, AccessControlEnumerable {
    using Counters for Counters.Counter;

    // Contatore degli ID dei token
    Counters.Counter private tokenIdCounter;

    // Ruolo per i laboratori autorizzati
    bytes32 public constant AUTHORIZED_LAB_ROLE =
        keccak256("AUTHORIZED_LAB_ROLE");

    // Evento emesso quando viene aggiunto un certificato di analisi
    event CertificateAdded(uint256 indexed tokenId, string productHash);

    // Evento emesso quando viene aggiunta un'analisi a un certificato esistente
    event AnalysisAdded(uint256 indexed tokenId);

    // Costruttore del contratto
    constructor() ERC1155("uri") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(AUTHORIZED_LAB_ROLE, msg.sender);
    }

    // Funzione per aggiungere un certificato di analisi
    function addCertificate(
        string memory _productHash
    ) external onlyRole(AUTHORIZED_LAB_ROLE) {
        tokenIdCounter.increment();
        uint256 newTokenId = tokenIdCounter.current();

        _mint(address(this), newTokenId, 1, "");

        emit CertificateAdded(newTokenId, _productHash);
    }

    // Funzione per aggiungere un'analisi a un certificato esistente
    function addAnalysis(
        uint256 _tokenId
    ) external onlyRole(AUTHORIZED_LAB_ROLE) {
        _mint(msg.sender, _tokenId, 1, "");

        emit AnalysisAdded(_tokenId);
    }

    // Funzione per ottenere la lista di laboratori autorizzati per un certificato
    function addAuthorizedLab(
        address _authorizedLab
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(AUTHORIZED_LAB_ROLE, _authorizedLab);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC1155, AccessControlEnumerable)
        returns (bool)
    {
        return
            ERC1155.supportsInterface(interfaceId) ||
            AccessControl.supportsInterface(interfaceId);
    }
}
