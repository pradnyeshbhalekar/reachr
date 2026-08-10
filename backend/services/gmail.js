const axios = require("axios");

function base64url(input) {
    return Buffer.from(input)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

async function sendEmail({ accessToken, to, subject, body, html = false }) {
    const message = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: ${html ? "text/html" : "text/plain"}; charset=utf-8`,
        "",
        body,
    ].join("\r\n");

    try {
        const response = await axios.post(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
            { raw: base64url(message) },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (err) {
        console.error("Gmail send error:", err.response?.data || err.message);
        throw err;
    }
}

module.exports = { sendEmail };
