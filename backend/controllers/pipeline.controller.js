const { findSimilarCompanies } = require("../services/ocean");
const { findCEO } = require("../services/prospeo");
const { sendEmail } = require("../services/brevo");
const { generateEmail } = require("../utils/generateEmail");

// SSE helper
function sseWrite(res, event, data) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// Phase 1: discover companies + contacts, stream progress via SSE
async function discoverPipeline(req, res) {
    const { domain } = req.body;

    if (!domain) {
        return res.status(400).json({ error: "domain is required" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    try {
        sseWrite(res, "progress", { message: `Searching for companies similar to ${domain}…`, status: "running" });

        const companies = await findSimilarCompanies(domain);

        if (companies.length === 0) {
            sseWrite(res, "progress", { message: "No similar companies found.", status: "done" });
            sseWrite(res, "complete", { inputDomain: domain, totalCompanies: 0, results: [] });
            return res.end();
        }

        sseWrite(res, "progress", { message: `Found ${companies.length} similar companies.`, status: "done" });

        const results = [];

        for (const company of companies) {
            sseWrite(res, "progress", { message: `Looking up decision maker at ${company}…`, status: "running" });

            const contact = await findCEO(company);

            if (!contact) {
                sseWrite(res, "progress", { message: `No contact found for ${company}.`, status: "skip" });
                results.push({ domain: company, contact: null });
            } else {
                const emailDraft = generateEmail(contact, company);
                sseWrite(res, "progress", {
                    message: `Found ${contact.name || "contact"} at ${company}.`,
                    status: "done",
                });
                results.push({
                    domain: company,
                    contact: {
                        name: contact.name,
                        title: contact.title,
                        linkedin: contact.linkedin,
                        email: contact.email,
                        maskedEmail: contact.maskedEmail,
                    },
                    emailDraft,
                });
            }

            await new Promise((r) => setTimeout(r, 1500));
        }

        sseWrite(res, "complete", {
            inputDomain: domain,
            totalCompanies: companies.length,
            results,
        });

        res.end();
    } catch (err) {
        console.error("Discover error:", err.message);
        sseWrite(res, "error", { message: err.message });
        res.end();
    }
}

// Phase 2: send emails with (possibly edited) drafts
async function sendEmails(req, res) {
    const { contacts } = req.body;
    // contacts: [{ name, email, emailBody }]

    if (!contacts || !Array.isArray(contacts)) {
        return res.status(400).json({ error: "contacts array is required" });
    }

    const results = [];

    for (const c of contacts) {
        if (!c.email) {
            results.push({ name: c.name, status: "no_email" });
            continue;
        }
        try {
            await sendEmail(
                c.email,
                `Quick note, ${(c.name || "there").split(" ")[0]}`,
                `<pre>${c.emailBody}</pre>`
            );
            results.push({ name: c.name, email: c.email, status: "sent" });
        } catch (err) {
            results.push({ name: c.name, email: c.email, status: "failed", error: err.message });
        }
    }

    res.json({ results });
}

module.exports = { discoverPipeline, sendEmails };
