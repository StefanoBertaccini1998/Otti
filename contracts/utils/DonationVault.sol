// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

error notEnoughValue();
//Donation Vault System
contract DonationVault is Ownable {

    //receive from VotingSystem
    receive() external payable {}

   function transferOwnershipToContract(address newOwner) external onlyOwner{
    transferOwnership(newOwner);
   }

    //Function that retrieve value from Vault when it is needed
    function withdraw(address payable to, uint256 amount) external onlyOwner{
        if(amount > address(this).balance){
            revert notEnoughValue();
        }
        to.transfer(amount);
    }
}
