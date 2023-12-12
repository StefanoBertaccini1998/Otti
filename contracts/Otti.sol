// // SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//Basic contract of token utility
//The scope of this token is future release of fedelity rewards
contract Otti is Ownable, ERC20 {
    constructor(string memory _name, string memory _sym) ERC20(_name, _sym) {}

    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }

    function transferOwnershipToContract(
        address newOwner,
        uint256 _initialSupply
    ) external onlyOwner {
        transferOwnership(newOwner);
        _mint(newOwner, _initialSupply * (uint(1e18)));
    }
}
