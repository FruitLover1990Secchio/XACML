
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm, deployments} from "hardhat";
import { SmartResource, SmartPolicy_5_0,SmartPolicy_5_1,SmartPolicy_5_2,SmartPolicy_5_3,SmartPolicy_5_4,SmartPolicy_5_5, AMContract} from "../types";
import { expect } from "chai";
import { writeFileSync } from "node:fs";

import { FhevmType } from "@fhevm/hardhat-plugin";

/**
 * @dev
 * - AM: Attribute Manager
 * - RO: Resource Owner
 * - SJ: Subject
 */
type CustomSigners = {
  AM: HardhatEthersSigner;
  RO: HardhatEthersSigner;
  SJ: HardhatEthersSigner;
};

enum RuleEffect {
  PERMIT,
  DENY,
  NOTAPPLICABLE,
  INDETERMINATE,
}

describe("SmartResource_5", function () {
  let signers: CustomSigners;
  let smartResource: SmartResource;
  let smartResourceAddress: string;
  let amContract: AMContract;
  let amContractAddress: string;
  const gasUsed: { [key: number]: bigint | undefined } = {};
  let smartPolicyAddress0: string;
  let smartPolicyAddress1: string;
  let smartPolicyAddress2: string;
  let smartPolicyAddress3: string;
  let smartPolicyAddress4: string;
  let smartPolicyAddress5: string;

  before(async function () {

    try {

      if(!fhevm.isMock){
        console.log("Test suite build for local environment");
        this.skip();
      }

      let Deployement = await deployments.get("SmartPolicy_5_0");
      smartPolicyAddress0 = Deployement.address;

      Deployement = await deployments.get("SmartPolicy_5_1");
      smartPolicyAddress1 = Deployement.address;

      Deployement = await deployments.get("SmartPolicy_5_2");
      smartPolicyAddress2 = Deployement.address;

      Deployement = await deployments.get("SmartPolicy_5_3");
      smartPolicyAddress3 = Deployement.address;

      Deployement = await deployments.get("SmartPolicy_5_4");
      smartPolicyAddress4 = Deployement.address;

      Deployement = await deployments.get("SmartPolicy_5_5");
      smartPolicyAddress5 = Deployement.address;

      Deployement = await deployments.get("AMContract");
      amContractAddress = Deployement.address;
      amContract = await ethers.getContractAt("AMContract", Deployement.address);

      Deployement = await deployments.get("SmartResource");
      smartResourceAddress = Deployement.address;
      smartResource = await ethers.getContractAt("SmartResource", Deployement.address);

    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network localhost'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { AM: ethSigners[0], RO: ethSigners[1], SJ: ethSigners[2] };
  });


it("should update attribute values", async function () {
    if (process.env.ATTRIBUTES_DEPLOYED == "true") {
      this.skip();
    }

    const valueStr = "bachelor student";

    let tx = await amContract.connect(signers.AM).createPublicStringAttribute("subjectRole", signers.SJ, valueStr);
    await tx.wait();

    const avgGrade = 28;
    const encryptedValue = await fhevm
      .createEncryptedInput(amContractAddress, signers.AM.address)
      .add8(avgGrade)
      .encrypt();

    tx = await amContract
      .connect(signers.AM)
      .createPrivateAttribute("gradeAverage", signers.SJ, encryptedValue.handles[0], encryptedValue.inputProof);
    await tx.wait();

    const enrollmentYear = 2;
    tx = await amContract.connect(signers.AM).createPublicIntAttribute("enrollmentYear", signers.SJ, enrollmentYear);
    await tx.wait();
  }).timeout(4 * 10 ** 5);

  it("Test policy with 0 private attributes}", async function () {
    let tx = await smartResource.connect(signers.RO).setPolicy(smartPolicyAddress0);
    tx.wait();

    tx = await smartResource.connect(signers.SJ).requestAccess();
    const receipt = await tx.wait();
    gasUsed[0] = receipt?.gasUsed;
    const logs = (receipt)?.logs;

    if (logs == undefined) {
      return;
    }
    let encryptedResult;
    for (const log of logs) {
      if (log.address == smartResourceAddress) {
        encryptedResult = log.args[1];
      }
    }
    const decryptedResult = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encryptedResult,
      smartResourceAddress,
      signers.SJ,
    );
    expect(decryptedResult).to.eq(RuleEffect.PERMIT);
  }).timeout(4 * 10 * 10**5);

  it("Test policy with 1 private attributes}", async function () {
    let tx = await smartResource.connect(signers.RO).setPolicy(smartPolicyAddress1);
    tx.wait();

    tx = await smartResource.connect(signers.SJ).requestAccess();
    const receipt = await tx.wait();
    gasUsed[1] = receipt?.gasUsed;
    const logs = (receipt)?.logs;

    if (logs == undefined) {
      return;
    }
    let encryptedResult;
    for (const log of logs) {
      if (log.address == smartResourceAddress) {
        encryptedResult = log.args[1];
      }
    }
    const decryptedResult = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encryptedResult,
      smartResourceAddress,
      signers.SJ,
    );
    expect(decryptedResult).to.eq(RuleEffect.PERMIT);
  }).timeout(4 * 10 * 10**5);

  it("Test policy with 2 private attributes}", async function () {
    let tx = await smartResource.connect(signers.RO).setPolicy(smartPolicyAddress2);
    tx.wait();

    tx = await smartResource.connect(signers.SJ).requestAccess();
    const receipt = await tx.wait();
    gasUsed[2] = receipt?.gasUsed;
    const logs = (receipt)?.logs;

    if (logs == undefined) {
      return;
    }
    let encryptedResult;
    for (const log of logs) {
      if (log.address == smartResourceAddress) {
        encryptedResult = log.args[1];
      }
    }
    const decryptedResult = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encryptedResult,
      smartResourceAddress,
      signers.SJ,
    );
    expect(decryptedResult).to.eq(RuleEffect.PERMIT);
  }).timeout(4 * 10 * 10**5);

  it("Test policy with 3 private attributes}", async function () {
    let tx = await smartResource.connect(signers.RO).setPolicy(smartPolicyAddress3);
    tx.wait();

    tx = await smartResource.connect(signers.SJ).requestAccess();
    const receipt = await tx.wait();
    gasUsed[3] = receipt?.gasUsed;
    const logs = (receipt)?.logs;

    if (logs == undefined) {
      return;
    }
    let encryptedResult;
    for (const log of logs) {
      if (log.address == smartResourceAddress) {
        encryptedResult = log.args[1];
      }
    }
    const decryptedResult = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encryptedResult,
      smartResourceAddress,
      signers.SJ,
    );
    expect(decryptedResult).to.eq(RuleEffect.PERMIT);
  }).timeout(4 * 10 * 10**5);

  it("Test policy with 4 private attributes}", async function () {
    let tx = await smartResource.connect(signers.RO).setPolicy(smartPolicyAddress4);
    tx.wait();

    tx = await smartResource.connect(signers.SJ).requestAccess();
    const receipt = await tx.wait();
    gasUsed[4] = receipt?.gasUsed;
    const logs = (receipt)?.logs;

    if (logs == undefined) {
      return;
    }
    let encryptedResult;
    for (const log of logs) {
      if (log.address == smartResourceAddress) {
        encryptedResult = log.args[1];
      }
    }
    const decryptedResult = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encryptedResult,
      smartResourceAddress,
      signers.SJ,
    );
    expect(decryptedResult).to.eq(RuleEffect.PERMIT);
  }).timeout(4 * 10 * 10**5);

  it("Test policy with 5 private attributes}", async function () {
    let tx = await smartResource.connect(signers.RO).setPolicy(smartPolicyAddress5);
    tx.wait();

    tx = await smartResource.connect(signers.SJ).requestAccess();
    const receipt = await tx.wait();
    gasUsed[5] = receipt?.gasUsed;
    const logs = (receipt)?.logs;

    if (logs == undefined) {
      return;
    }
    let encryptedResult;
    for (const log of logs) {
      if (log.address == smartResourceAddress) {
        encryptedResult = log.args[1];
      }
    }
    const decryptedResult = await fhevm.userDecryptEuint(
      FhevmType.euint8,
      encryptedResult,
      smartResourceAddress,
      signers.SJ,
    );
    expect(decryptedResult).to.eq(RuleEffect.PERMIT);
  }).timeout(4 * 10 * 10**5);


  after(function () {
    let evaluationGas = "privateAttributes,gas used\n";
    for(const key in gasUsed) {
      evaluationGas += key.toString() + "," + gasUsed[key]==undefined?"undefined":gasUsed[key]?.toString() + "\n";
    }
    writeFileSync("./testResult/SmartPolicy_5.csv", evaluationGas);    
  });

});
