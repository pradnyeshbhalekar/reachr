require('dotenv').config()
const {findSimilarCompanies} = require('./services/ocean')

const readline = require("readline")

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
}) 

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function runPipeline() {
  const domain = await askQuestion(
    "Enter company domain: " 
);

console.log("Starting pipeline");
console.log("Domain: ",domain)
const companies = await findSimilarCompanies(domain)

rl.close()
}

runPipeline();
