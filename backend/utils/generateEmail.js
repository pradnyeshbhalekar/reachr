function generateEmail(contact, company) {

    return `
Hi ${contact.name},

I came across ${company} and found your work really interesting.

We are currently building solutions in a similar space and I would love to connect with you.

Looking forward to hearing from you.

Best regards,
Pradnyesh
`;
}

module.exports = {
    generateEmail,
};