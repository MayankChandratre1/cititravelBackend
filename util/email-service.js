import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    async sendVerificationEmail(to, verificationCode) {
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to,
            subject: 'Verify Your Email - CitiTravel',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to CitiTravel!</h2>
                    <p>Please verify your email address by entering this code:</p>
                    <h1 style="color: #4CAF50; text-align: center; font-size: 32px;">${verificationCode}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this verification, please ignore this email.</p>
                </div>
            `
        };

        return this.transporter.sendMail(mailOptions);
    }

    async sendBookingConfirmation(to, bookingDetails) {
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to,
            subject: 'Booking Confirmation - CitiTravel',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Booking Confirmation</h2>
                    <p>Thank you for booking with CitiTravel!</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
                        <h3>Booking Details:</h3>
                        <p><strong>PNR:</strong> ${bookingDetails.pnr}</p>
                        <p><strong>Total Amount:</strong> ${bookingDetails.currency} ${bookingDetails.amount}</p>
                        <p><strong>Status:</strong> ${bookingDetails.status}</p>
                    </div>
                    <p>Your e-tickets will be sent in a separate email.</p>
                </div>
            `
        };

        return this.transporter.sendMail(mailOptions);
    }

    async sendPasswordReset(to, resetCode) {
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to,
            subject: 'Password Reset - CitiTravel',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Password Reset Request</h2>
                    <p>You requested to reset your password. Here's your reset code:</p>
                    <h1 style="color: #f44336; text-align: center; font-size: 32px;">${resetCode}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this reset, please secure your account.</p>
                </div>
            `
        };

        return this.transporter.sendMail(mailOptions);
    }

    async sendPassportReminder(to, name) {
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to,
            subject: 'Passport Details Required - CitiTravel',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Hello ${name},</h2>
                    <p>Please remember to update your passport details for your upcoming trip.</p>
                    <p>You can do this by:</p>
                    <ol>
                        <li>Logging into your CitiTravel account</li>
                        <li>Going to "My Bookings"</li>
                        <li>Selecting your booking</li>
                        <li>Click on "Update Passport Details"</li>
                    </ol>
                    <p style="color: #f44336;">Note: This is required for international travel.</p>
                </div>
            `
        };

        return this.transporter.sendMail(mailOptions);
    }
}

export default new EmailService();
