// // SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//Basic contract of token utility
//The scope of this token is future release of fedelity rewards
contract Otti is Ownable, ERC20 {
    constructor(
        string memory _name,
        string memory _sym,
        uint256 _initialSupply
    ) ERC20(_name, _sym) {
        _mint(msg.sender, _initialSupply * (uint(1e18)));
    }
}
