// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, externalEuint8, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

interface IAM {
    function getPrivateValue(address subject, string memory attribute) external returns (euint8);

    function getPublicStringValue(address subject, string memory attribute) external view returns (string memory);

    function getPublicIntValue(address subject, string memory attribute) external view returns (int);
}

contract SmartPolicyExample is SepoliaConfig {
    enum RuleEffect {
        PERMIT,
        DENY,
        NOTAPPLICABLE,
        INDETERMINATE
    }

    struct RuleResult {
        ebool evalResult;
        RuleEffect effect;
    }

    address public immutable owner;
    address public immutable am_contract;
    euint8 public immutable grade_threshold;
    int8 public immutable year_threshold = 2;

    constructor(address addr) {
        owner = msg.sender;
        am_contract = addr;
        grade_threshold = FHE.asEuint8(27);
    }

    function evaluateTarget(address _subject) public view returns (bool) {
        string memory _role = IAM(am_contract).getPublicStringValue(_subject, "subjectRole");
        return keccak256(abi.encode(_role)) == keccak256(abi.encode("bachelor student"));
    }

    function evaluateCondition_prize_enrollmentYear(address _subject) internal view returns (bool) {
        int _year = IAM(am_contract).getPublicIntValue(_subject, "enrollmentYear");
        return _year >= year_threshold;
    }

    function evaluateCondition_prize_gradeAverage(address _subject) internal returns (ebool) {
        euint8 _inputs = IAM(am_contract).getPrivateValue(_subject, "gradeAverage");

        return FHE.gt(_inputs, grade_threshold);
    }

    function combining_algorithm(RuleResult memory rule1) internal returns (euint8) {
        //ALGORITHM: FIRST APPLICABLE
        //urn:oasis:names:tc:xacml:1.0:rule-combining-algorithm:first-applicable

        //iterate over all rules and find first match
        return
            FHE.select(
                rule1.evalResult,
                FHE.asEuint8(uint8(rule1.effect)),
                FHE.asEuint8(uint8(RuleEffect.NOTAPPLICABLE))
            );

        /* 
        EXAMPLE for two rules, for n>=2 is just a chain 
        If a rule is evaluated than take its effect => otherwise go to next rule
        
        return FHE.select(
            rule1.evalResult,
            FHE.asEuint8(uint8(rule1.effect)),
            FHE.select(
                rule2.evalResult,
                FHE.asEuint(uint8(rule2.effect)),
                FHE.asEuint8(uint8(RuleEffect.NOTAPPLICABLE))
            )
        );
        */
    }

    function evaluateRule_prize(address _subject) internal returns (RuleResult memory) {
        // evaluation of rule with RuleId="prize"
        // FunctionID = "urn:oasis:names:tc:xacml:1 .0:function:and"
        RuleResult memory res;

        res.evalResult = FHE.and(
            FHE.asEbool(evaluateCondition_prize_enrollmentYear(_subject)),
            evaluateCondition_prize_gradeAverage(_subject)
        );
        res.effect = RuleEffect.PERMIT;
        return res;
    }

    function evaluatePolicy(address _subject) external returns (euint8) {
        euint8 evaluationResult;
        if (!evaluateTarget(_subject)) {
            evaluationResult = FHE.asEuint8(uint8(RuleEffect.NOTAPPLICABLE));
        } else {
            // each Rule evaluation returns its result and its corrisponding effect
            evaluationResult = combining_algorithm(evaluateRule_prize(_subject));
        }

        FHE.allowThis(evaluationResult);
        FHE.allow(evaluationResult, msg.sender);
        return evaluationResult;
    }
}
