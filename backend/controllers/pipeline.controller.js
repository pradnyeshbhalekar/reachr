const { findSimilarCompanies } = require("../services/ocean");
const { findCEO } = require("../services/hunter");

function sseWrite(res, event, data) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

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
        console.log(`[pipeline] start domain=${domain}`);
        sseWrite(res, "progress", { message: `Searching for companies similar to ${domain}…`, status: "running" });

        const companies = await findSimilarCompanies(domain);
        console.log(`[pipeline] findSimilarCompanies -> ${companies.length} companies:`, companies);

        if (companies.length === 0) {
            console.log("[pipeline] no companies found, ending");
            sseWrite(res, "progress", { message: "No similar companies found.", status: "done" });
            sseWrite(res, "complete", { inputDomain: domain, totalCompanies: 0, results: [] });
            return res.end();
        }

        sseWrite(res, "progress", { message: `Found ${companies.length} similar companies.`, status: "done" });

        const results = [];

        for (const company of companies.slice(0, 1)) {
            console.log(`[pipeline] looking up decision maker for ${company}`);
            sseWrite(res, "progress", { message: `Looking up decision maker at ${company}…`, status: "running" });

            const contact = await findCEO(company);
            console.log(`[pipeline] findCEO(${company}) ->`, contact);

            if (!contact) {
                sseWrite(res, "progress", { message: `No contact found for ${company}.`, status: "skip" });
                results.push({ domain: company, contact: null });
            } else {
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
                    },
                });
            }

            await new Promise((r) => setTimeout(r, 500));
        }

        console.log(`[pipeline] complete, totalCompanies=${companies.length}, results=`, results);
        sseWrite(res, "complete", {
            inputDomain: domain,
            totalCompanies: companies.length,
            results,
        });

        res.end();
    } catch (err) {
        console.error("[pipeline] Discover error:", err.message);
        sseWrite(res, "error", { message: err.message });
        res.end();
    }
}

module.exports = { discoverPipeline };
