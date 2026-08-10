const { OAuth2Client } = require("google-auth-library");

const SCOPES = [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/gmail.send",
];

function createOAuth2Client() {
    return new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
}

function getAuthUrl(state) {
    const client = createOAuth2Client();
    return client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: SCOPES,
        state,
    });
}

async function exchangeCodeForTokens(code) {
    const client = createOAuth2Client();
    const { tokens } = await client.getToken(code);

    const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || null,
        refreshToken: tokens.refresh_token || null,
    };
}

async function getAccessToken(refreshToken) {
    const client = createOAuth2Client();
    client.setCredentials({ refresh_token: refreshToken });
    const { token } = await client.getAccessToken();
    return token;
}

module.exports = { createOAuth2Client, getAuthUrl, exchangeCodeForTokens, getAccessToken };
