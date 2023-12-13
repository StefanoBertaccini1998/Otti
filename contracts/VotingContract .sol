// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./utils/DonationVault.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
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
contract VotingContract is OwnableUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    uint256 public votingEndTime;
    uint256 public donationGoal;
    uint256 public donationAmount;
    bool public isVotingClosed;
    uint256 public winningProposalId;
    uint256 public winningDonationVotes;
    Proposal public latestWinner;
    address payable vaultAddress;
    CountersUpgradeable.Counter public proposal_counter;
    mapping(uint256 => Proposal) public proposals;
    address[] public addressRegistered;
    mapping(address => Voter) public voters;
    address public ottiToken;


    struct Proposal {
        bytes32 name;
        uint256 weidhtedVotes;
        uint256 votes;
    }

    struct Voter {
        uint vote;
        uint256 weightVote;
        bool voted;
    }

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
    event NewProposal(bytes32 name);
    event VotingClosed(uint256 winningProposalId, uint256 winningProposalVotes);
    
    function initialize(address payable _vaultAddress, address ottiAddress) external initializer {
        __Ownable_init();
        vaultAddress = _vaultAddress;
        isVotingClosed = true;
        ottiToken = ottiAddress;
    }

    //Function to add proposal to exsiting
    function addProposal(bytes32 name) external onlyOwner {
        uint256 counter = proposal_counter.current();
        proposals[counter] = Proposal(name, 0,0);
        proposal_counter.increment();
        emit NewProposal(name);
    }

    //Function to vote a selected id proposal with fund needed
    function vote(
        uint256 proposalId
    ) external payable onlyDuringVotingPeriod donationRequired onlyNewVoter {
        //Check
        if (proposalId > proposal_counter.current() && proposal_counter.current() == 0) {
            revert proposalNotValid();
        }

        //Donation part
        uint _amount = msg.value;
        donationAmount += _amount;
        moveFound(_amount);

        //Calculate 10% of token to send
        uint amountToSend = _amount / 10;
        SafeERC20.safeTransfer(IERC20(ottiToken), msg.sender, amountToSend);

        //Voter assestment
        addressRegistered.push(msg.sender);
        Voter storage voter = voters[msg.sender];
        voter.vote = proposalId;
        voter.weightVote = _amount;
        voter.voted = true;

        //Weithed vote is recorded as the amount of donation
        Proposal storage prop = proposals[proposalId];
        prop.weidhtedVotes += _amount;
        prop.votes += 1;

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
        emit VotingClosed(winningProposalId, winningDonationVotes);
    }

    //Function to find winning proposal
    function findWinningProposal() internal {
        uint256 maxWeightVotes = 0;
        uint256 maxVotes = 0;
        for (uint256 i = 0; i <= proposal_counter.current(); i++) {
            Proposal storage prop = proposals[i];
            if (prop.weidhtedVotes > maxWeightVotes || prop.weidhtedVotes == maxWeightVotes && prop.votes > maxVotes) {
                maxWeightVotes = prop.weidhtedVotes;
                maxVotes = prop.votes;
                winningProposalId = i;
                winningDonationVotes = maxWeightVotes;
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
            uint256 counter = proposal_counter.current();
            proposals[counter] = Proposal(proposalNames[i], 0, 0);
            proposal_counter.increment();
        }
        isVotingClosed = false;
    }

    //Function to reset all partecipant
    function resetVoters() internal {
        for (uint i = 0; i < addressRegistered.length; i++) {
            Voter storage voter = voters[addressRegistered[i]];
            if (voter.voted) {
                voter.voted = false;
                voter.weightVote = 0;
                voter.vote = 0;
            }
        }
    }

    //Function to empty the proposal array
    function deleteProposal() public {
        proposal_counter.reset();
    }

    function getProposalLength() public view returns (uint256){
        return proposal_counter.current();
    }
}
