const axios = require("axios");

async function sendEmail(to, subject, htmlContent) {

    try {

        const response = await axios.post(

            "https://api.brevo.com/v3/smtp/email",

            {
                sender: {
                    name: "Pradnyesh",
                    email: "bhalekar@pradnyesh.site",
                },

                to: [
                    {
                        email: to,
                    },
                ],
                subject,
                htmlContent,
            },
            {
                headers: {
                    "api-key":process.env.BREVO_API_KEY,

                    "Content-Type":"application/json",
                },
            }
        );

        console.log("Email sent successfully!");

        return response.data;

    } catch (err) {
        console.log("Brevo Error:", err.response?.data || err.message);
        throw err;
    }
}

module.exports = {
    sendEmail,
};