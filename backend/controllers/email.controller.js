const { getUserById } = require("../db");
const { decrypt } = require("../services/crypto");
const { getAccessToken } = require("../services/google");
const { sendEmail } = require("../services/gmail");
const { emailTemplate } = require("../services/emailTemplate");

async function sendEmailHandler(req, res) {
    const { to, subject, body } = req.body;
    if (!to || !subject || !body) {
        return res.status(400).json({ error: "to, subject, and body are required" });
    }

    const user = await getUserById(req.user.sub);
    if (!user || !user.encrypted_refresh_token) {
        return res.status(401).json({ error: "Google account not connected. Please sign in again." });
    }

    try {
        const refreshToken = decrypt(user.encrypted_refresh_token);
        const accessToken = await getAccessToken(refreshToken);
        const result = await sendEmail({ accessToken, to, subject, body });

        try {
            const confirmationHtml = emailTemplate({
                heading: "Your message was sent",
                bodyLines: [
                    `Your outreach email to <strong>${to}</strong> went out successfully.`,
                    `<strong>Subject:</strong> ${subject}`,
                ],
            });
            await sendEmail({
                accessToken,
                to: user.email,
                subject: `Sent: ${subject}`,
                body: confirmationHtml,
                html: true,
            });
        } catch (confirmErr) {
            console.error("Send confirmation email error:", confirmErr.response?.data || confirmErr.message);
        }

        res.json({ success: true, id: result.id });
    } catch (err) {
        const code = err.response?.data?.error;
        if (err.response?.status === 401 || code === "invalid_grant") {
            return res.status(401).json({ error: "Google access expired. Please sign in again." });
        }
        console.error("Send email error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to send email" });
    }
}

module.exports = { sendEmailHandler };
