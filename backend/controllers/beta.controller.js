const jwt = require("jsonwebtoken");
const { createBetaSignup, getBetaSignupById, approveBetaSignup, getUserByEmail, getAllBetaSignupsWithStatus } = require("../db");
const { decrypt } = require("../services/crypto");
const { getAccessToken } = require("../services/google");
const { sendEmail } = require("../services/gmail");
const { emailTemplate } = require("../services/emailTemplate");

async function sendAsAdmin(to, subject, html) {
    const sender = await getUserByEmail(process.env.SENDER_EMAIL);
    if (!sender || !sender.encrypted_refresh_token) {
        throw new Error(`${process.env.SENDER_EMAIL} not connected. Sign in with Google as that account first.`);
    }
    const refreshToken = decrypt(sender.encrypted_refresh_token);
    const accessToken = await getAccessToken(refreshToken);
    return sendEmail({ accessToken, to, subject, body: html, html: true });
}

async function register(req, res) {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: "name and email are required" });
    }

    try {
        const signup = await createBetaSignup({ name: name.trim(), email: email.trim().toLowerCase() });

        const approveToken = jwt.sign(
            { id: signup.id, purpose: "beta-approve" },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );
        const approveUrl = `${process.env.BACKEND_URL}/beta/approve/${signup.id}?token=${approveToken}`;

        const html = emailTemplate({
            heading: "New beta signup",
            bodyLines: [
                `<strong>${signup.name}</strong> (${signup.email}) requested beta access.`,
                `Approve them below, then add their Google account as a test user in the <a href="${process.env.GOOGLE_TEST_USERS_URL}" style="color:#18181b;">Google Cloud Console</a> so they can actually sign in.`,
            ],
            ctaText: "Approve signup",
            ctaUrl: approveUrl,
        });

        await sendAsAdmin(process.env.ADMIN_NOTIFY_EMAILS, `New beta request from ${signup.name} — Reachr`, html);

        try {
            const confirmationHtml = emailTemplate({
                heading: "You're on the list",
                bodyLines: [
                    `Hi ${signup.name},`,
                    "Thanks for requesting access to Reachr. We'll email you the moment you're approved and ready to sign in.",
                ],
            });
            await sendAsAdmin(signup.email, "You're on the Reachr beta list", confirmationHtml);
        } catch (err) {
            console.error("Beta signup confirmation email error:", err.response?.data || err.message);
        }

        res.json({ success: true });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ error: "This email is already on the beta list." });
        }
        console.error("Beta register error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to register" });
    }
}

async function approve(req, res) {
    const { id } = req.params;
    const { token } = req.query;

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (payload.purpose !== "beta-approve" || String(payload.id) !== String(id)) {
            throw new Error("token mismatch");
        }
    } catch {
        return res.status(401).send("Invalid or expired approval link");
    }

    const signup = await getBetaSignupById(id);
    if (!signup) {
        return res.status(404).send("Signup not found");
    }

    if (signup.status !== "approved") {
        await approveBetaSignup(id);
        try {
            const html = emailTemplate({
                heading: "You're in",
                bodyLines: [
                    `Hi ${signup.name},`,
                    "You've been approved for the Reachr beta. Sign in with Google to start turning company domains into warm outreach.",
                ],
                ctaText: "Open Reachr",
                ctaUrl: process.env.FRONTEND_URL,
            });
            await sendAsAdmin(signup.email, "Welcome to Reachr — you're in", html);
        } catch (err) {
            console.error("Beta approval email error:", err.response?.data || err.message);
        }
    }

    res.send(`<!doctype html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Approved &middot; Reachr</title></head>
    <body style="margin:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;">
        <div style="max-width:440px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
          <div style="padding:28px 32px;border-bottom:1px solid #e4e4e7;">
            <span style="font-size:17px;font-weight:700;letter-spacing:-0.02em;color:#18181b;">reachr</span>
          </div>
          <div style="padding:32px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#f0fdf4;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
              <span style="color:#16a34a;font-size:20px;line-height:1;">&#10003;</span>
            </div>
            <h1 style="margin:0 0 6px;font-size:18px;font-weight:700;letter-spacing:-0.02em;color:#18181b;">${signup.name} approved</h1>
            <p style="margin:0 0 20px;font-size:14px;color:#71717a;">${signup.email}</p>
            <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#3f3f46;">
              They've been emailed and can now sign in. One more step &mdash; while the app is in testing mode, add their Google account as a test user so login actually works for them.
            </p>
            <a href="${process.env.GOOGLE_TEST_USERS_URL}" style="display:inline-block;padding:11px 22px;background:#18181b;color:#ffffff;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;">
              Add as test user &rarr;
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>`);
}

async function listSignups(req, res) {
    if (req.user.email !== process.env.ADMIN_EMAIL) {
        return res.status(403).json({ error: "Forbidden" });
    }
    const signups = await getAllBetaSignupsWithStatus();
    res.json({ signups });
}

module.exports = { register, approve, listSignups };
