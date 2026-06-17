const axios = require("axios");

async function findCEO(domain) {
    try {
        const response = await axios.post(
            "https://api.apollo.io/v1/mixed_people/search",
            {
                person_titles: ["CEO", "Co-Founder", "Founder", "Co-CEO"],
                organization_domains: [domain],
                page: 1,
                per_page: 1,
            },
            {
                headers: {
                    "x-api-key": process.env.APOLLO_API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );

        const people = response.data.people || [];
        if (people.length === 0) return null;

        const person = people[0];

        return {
            name: person.name || null,
            title: person.title || null,
            linkedin: person.linkedin_url || null,
            domain,
        };
    } catch (err) {
        console.error(`Apollo error for ${domain}:`, err.response?.data || err.message);
        return null;
    }
}

module.exports = { findCEO };
