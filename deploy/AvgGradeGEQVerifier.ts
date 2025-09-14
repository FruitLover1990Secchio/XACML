import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedAM = await deploy("AvgGradeGEQVerifier", {
    from: deployer,
    log: true,
  });

  console.log(`Deployed by : ${deployer} at ${deployedAM.address}`);
};
export default func;
func.id = "deploy_AVGContract"; // id required to prevent reexecution
func.tags = ["AVGContract"];
