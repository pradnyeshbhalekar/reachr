const axios = require("axios");

const SENIORITY_KEYWORDS = ["ceo", "founder", "co-founder", "chief executive", "owner", "director", "president"];

async function findCEO(domain) {
    try {
        console.log(`[hunter] searching domain=${domain}`);
        const response = await axios.get(
            "https://api.hunter.io/v2/domain-search",
            {
                params: {
                    domain,
                    api_key: process.env.HUNTER_API_KEY,
                    limit: 10,
                },
            }
        );

        const emails = response.data?.data?.emails || [];
        console.log(`[hunter] domain=${domain} -> ${emails.length} emails found`);
        if (emails.length === 0) return null;

        // Prefer CEO/Founder by position, fall back to first result
        const top =
            emails.find(e =>
                SENIORITY_KEYWORDS.some(kw =>
                    (e.position || "").toLowerCase().includes(kw)
                )
            ) || emails[0];

        const result = {
            name: [top.first_name, top.last_name].filter(Boolean).join(" ") || null,
            title: top.position || null,
            linkedin: top.linkedin || null,
            email: top.confidence >= 90 ? top.value : null,
            domain,
        };
        console.log(`[hunter] domain=${domain} chosen contact:`, result);
        return result;
    } catch (err) {
        console.error(`[hunter] error for ${domain}:`, err.response?.status, err.response?.data || err.message);
        return null;
    }
}

module.exports = { findCEO };
