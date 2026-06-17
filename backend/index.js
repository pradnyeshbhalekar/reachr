require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { apiLimiter } = require("./middleware/rateLimit");
const { discoverPipeline } = require("./controllers/pipeline.controller");
const { generateMessages } = require("./services/ai");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/pipeline/discover", apiLimiter, discoverPipeline);

app.post("/generate-message", async (req, res) => {
    const { contact, company, userName, userBio, goal } = req.body;
    if (!contact || !company || !userName || !goal) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    try {
        const messages = await generateMessages({ contact, company, userName, userBio, goal });
        res.json(messages);
    } catch (err) {
        console.error("AI error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to generate message" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
