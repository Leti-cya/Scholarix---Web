const nodemailer = require("nodemailer");

const smtpConfigured =
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

let transporter = null;
if (smtpConfigured) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

const sendMail = async ({ to, subject, html, text }) => {
    const from = process.env.MAIL_FROM || "Scholarix <no-reply@scholarix.app>";

    if (!transporter) {
        console.log("\n──────── 📧 EMAIL (dev fallback, SMTP not configured) ────────");
        console.log("From:   ", from);
        console.log("To:     ", to);
        console.log("Subject:", subject);
        console.log("Body:   ", text || html);
        console.log("──────────────────────────────────────────────────────────────\n");
        return { delivered: false };
    }

    try {
        await transporter.sendMail({ from, to, subject, html, text });
        return { delivered: true };
    } catch (e) {
        console.error("SEND MAIL ERROR:", e.message);
        return { delivered: false };
    }
};

module.exports = { sendMail, smtpConfigured: !!transporter };
