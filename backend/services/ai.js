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

Write:
1. A LinkedIn connection note (max 160 characters, warm and personal, no hashtags)
2. A cold outreach message (3-4 sentences, specific to their role and company, conversational tone, not salesy)
3. A short email subject line for the cold outreach message (max 60 characters, specific and non-generic, no clickbait)

Respond in this exact JSON format:
{
  "linkedin": "...",
  "cold": "...",
  "subject": "..."
}`;

    const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            response_format: { type: "json_object" },
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
        }
    );

    const raw = response.data.choices[0].message.content;
    return JSON.parse(raw);
}

module.exports = { generateMessages };
