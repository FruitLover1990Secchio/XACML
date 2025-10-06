import { writeFileSync } from "node:fs";
import { argv } from "node:process";

const flag = argv[2];
let tick;
if (flag == undefined) {
  throw new Error(
    "Need to specify the number of value checks.\nUse node scripts/SmartPolicy.js --checks [value]\nMin 5 max 70, multiple of 5",
  );
} else if (flag == "--checks") {
  tick = parseInt(argv[3]);
  if (isNaN(tick)) throw new Error("Number of value checks not recognized");
  if (tick % 5 != 0 || tick == 0) throw new Error("Number must be multiple of 5");
} else {
  throw new Error("Command line argument not recognized");
}

const ratio = 5;

let SmartPolicy = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint8, externalEuint8, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

interface IAM {
  function getPrivateValue(address subject, string memory attribute) external returns (euint8);
  function getPublicStringValue(address subject, string memory attribute) external view returns (string memory);
  function getPublicIntValue(address subject, string memory attribute) external view returns (int);
}

`;
for (let i = 0; i <= ratio; i++) {
  let predicates_priv_and = "";
  //scriviamo i predicati su attributi privati
  let private_functions = "";
  const total_private_functions = (ratio - i) * (tick / ratio);
  for (let k = 0; k < total_private_functions; k++) {
    if (k == 0) {
      predicates_priv_and += `ebool temp = evaluatePredicate_prize_gradeAverage${k}(_subject, am);
            `;
    } else {
      predicates_priv_and += `temp = FHE.and(temp, evaluatePredicate_prize_gradeAverage${k}(_subject, am));  
            `;
    }
    private_functions += `    function evaluatePredicate_prize_gradeAverage${k}(
        address _subject,
        address am
    ) public returns (ebool) {
        euint8 _inputs = IAM(am).getPrivateValue(_subject, "gradeAverage");

        return FHE.gt(_inputs, FHE.asEuint8(threshold));
    }

`;
  }

  // RAGIONAMENTO: inizialmente i = 0 e ratio = 5 -> primo for fa 5 esecuzioni, mentre il secondo for nemmeno una
  // poi i = 1 -> quindi k = 0; k<4 -> 4 esecuzione mentre il secondo for k = 1 che è maggiore di 0 e fa un'esecuzione, ok
  // con i  = ratio => k = 0 e k<0? no -> nessun privato mentre 5 pubblici ok
  // RAGIONAMENTO SEGUENTE: adesso però bisogna moltiplicare per i ticks ... NO viene troppo grande
  // .....  => se sono tick = 20 abbiamo bisogno di 6 partizioni così
  // (20, 0) - (16, 4) - (12, 8) - (8, 12) - (4, 16) - (0, 20)

  // scriviamo i predicati su attributi pubblici
  let predicates_pub_and = "";
  let public_functions = "";
  for (let k = tick - total_private_functions; k > 0; k--) {
    // con i predicati su attributi pubblici abbiamo una cosa del tipo
    // bool result = evaluate() && evaluate() &&
    if (k == 1) {
      predicates_pub_and += ` evaluatePredicate_prize_enrollmentYear${k}(_subject, am);
      ebool pub_res = FHE.asEbool(result);`;
    } else {
      predicates_pub_and += `evaluatePredicate_prize_enrollmentYear${k}(_subject, am) && `;
    }
    public_functions += `    function evaluatePredicate_prize_enrollmentYear${k}(address _subject, address am) public view returns (bool) {
    int _year = IAM(am).getPublicIntValue(_subject, "enrollmentYear");
    return _year >= 2;
  }
`;
  }
  let evaluationResult;
  if (i == 0) {
    //no attributi pubblici
    evaluationResult = `evaluationResult = temp;`;
  } else {
    predicates_pub_and = "bool result = " + predicates_pub_and;
    if (i == ratio) {
      evaluationResult = `evaluationResult = pub_res;`;
    } else {
      evaluationResult = `evaluationResult = FHE.and(temp, pub_res);`;
    }
  }
  const tempPolicy =
    SmartPolicy +
    `
contract SmartPolicy_${tick}_${total_private_functions} is SepoliaConfig {
  address immutable public owner;
  ebool public evaluationResult;
  uint8 public threshold = 27;
  constructor() {
    owner = msg.sender;
  }
  function evaluateTarget(address _subject, address am) public view returns (bool) {
    // change the address with the real one
    string memory _role = IAM(am).getPublicStringValue(_subject, "subjectRole");
    return keccak256(abi.encode(_role)) == keccak256(abi.encode("bachelor student"));
  }
` +
    public_functions +
    private_functions +
    `
  function evaluate(address _subject, address am) public {
    if (!evaluateTarget(_subject, am)) {
      evaluationResult = FHE.asEbool(false); // NOT APPLICABLE
    } else {
      ${predicates_pub_and}
      ${predicates_priv_and}
      ${evaluationResult}
    }
    FHE.allowThis(evaluationResult);
    FHE.allow(evaluationResult, msg.sender);
  }
}
`;

  //stampa con formato SmartPolicy_k_l.sol con k il numero di operazioni e l il numero di operazioni su attributi privati
  writeFileSync(`./contracts/SmartPolicy_${tick}_${total_private_functions}.sol`, tempPolicy);
}
