// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, externalEuint8, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import "hardhat/console.sol";

contract AMContract is SepoliaConfig {
    mapping(address => mapping(string => euint8)) public privateAttributes;
    mapping(address => mapping(string => bytes)) public publicStringAttributes;
    mapping(address => mapping(string => int)) public publicIntAttributes;

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function createPrivateAttribute(
        string memory attribute,
        address subject,
        externalEuint8 val,
        bytes calldata inputProof
    ) public onlyContractOwner {
        privateAttributes[subject][attribute] = FHE.fromExternal(val, inputProof);
        FHE.allowThis(privateAttributes[subject][attribute]);
        FHE.allow(privateAttributes[subject][attribute], msg.sender);
    }

    function createPublicStringAttribute(
        string memory attribute,
        address subject,
        bytes memory val
    ) public onlyContractOwner {
        publicStringAttributes[subject][attribute] = val;
    }

    function createPublicIntAttribute(string memory attribute, address subject, int val) public onlyContractOwner {
        publicIntAttributes[subject][attribute] = val;
    }

    function getPrivateValue(address subject, string memory attribute) external view returns (euint8) {
        return privateAttributes[subject][attribute];
    }

    function getPublicStringValue(address subject, string memory attribute) external view returns (bytes memory) {
        return publicStringAttributes[subject][attribute];
    }

    function getPublicIntValue(address subject, string memory attribute) external view returns (int) {
        return publicIntAttributes[subject][attribute];
    }

    modifier onlyContractOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function");
        _;
    }

    // nel modello di Damiano, AM rilascia sia i contratti con gli attributi(questo) sia
    //i verificatori, deve essere l'AM a fornire a quest'ultimi l'accesso ai cyphertext
    function allowVerifier(address subject, string memory attribute, address verifier) public onlyContractOwner {
        FHE.allow(privateAttributes[subject][attribute], verifier);
    }
}
