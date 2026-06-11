// src/utils/emailTemplates.js

export const verificationEmailTemplate = (name, verifyUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7f9;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            .header {
                background-color: #2563eb;
                padding: 30px;
                text-align: center;
                color: #ffffff;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }
            .content {
                padding: 40px 30px;
                color: #334155;
                line-height: 1.6;
            }
            .content h2 {
                color: #1e293b;
                font-size: 20px;
                margin-top: 0;
            }
            .btn-container {
                text-align: center;
                margin: 30px 0;
            }
            .btn {
                background-color: #2563eb;
                color: #ffffff !important;
                padding: 14px 30px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                display: inline-block;
                transition: background-color 0.3s;
            }
            .footer {
                background-color: #f8fafc;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #64748b;
            }
            .link-fallback {
                font-size: 12px;
                color: #94a3b8;
                word-break: break-all;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Verify Your Account</h1>
            </div>
            <div class="content">
                <h2>Hello ${name},</h2>
                <p>Thank you for signing up! We're excited to have you on board. To get started, please confirm your email address by clicking the button below.</p>
                
                <div class="btn-container">
                    <a href="${verifyUrl}" class="btn">Verify Email Address</a>
                </div>
                
                <p>This link will expire in 15 minutes for security reasons. If you did not create an account, no further action is required.</p>
                
                <div class="link-fallback">
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p>${verifyUrl}</p>
                </div>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
                <p>Security Notification: This is an automated email. Please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};