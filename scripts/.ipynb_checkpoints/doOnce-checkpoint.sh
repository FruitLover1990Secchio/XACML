net="sepolia"

mkdir testResult
echo "-----------------------"
node scripts/SmartPolicy.js --checks $1
npx hardhat compile --network $net
node scripts/SmartDeploy.js --checks $1
npx hardhat deploy --network $net
node scripts/SmartTest.js --checks $1
npx hardhat test test/SmartPolicy_$1.ts --network $net

echo "-----------------------"