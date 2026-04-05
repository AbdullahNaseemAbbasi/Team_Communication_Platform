import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  // Logger — console.log ki jagah NestJS ka built-in logger
  // Production mein proper log formatting aur levels deta hai
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // ── Nodemailer Transporter ──────────────────────────────────────────────
    // Transporter = email bhejne ka mechanism
    // Development mein Gmail SMTP use karenge
    // Production mein SendGrid ya AWS SES better hota hai (bulk emails ke liye)
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),      // smtp.gmail.com
      port: this.configService.get<number>('EMAIL_PORT'), // 587
      secure: false, // false for port 587 (STARTTLS), true for 465 (SSL)
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
        // Gmail ke liye normal password nahi — "App Password" chahiye
        // Google Account → Security → 2FA on → App Passwords → Generate
      },
    });
  }

  async sendOtpEmail(email: string, displayName: string, otp: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Team Chat" <${this.configService.get('EMAIL_FROM')}>`,
        to: email,
        subject: 'Email Verify Karo — Team Chat',
        // HTML email template
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">Team Chat</h2>
            <p>Assalamu Alaikum <strong>${displayName}</strong>!</p>
            <p>Tumhara verification code yeh hai:</p>
            <div style="background: #F3F4F6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4F46E5;">
                ${otp}
              </span>
            </div>
            <p style="color: #6B7280; font-size: 14px;">
              Yeh code <strong>10 minutes</strong> mein expire ho jaayega.
            </p>
            <p style="color: #6B7280; font-size: 14px;">
              Agar tumne sign up nahi kiya toh is email ko ignore karo.
            </p>
          </div>
        `,
      });

      this.logger.log(`OTP email bhej diya: ${email}`);
    } catch (error) {
      this.logger.error(`Email bhejne mein masla: ${error}`);
      // Email fail hone pe registration fail nahi karte — user manually resend kar sakta hai
    }
  }
}
