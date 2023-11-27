// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

//Errors
error timeElapsed();
error timeNotElapsed();
error votingClosed();
error votingNotClosed();
error amountZero();
error proposalNotValid();
error proposalNotPending();

// Contratto di votazione
contract VotingContract is Ownable {
    address public vaultAddress;
    uint256 public votingEndTime;
    uint256 public donationGoal;
    bool public isVotingClosed;
    uint256 public winningProposalId;
    uint256 public winningProposalVotes;
    uint256 public proposalsCount;

    struct Proposal {
        string name;
        uint256 votes;
    }

    mapping(uint256 => Proposal) public proposals;

    modifier onlyDuringVotingPeriod() {
        if (block.timestamp > votingEndTime) {
            timeElapsed();
        }
        _;
    }

    modifier onlyIfVotingOpen() {
        if (isVotingClosed) {
            revert votingClosed();
        }
        _;
    }

    modifier donationRequired() {
        if (msg.value == 0) {
            revert amountZero();
        }
        _;
    }

    event Vote(uint256 indexed proposalId, address indexed voter);
    event VotingClosed(uint256 winningProposalId, uint256 winningProposalVotes);

    constructor(
        address _vaultAddress,
        uint256 _votingEndTime,
        uint256 _donationGoal
    ) {
        vaultAddress = _vaultAddress;
        votingEndTime = _votingEndTime;
        donationGoal = _donationGoal;
        isVotingClosed = false;
        proposalsCount = 0;
    }

    function addProposal(string memory name) external onlyOwner {
        proposalsCount++;
        proposals[proposalsCount] = Proposal(name, 0);
    }

    function vote(
        uint256 proposalId
    )
        external
        payable
        onlyDuringVotingPeriod
        onlyIfVotingOpen
        donationRequired
    {
        if (proposalId == 0) {
            revert proposalNotValid();
        }

        proposals[proposalId].votes += 1;
        // DonationVault(vaultAddress).receive{value: msg.value}();

        emit Vote(proposalId, msg.sender);
    }

    function closeVoting() external onlyOwner {
        if (block.timestamp <= votingEndTime) {
            revert timeNotElapsed();
        }

        findWinningProposal();

        isVotingClosed = true;
        emit VotingClosed(winningProposalId, winningProposalVotes);
    }

    function findWinningProposal() internal {
        uint256 maxVotes = 0;
        for (uint256 i = 1; i <= proposalsCount; i++) {
            if (proposals[i].votes > maxVotes) {
                maxVotes = proposals[i].votes;
                winningProposalId = i;
                winningProposalVotes = maxVotes;
            }
        }
    }

    function withdrawDonations(
        address payable to,
        uint256 amount
    ) external onlyOwner {
        if (!isVotingClosed) {
            revert votingNotClosed();
        }
        //DonationVault(vaultAddress).withdraw(to, amount);
    }
}
