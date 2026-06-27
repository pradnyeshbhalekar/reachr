function cleanDomain(url) {
    let domain = url
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");

    // Strip any subdomain (e.g. go.wepay.com → wepay.com)
    // Keep if it's already a root domain (e.g. adyen.com, gocardless.com)
    const parts = domain.split(".");
    if (parts.length > 2) {
        domain = parts.slice(-2).join(".");
    }

    return domain;
}

module.exports = {
    cleanDomain,
};