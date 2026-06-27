const axios = require("axios");

const GOAL_CONTEXT = {
    job:         "looking for a job opportunity at their company",
    sales:       "trying to sell a product or service to their company",
    partnership: "looking to explore a business partnership or collaboration",
    investment:  "interested in investing in or learning more about their company",
    other:       "reaching out for a general professional connection",
};

async function generateMessages({ contact, company, userName, userBio, goal }) {
    const goalDesc = GOAL_CONTEXT[goal] || GOAL_CONTEXT.other;

    const prompt = `You are helping ${userName} write outreach messages. They are ${goalDesc}.

About ${userName}: ${userBio}

They are reaching out to:
- Name: ${contact.name}
- Title: ${contact.title || "Leader"}
- Company: ${company}

Write two messages:
1. A LinkedIn connection note (max 160 characters, warm and personal, no hashtags)
2. A cold outreach message (3-4 sentences, specific to their role and company, conversational tone, not salesy)

Respond in this exact JSON format:
{
  "linkedin": "...",
  "cold": "..."
}`;

    const response = await axios.post(
        "https://models.inference.ai.azure.com/chat/completions",
        {
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            response_format: { type: "json_object" },
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_AI_KEY}`,
                "Content-Type": "application/json",
            },
        }
    );

    const raw = response.data.choices[0].message.content;
    return JSON.parse(raw);
}

module.exports = { generateMessages };
