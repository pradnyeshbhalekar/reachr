const jwt = require("jsonwebtoken");
const { getAuthUrl, exchangeCodeForTokens } = require("../services/google");
const { encrypt } = require("../services/crypto");
const { upsertUser, getUserById } = require("../db");

function googleLogin(req, res) {
    const state = jwt.sign({ purpose: "oauth-state" }, process.env.JWT_SECRET, { expiresIn: "10m" });
    res.redirect(getAuthUrl(state));
}

async function googleCallback(req, res) {
    const { code, state } = req.query;

    try {
        jwt.verify(state, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).send("Invalid or expired OAuth state");
    }

    if (!code) {
        return res.status(400).send("Missing authorization code");
    }

    try {
        const { googleId, email, name, refreshToken } = await exchangeCodeForTokens(code);

        const user = await upsertUser({
            googleId,
            email,
            name,
            encryptedRefreshToken: refreshToken ? encrypt(refreshToken) : null,
        });

        const token = jwt.sign(
            { sub: user.id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        res.redirect(`${process.env.FRONTEND_URL}/?authToken=${token}`);
    } catch (err) {
        console.error("Google OAuth callback error:", err.response?.data || err.message);
        res.status(500).send("Google sign-in failed");
    }
}

async function me(req, res) {
    const user = await getUserById(req.user.sub);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    res.json({ id: user.id, email: user.email, name: user.name });
}

module.exports = { googleLogin, googleCallback, me };
