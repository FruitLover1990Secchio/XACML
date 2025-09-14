import { argv } from "node:process";
import { writeFileSync } from "node:fs";

const flag = argv[2];
let value_checks;
if (flag == undefined) {
  throw new Error(
    "Need to specify the number of value checks.\nUse node scripts/SmartTest.js --checks [value]\nMin 5 max 70, multiple of 5",
  );
} else if (flag == "--checks") {
  value_checks = parseInt(argv[3]);
  if (isNaN(value_checks)) throw new Error("Number of value checks not recognized");
  if (value_checks % 5 != 0 || value_checks == 0) throw new Error("Number must be multiple of 5");
} else {
  throw new Error("Command line argument not recognized");
}

//create test
const ratio = 5;
let i_vector = [];
for (let i = 0; i <= ratio; i++) {
  i_vector.unshift((ratio - i) * (value_checks / ratio));
}
let base = `
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments, web3 } from "hardhat";
import { SmartPolicy_${value_checks}_${i_vector[0]},SmartPolicy_${value_checks}_${i_vector[1]},SmartPolicy_${value_checks}_${i_vector[2]},SmartPolicy_${value_checks}_${i_vector[3]},SmartPolicy_${value_checks}_${i_vector[4]},SmartPolicy_${value_checks}_${i_vector[5]}, AMContract } from "../types";
import { expect } from "chai";
import { writeFileSync } from "node:fs";

export type Signers = {
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  carol: HardhatEthersSigner;
};

describe("SmartPolicy_${value_checks}", function () {
  let signers: Signers;
  let gasUsed;
  let policy${i_vector[0]}: SmartPolicy_${value_checks}_${i_vector[0]};
  let policy${i_vector[1]}: SmartPolicy_${value_checks}_${i_vector[1]};
  let policy${i_vector[2]}: SmartPolicy_${value_checks}_${i_vector[2]};
  let policy${i_vector[3]}: SmartPolicy_${value_checks}_${i_vector[3]};
  let policy${i_vector[4]}: SmartPolicy_${value_checks}_${i_vector[4]};
  let policy${i_vector[5]}: SmartPolicy_${value_checks}_${i_vector[5]};
  let policyAddress${i_vector[0]}: string;
  let policyAddress${i_vector[1]}: string;
  let policyAddress${i_vector[2]}: string;
  let policyAddress${i_vector[3]}: string;
  let policyAddress${i_vector[4]}: string;
  let policyAddress${i_vector[5]}: string;
  let verifierAddress: string;
  let amContract: AMContract;
  let amContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(++step,"/",steps, " ", message);
  }

  before(async function () {
    if (!fhevm.isMock) {
      console.warn("This hardhat test suite can only run on local network");
      this.skip();
    }

    try {
      const SPDeployement${i_vector[0]} = await deployments.get("SmartPolicy_${value_checks}_${i_vector[0]}");
      policyAddress${i_vector[0]} = SPDeployement${i_vector[0]}.address;
      policy${i_vector[0]} = await ethers.getContractAt("SmartPolicy_${value_checks}_${i_vector[0]}", SPDeployement${i_vector[0]}.address);
      gasUsed[${i_vector[0]}] = (await policy0.deploymentTransaction()?.wait())?.gasUsed;

      const SPDeployement${i_vector[1]} = await deployments.get("SmartPolicy_${value_checks}_${i_vector[1]}");
      policyAddress${i_vector[1]} = SPDeployement${i_vector[1]}.address;
      policy${i_vector[1]} = await ethers.getContractAt("SmartPolicy_${value_checks}_${i_vector[1]}", SPDeployement${i_vector[1]}.address);
      gasUsed[${i_vector[1]}] = (await policy0.deploymentTransaction()?.wait())?.gasUsed;

      const SPDeployement${i_vector[2]} = await deployments.get("SmartPolicy_${value_checks}_${i_vector[2]}");
      policyAddress${i_vector[2]} = SPDeployement${i_vector[2]}.address;
      policy${i_vector[2]} = await ethers.getContractAt("SmartPolicy_${value_checks}_${i_vector[2]}", SPDeployement${i_vector[2]}.address);
      gasUsed[${i_vector[2]}] = (await policy0.deploymentTransaction()?.wait())?.gasUsed;

      const SPDeployement${i_vector[3]} = await deployments.get("SmartPolicy_${value_checks}_${i_vector[3]}");
      policyAddress${i_vector[3]} = SPDeployement${i_vector[3]}.address;
      policy${i_vector[3]} = await ethers.getContractAt("SmartPolicy_${value_checks}_${i_vector[3]}", SPDeployement${i_vector[3]}.address);
      gasUsed[${i_vector[3]}] = (await policy0.deploymentTransaction()?.wait())?.gasUsed;

      const SPDeployement${i_vector[4]} = await deployments.get("SmartPolicy_${value_checks}_${i_vector[4]}");
      policyAddress${i_vector[4]} = SPDeployement${i_vector[4]}.address;
      policy${i_vector[4]} = await ethers.getContractAt("SmartPolicy_${value_checks}_${i_vector[4]}", SPDeployement${i_vector[4]}.address);
      gasUsed[${i_vector[4]}] = (await policy0.deploymentTransaction()?.wait())?.gasUsed;

      const SPDeployement${i_vector[5]} = await deployments.get("SmartPolicy_${value_checks}_${i_vector[5]}");
      policyAddress${i_vector[5]} = SPDeployement${i_vector[5]}.address;
      policy${i_vector[5]} = await ethers.getContractAt("SmartPolicy_${value_checks}_${i_vector[5]}", SPDeployement${i_vector[5]}.address);
      gasUsed[${i_vector[5]}] = (await policy0.deploymentTransaction()?.wait())?.gasUsed;

      const AMDeployement = await deployments.get("AMContract");
      amContractAddress = AMDeployement.address;
      amContract = await ethers.getContractAt("AMContract", AMDeployement.address);

      const Verifier = await deployments.get("AvgGradeGEQVerifier");
      verifierAddress = Verifier.address;
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network localhost'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0], bob: ethSigners[1], carol: ethSigners[2] };

    const valueStr = "bachelor student";
    const param = web3.eth.abi.encodeParameter("string", valueStr);

    let tx = await amContract.connect(signers.alice).createPublicStringAttribute("subjectRole", signers.bob, param);
    await tx.wait();

    const avgGrade = 28;
    const encryptedValue = await fhevm
      .createEncryptedInput(amContractAddress, signers.alice.address)
      .add8(avgGrade)
      .encrypt();

    tx = await amContract
      .connect(signers.alice)
      .createPrivateAttribute("gradeAverage", signers.bob, encryptedValue.handles[0], encryptedValue.inputProof);
    await tx.wait();

    tx = await amContract.connect(signers.alice).allowVerifier(signers.bob, "gradeAverage", verifierAddress);
    await tx.wait();

    tx = await amContract.connect(signers.alice).createPublicIntAttribute("enrollmentYear", signers.bob, 2);
    await tx.wait();
  });

    beforeEach(async () => {
    step = 0;
    steps = 0;
  });
`;
for (const priv of i_vector) {
  base += `
  it("Test SmartPolicy${value_checks}_${priv}", async function () {
    steps = 3;
    progress("Calling evaluate...");
    const tx = await policy${priv}.connect(signers.bob).evaluate(signers.bob, amContractAddress, verifierAddress);
    await tx.wait();  

    progress("Retrieving result...");
    const encryptedResult = await policy${priv}.connect(signers.bob).evaluationResult();
    progress("Decrypting final result...");
    const decryptedResult = await fhevm.userDecryptEbool(encryptedResult, policyAddress${priv}, signers.bob);

    expect(decryptedResult).to.eq(true);
  });
`;
}

base += `
});
`;

writeFileSync(`./test/SmartPolicy_${value_checks}.ts`, base);
