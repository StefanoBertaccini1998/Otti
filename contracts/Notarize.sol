// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

error docAlreadyRegistered();
error indexNotFound();

//Basic contract of notarization
contract Notarize is AccessControlEnumerable {

    //Se volessimo introdurre anche la notarizzazione sugli NFT per garantirne l'hash e le versioni
    using Counters for Counters.Counter;

    //Create new role for address
    //TODO Probabilmente l'autore che può mintare è lo stesso che può accedere alla notarizzazione
    bytes32 public constant HASH_WRITER = keccak256("HASH_WRITER");

    Counters.Counter private _docCounter;
    mapping(uint256 => Doc) private _documents;
    mapping(bytes32 => bool) private _regHashes;

    event DocHashAdded(
        uint256 indexed docCounter,
        string docUrl,
        bytes32 dochash
    );
    
    struct Doc {
        string docUrl; //URI of the document that exist off-chain
        bytes32 docHash; //Hash of the document
    }

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
   }

    function setHashWriterRole(
        address _hashWriter
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(HASH_WRITER, _hashWriter);
    }
    function removeHashWriterRole(address _hashWriter) external onlyRole (DEFAULT_ADMIN_ROLE) {
        revokeRole(HASH_WRITER,_hashWriter);
    }

    function addNewDocument(
        string memory _url,
        bytes32 _hash
    ) external onlyRole(HASH_WRITER) {
        if(_regHashes[_hash]){
            revert docAlreadyRegistered();
        }
        uint256 counter = _docCounter.current();
        _documents[counter] = Doc({docUrl: _url, docHash: _hash});
        _regHashes[_hash] = true;
        _docCounter.increment();
        emit DocHashAdded(counter, _url, _hash);
    }

    function getDocInfo(
        uint256 _num
    ) external view returns (string memory, bytes32) {
        if(_num > _docCounter.current()){
            revert indexNotFound();
        }
        return (_documents[_num].docUrl, _documents[_num].docHash);
    }

    function getDocsCount() external view returns (uint256) {
        return _docCounter.current();
    }

    function getRegisteredHash(bytes32 _hash) external view returns (bool) {
        return _regHashes[_hash];
    }
}
