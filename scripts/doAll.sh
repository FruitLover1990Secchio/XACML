net="localhost"

mkdir testResult
for i in $(seq 5 5 70)
do
  echo "-----------------------"
  node scripts/SmartPolicy.js --checks $i
  npx hardhat compile -- $net
  node scripts/SmartDeploy.js --checks $i
  npx hardhat deploy --network $net
  node scripts/SmartTest.js --checks $i
  npx hardhat test test/SmartPolicy_$i.ts --network $net

  rm contracts/SmartPolicy_*
  rm deploy/SmartPolicy_*
  rm test/SmartPolicy_$i.ts
  

  echo "-----------------------"
done