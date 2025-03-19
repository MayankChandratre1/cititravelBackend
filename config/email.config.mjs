import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendVerificationEmail(email, otp) {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .header {
          background-color: #1a73e8;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #ffffff;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 0 0 5px 5px;
        }
        .otp-code {
          font-size: 32px;
          font-weight: bold;
          color: #1a73e8;
          text-align: center;
          padding: 20px;
          margin: 20px 0;
          background-color: #f5f5f5;
          border-radius: 5px;
          letter-spacing: 5px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CITITRAVEL</h1>
        </div>
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>Hello there!</p>
          <p>Thank you for choosing CitiTravel. To complete your email verification, please use the following verification code:</p>
          
          <div class="otp-code">${otp}</div>
          
          <p>If you didn't request this code, please ignore this email.</p>
          
          <p>Best regards,<br>The CitiTravel Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} CitiTravel. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"CitiTravel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - CitiTravel',
      text: `Your CitiTravel verification code is: ${otp}`,
      html: htmlTemplate
    });
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

export async function sendPassportReminder(email, name) {
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .header {
          background-color: #1a73e8;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #ffffff;
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 0 0 5px 5px;
        }
        .steps {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .warning {
          color: #f44336;
          font-weight: bold;
          margin-top: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CITITRAVEL</h1>
        </div>
        <div class="content">
          <h2>Passport Details Required</h2>
          <p>Hello ${name},</p>
          <p>Please remember to update your passport details for your upcoming trip.</p>
          
          <div class="steps">
            <p>You can do this by following these steps:</p>
            <p>1. Reply to mail with details</p>
          </div>
          
          <p class="warning">Note: This is required for international travel.</p>
          
          <p>Best regards,<br>The CitiTravelers Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} CitiTravel. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"CitiTravel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Passport Details Required - CitiTravel',
      text: `Hello ${name}, Please update your passport details for your upcoming trip.`,
      html: htmlTemplate
    });
    console.log('Passport reminder sent to:', email);
    
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}


// <ol>
// <li>Log into your CitiTravel account</li>
// <li>Go to "My Bookings"</li>
// <li>Select your booking</li>
// <li>Click on "Update Passport Details"</li>
// </ol>