const axios = require("axios");

async function findDecisionMakers(domain) {
    try {
        console.log(`[2/4] Finding contacts for ${domain}`);

        const searchResponse = await axios.post(
            "https://api.prospeo.io/search-person",
            {
                page: 1,
                filters: {
                    company: {
                        websites: {
                            include: [domain],
                        },
                    },
                    person_seniority: {
                        include: ["Founder/Owner", "C-Suite", "VP"],
                    },
                },
            },
            {
                headers: {
                    "X-KEY": process.env.PROSPEO_API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );

        const results = searchResponse.data.results || [];
        console.log(`Found ${results.length} potential contacts. Fetching emails..`);

        const contacts = [];

        for (const item of results) {
            const personId = item.person?.person_id;
            const name = item.person?.full_name;
            const title = item.person?.current_job_title;
            const linkedin = item.person?.linkedin_url;

            if (!personId) continue;

            try {
                const enrichResponse = await axios.post(
                    "https://api.prospeo.io/enrich-person",
                    {
                        only_verified_email: true,
                        data: {
                            person_id: personId,
                        },
                    },
                    {
                        headers: {
                            "X-KEY": process.env.PROSPEO_API_KEY,
                            "Content-Type": "application/json",
                        },
                    }
                );

                const email = enrichResponse.data.person?.email?.email;
                const emailStatus = enrichResponse.data.person?.email?.status;

                if (email) {
                    contacts.push({ name, title, linkedin, email, emailStatus });
                    console.log(`${name} — ${email}`);
                } else {
                    console.log(`${name} — no verified email`);
                }

            } catch (enrichErr) {
                console.log(`${name} — enrich failed:`, enrichErr.response?.data || enrichErr.message);
            }
            await new Promise((res) => setTimeout(res, 500));
        }

        console.log(`Contacts with verified emails: ${contacts.length}`);
        return contacts;

    } catch (err) {
        console.log("Prospeo Error:", err.response?.data || err.message);
        return [];
    }
}

module.exports = { findDecisionMakers };


