require("dotenv").config({ quiet: true });
require("./db");
const express = require("express");
const cors = require("cors");
const { apiLimiter, authLimiter, pipelineLimiter } = require("./middleware/rateLimit");
const { authMiddleware } = require("./middleware/auth");
const { discoverPipeline } = require("./controllers/pipeline.controller");
const { generateMessages } = require("./services/ai");
const authController = require("./controllers/auth.controller");
const { sendEmailHandler } = require("./controllers/email.controller");
const betaController = require("./controllers/beta.controller");

const app = express();
app.use(cors({
    origin: ['http://localhost:5173', 'https://reachr.onrender.com'],
}));
app.use(express.json());

app.post("/pipeline/discover", pipelineLimiter, discoverPipeline);

app.get("/auth/google", authLimiter, authController.googleLogin);
app.get("/auth/google/callback", authLimiter, authController.googleCallback);
app.get("/auth/me", authMiddleware, authController.me);
app.post("/send-email", authLimiter, authMiddleware, sendEmailHandler);

app.post("/beta/register", apiLimiter, betaController.register);
app.get("/beta/approve/:id", betaController.approve);
app.get("/admin/beta-signups", authMiddleware, betaController.listSignups);

app.post("/generate-message", pipelineLimiter, async (req, res) => {
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
