function emailTemplate({ heading, bodyLines, ctaText, ctaUrl }) {
    const paragraphs = bodyLines
        .map(line => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3f46;">${line}</p>`)
        .join("");

    const button = ctaUrl
        ? `<a href="${ctaUrl}" style="display:inline-block;margin-top:8px;padding:12px 24px;background:#18181b;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">${ctaText}</a>`
        : "";

    return `
    <div style="background:#f4f4f5;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
        <div style="padding:28px 32px;border-bottom:1px solid #e4e4e7;">
          <span style="font-size:17px;font-weight:700;letter-spacing:-0.02em;color:#18181b;">reachr</span>
        </div>
        <div style="padding:32px;">
          <h1 style="margin:0 0 16px;font-size:19px;font-weight:700;letter-spacing:-0.02em;color:#18181b;">${heading}</h1>
          ${paragraphs}
          ${button}
        </div>
        <div style="padding:20px 32px;background:#fafafa;border-top:1px solid #e4e4e7;">
          <p style="margin:0;font-size:12px;color:#a1a1aa;">Reachr &middot; Outreach, automated</p>
        </div>
      </div>
    </div>`;
}

module.exports = { emailTemplate };
