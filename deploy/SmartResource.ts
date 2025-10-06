import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedAM = await deploy("SmartResource", {
    from: deployer,
    log: true,
  });

  console.log(`Deployed by : ${deployer} at ${deployedAM.address}`);
};
export default func;
func.id = "deploy_SmartResource"; // id required to prevent reexecution
func.tags = ["SmartResource"];
