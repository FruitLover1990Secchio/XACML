import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, deployments, fhevm } from "hardhat";
import { AMContract, SmartResource, SmartPolicyExample } from "../types";
import { expect } from "chai";
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

describe("SmartResource", function () {
  let signers: CustomSigners;
  let smartResource: SmartResource;
  let smartResourceAddress: string;
  let amContract: AMContract;
  let amContractAddress: string;
  let smartPolicy: SmartPolicyExample;
  let smartPolicyAddress: string;

  before(async function () {
    let Deployement = await deployments.get("SmartResource");
    smartResourceAddress = Deployement.address;
    smartResource = await ethers.getContractAt("SmartResource", Deployement.address);

    Deployement = await deployments.get("AMContract");
    amContractAddress = Deployement.address;
    amContract = await ethers.getContractAt("AMContract", Deployement.address);

    Deployement = await deployments.get("SmartPolicyExample");
    smartPolicyAddress = Deployement.address;
    smartPolicy = await ethers.getContractAt("SmartPolicyExample", Deployement.address);

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
});
