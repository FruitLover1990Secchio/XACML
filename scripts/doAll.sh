net="localhost"

mkdir testResult
rm testResult/*
rm contracts/SmartPolicy_*
rm deploy/SmartPolicy_*
rm test/SmartPolicy_*
for i in $(seq 5 5 70)
do
  echo "-----------------------"

  node scripts/SmartPolicy.js --checks $i
  node scripts/SmartDeploy.js --checks $i
  node scripts/SmartTest.js --checks $i
  npx hardhat deploy --network $net
  npx hardhat test test/SmartPolicy_$i.ts --network $net
  export ATTRIBUTES_DEPLOYED=true
  rm contracts/SmartPolicy_*
  rm deploy/SmartPolicy_*
  rm test/SmartPolicy_$i.ts
  

  echo "-----------------------"
done

export ATTRIBUTES_DEPLOYED=false