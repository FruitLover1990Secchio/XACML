// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, externalEuint8, ebool} from "@fhevm/solidity/lib/FHE.sol";
import "hardhat/console.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract AvgGradeGEQVerifier is SepoliaConfig {
    /// @notice Verifies if the average grade is greater than or equal to a specified encrypted value.
    /// @param avgGrade the encrypted input value
    /// @param threshold the threshold value
    function verifyGEQ(euint8 avgGrade, uint8 threshold) external returns (ebool) {
        ebool isGEQ = FHE.ge(avgGrade, FHE.asEuint8(threshold));
        ebool isCorrect = FHE.le(avgGrade, 30); // Assuming 30 is the maximum grade
        ebool result = FHE.and(isGEQ, isCorrect);
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);
        return result;
    }
}
