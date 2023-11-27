// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DonationVault is Ownable {
    receive() external payable {}

    function withdraw(address payable to, uint256 amount) external onlyOwner {
        require(
            amount <= address(this).balance,
            "Saldo insufficiente nel Vault"
        );
        to.transfer(amount);
    }
}
