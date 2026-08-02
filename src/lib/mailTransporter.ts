import nodemailer from 'nodemailer';
import { logger } from './logger.js';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true' || true,
    auth: {
        user: process.env.SMTP_USER || 'test@example.com',
        pass: process.env.SMTP_PASS || 'password'
    }
});

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || '"NDARA" <no-reply@ndara.com>',
            to,
            subject,
            text,
            html: html || text
        });
        logger.info(`Email sent to ${to}: ${subject}`);
    } catch (e) {
        logger.error(`Failed to send email to ${to}: ${subject}`, e);
        // We don't throw to not break flows
    }
}
