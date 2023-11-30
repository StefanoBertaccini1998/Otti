// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AnalyticalCertificateNFT is ERC1155, AccessControlEnumerable {
    using Counters for Counters.Counter;

    //Counter
    Counters.Counter private tokenIdCounter;

    //Role for authorized labs
    bytes32 public constant AUTHORIZED_LAB_ROLE =
        keccak256("AUTHORIZED_LAB_ROLE");

    //Event that is emitted when an analisys is deployed for a new product
    event CertificateAdded(uint256 indexed tokenId, string productHash);

    //Event that is emitted when an analisys is added
    event AnalysisAdded(uint256 indexed tokenId);

    //Constructor
    constructor() ERC1155("uri") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(AUTHORIZED_LAB_ROLE, msg.sender);
    }

    //Function that add new certificate for a new product
    function addCertificate(
        string memory _productHash
    ) external onlyRole(AUTHORIZED_LAB_ROLE) {
        tokenIdCounter.increment();

        uint256 newTokenId = tokenIdCounter.current();

        _mint(address(this), newTokenId, 1, "");

        emit CertificateAdded(newTokenId, _productHash);
    }

    //Function that add analisys to existing product id
    function addAnalysis(
        uint256 _tokenId
    ) external onlyRole(AUTHORIZED_LAB_ROLE) {
        _mint(msg.sender, _tokenId, 1, "");

        emit AnalysisAdded(_tokenId);
    }

    //Funzione that obtain a list of authorized labs
    function addAuthorizedLab(
        address _authorizedLab
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(AUTHORIZED_LAB_ROLE, _authorizedLab);
    }

    //Function needed for coflict interfaces
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
