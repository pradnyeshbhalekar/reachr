require('dotenv').config()
const {findSimilarCompanies} = require('./services/ocean')
const {findCEO} = require('./services/prospeo')
const { sendEmail } = require("./services/brevo");
const { generateEmail } = require("./utils/generateEmail");

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
  const domain = await askQuestion("Enter company domain: ");

  console.log("Starting pipeline");
  console.log("Domain:", domain);

  const companies = await findSimilarCompanies(domain);

  for (const company of companies.slice(0, 1)) {
    const contact = await findCEO(company);
    const contacts = contact ? [contact] : [];

    console.log(`[3/4] Sending emails to ${contacts.length} contacts...`);

    for (const contact of contacts.slice(0, 3)) {
      const emailBody = generateEmail(contact, company);

      console.log(`[4/4] Sending to ${contact.maskedEmail}...`);
      await sendEmail(
        contact.maskedEmail,
        `Quick note, ${contact.name.split(" ")[0]}`,
        `<pre>${emailBody}</pre>`
      );
    }
  }

  rl.close();
}

runPipeline();