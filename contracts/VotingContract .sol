// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./utils/DonationVault.sol";
//import "./utils/PriceConsumer.sol";

//Errors
error timeElapsed();
error timeNotElapsed();
error votingClosed();
error voted();
error votingNotClosed();
error amountZero();
error proposalNotValid();
error proposalNotPending();
error ethNotSent();

//Voting contract system
contract VotingContract is Ownable {
    uint256 public votingEndTime;
    uint256 public donationGoal;
    uint256 public donationAmount;
    bool public isVotingClosed;
    uint256 public winningProposalId;
    uint256 public winningProposalVotes;
    Proposal public latestWinner;
    uint256 public proposalsCount;
    address payable vaultAddress;

    struct Proposal {
        bytes32 name;
        uint256 weidhtedVotes;
    }

    struct Voter {
        uint vote;
        uint256 weightVote;
        bool voted;
    }

    Proposal[] public proposals;

    address[] public addressRegistered;

    mapping(address => Voter) voters;

    //Modifier that check if Voting period is not lapsed
    modifier onlyDuringVotingPeriod() {
        if (block.timestamp > votingEndTime) {
            revert timeElapsed();
        }
        _;
    }

    //Modifier that check if Voting is closed
    modifier onlyClosedVoting() {
        if (!isVotingClosed) {
            revert votingNotClosed();
        }
        _;
    }

    //Modifier that check if Voting period is not lapsed
    modifier onlyNewVoter() {
        if (voters[msg.sender].voted) {
            revert voted();
        }
        _;
    }

    //Modifier that check if Voter has value
    modifier donationRequired() {
        if (msg.value == 0) {
            revert amountZero();
        }
        _;
    }

    event Vote(uint256 indexed proposalId, address indexed voter);
    event VotingClosed(uint256 winningProposalId, uint256 winningProposalVotes);

    constructor(address payable _vaultAddress) {
        vaultAddress = _vaultAddress;
        proposalsCount = 0;
        isVotingClosed = true;
    }

    //Function to add proposal to exsiting
    function addProposal(bytes32 name) external onlyOwner {
        proposals.push(Proposal(name, 0));
        proposalsCount++;
    }

    //Function to vote a selected id proposal with fund needed
    function vote(
        uint256 proposalId
    ) external payable onlyDuringVotingPeriod donationRequired onlyNewVoter {
        //Check
        if (proposalId > proposals.length && proposals.length == 0) {
            revert proposalNotValid();
        }

        //Donation part
        uint _amount = msg.value;
        donationAmount += _amount;
        moveFound(_amount);

        //Voter assestment
        addressRegistered.push(msg.sender);
        Voter storage voter = voters[msg.sender];
        voter.vote = proposalId;
        voter.weightVote = _amount;
        voter.voted = true;

        //Weithed vote is recorded as the amount of donation
        proposals[proposalId].weidhtedVotes += _amount;

        //Event
        emit Vote(proposalId, msg.sender);
    }

    //Function to close voting period
    function closeVoting() external onlyOwner {
        if (block.timestamp <= votingEndTime) {
            revert timeNotElapsed();
        }
        findWinningProposal();
        isVotingClosed = true;
        emit VotingClosed(winningProposalId, winningProposalVotes);
    }

    //Function to find winning proposal
    function findWinningProposal() internal {
        uint256 maxVotes = 0;
        for (uint256 i = 0; i < proposalsCount; i++) {
            if (proposals[i].weidhtedVotes > maxVotes) {
                maxVotes = proposals[i].weidhtedVotes;
                winningProposalId = i;
                winningProposalVotes = maxVotes;
            }
        }
        latestWinner = proposals[winningProposalId];
    }

    //Function to withdraw donations
    function withdrawDonations(
        address payable to,
        uint256 amount
    ) external onlyOwner onlyClosedVoting {
        DonationVault(vaultAddress).withdraw(to, amount);
    }

    //Function to move fund to external vault donations
    function moveFound(uint256 _amount) private {
        (bool sent, ) = payable(vaultAddress).call{value: _amount}("");
        if (!sent) {
            revert ethNotSent();
        }
    }

    //Function to init voting system
    function initVoting(
        uint256 _votingEndTime,
        uint256 _donationGoal,
        bytes32[] memory proposalNames
    ) external onlyOwner onlyClosedVoting {
        resetVoters();
        deleteProposal();
        votingEndTime = _votingEndTime + block.timestamp;
        donationGoal = _donationGoal;
        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal(proposalNames[i], 0));
            proposalsCount++;
        }
        isVotingClosed = false;
    }

    function resetVoters() internal {
        for (uint i = 0; i < addressRegistered.length; i++) {
            Voter storage voter = voters[addressRegistered[i]];
            voter.voted = false;
            voter.weightVote = 0;
            voter.vote = 0;
        }
    }

    function deleteProposal() internal {
        delete proposals;
    }
}
