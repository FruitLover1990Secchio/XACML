import { argv } from "node:process";
import { writeFileSync } from "node:fs";

const flag = argv[2];
let value_checks;
if (flag == undefined) {
  throw new Error(
    "Need to specify the number of value checks.\nUse node scripts/SmartDeploy.js --checks [value]\nMin 5 max 70, multiple of 5",
  );
} else if (flag == "--checks") {
  value_checks = parseInt(argv[3]);
  if (isNaN(value_checks)) throw new Error("Number of value checks not recognized");
  if (value_checks % 5 != 0 || value_checks == 0) throw new Error("Number must be multiple of 5");
} else {
  throw new Error("Command line argument not recognized");
}

const ratio = 5;
const deploy_base = `
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
`;

for (let i = 0; i <= ratio; i++) {
  const total_private_functions = (ratio - i) * (value_checks / ratio);
  const deploy_final =
    deploy_base +
    `

  const deployedSP = await deploy("SmartPolicy_${value_checks}_${total_private_functions}", {
    from: deployer,
    log: true,
  });
  console.log("Deployed by : ", deployer, " at ", deployedSP.address);
};
export default func;
func.id = "deploy_SmartPolicy_${value_checks}_${total_private_functions}"; // id required to prevent reexecution
func.tags = ["SmartPolicy_${value_checks}_${total_private_functions}"];
`;
  writeFileSync(`./deploy/SmartPolicy_${value_checks}_${total_private_functions}.ts`, deploy_final);
}
