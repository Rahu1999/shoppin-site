import nodemailer, { Transporter } from 'nodemailer';
import { logger } from '@config/logger';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = `"Rajesh Industries" <${process.env.SMTP_USER}>`;
  try {
    const info = await getTransporter().sendMail({ from, ...options });
    logger.info(`Email sent to ${options.to} — messageId: ${info.messageId}`);
  } catch (err: any) {
    // Log but never throw — email failure must not break the request
    logger.error(`Email failed to ${options.to}: ${err.message}`);
  }
}
