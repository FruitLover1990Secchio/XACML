// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {FHE, euint8} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import "hardhat/console.sol";

interface IP {
    function evaluatePolicy(address _subject) external returns (euint8);
}

contract SmartResource is SepoliaConfig {
    mapping(address => bool) private accessList;
    address public immutable owner;
    address public policy;

    event signalRequest(address subj, euint8 decision);

    constructor() {
        owner = msg.sender;
    }

    function setPolicy(address newPolicy) public onlyContractOwner {
        policy = newPolicy;
    }

    function setAccessList(address subject) public onlyContractOwner {
        // set one time access
        accessList[subject] = true;
    }

    function requestAccess() public {
        console.log("---Inside requestAccess---");
        euint8 decision = IP(policy).evaluatePolicy(msg.sender);
        FHE.allow(decision, owner);
        FHE.allow(decision, msg.sender);
        console.log("Emitting decision");

        //send the request decision to the RO and subject
        emit signalRequest(msg.sender, decision);
    }

    function accessResource() public {
        require(accessList[msg.sender] == true, "Not authorized. Request access first.");
        accessList[msg.sender] = false;

        // do something like send eth
    }

    modifier onlyContractOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }
}
