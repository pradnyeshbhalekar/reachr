require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { apiLimiter } = require("./middleware/rateLimit");
const { discoverPipeline, sendEmails } = require("./controllers/pipeline.controller");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/pipeline/discover", apiLimiter, discoverPipeline);
app.post("/pipeline/send", apiLimiter, sendEmails);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
