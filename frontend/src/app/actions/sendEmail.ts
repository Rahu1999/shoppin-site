"use server";

import nodemailer from "nodemailer";
import { BRAND } from "@/config/brand";

export async function sendEmailAction(formData: {
  name: string;
  phone: string;
  message: string;
}) {
  try {
    const { name, phone, message } = formData;

    // Configure the nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    // Define the email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Sending to your email
      subject: `New Enquiry from ${name}`,
      html: `
        <h2>New Contact Form Submission - ${BRAND.name}</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send message. Please try again later." };
  }
}
