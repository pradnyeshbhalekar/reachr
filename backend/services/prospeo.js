const axios = require("axios");

async function prospeoPost(url, body) {
    const config = {
        headers: {
            "X-KEY": process.env.PROSPEO_API_KEY,
            "Content-Type": "application/json",
        },
    };
    try {
        return await axios.post(url, body, config);
    } catch (err) {
        const code = err.response?.data?.error_code;
        if (code === "Rate limit exceeded") {
            await new Promise(r => setTimeout(r, 20000));
            return axios.post(url, body, config);
        }
        throw err;
    }
}

async function findCEO(domain) {
    try {
        const searchRes = await prospeoPost(
            "https://api.prospeo.io/search-person",
            {
                page: 1,
                filters: {
                    company: {
                        websites: { include: [domain] },
                    },
                    person_seniority: {
                        include: ["Founder/Owner", "C-Suite"],
                    },
                },
            }
        );

        const results = searchRes.data.results || [];
        if (results.length === 0) return null;

        const person = results[0].person || {};

        return {
            name: person.full_name || null,
            title: person.current_job_title || null,
            linkedin: person.linkedin_url || null,
            email: null,
            maskedEmail: person.email?.masked_email || person.masked_email || null,
            domain,
        };
    } catch (err) {
        console.error(`Prospeo error for ${domain}:`, err.response?.data || err.message);
        return null;
    }
}

module.exports = { findCEO };
