import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
    });
  }

  async sendOtpEmail(email: string, displayName: string, otp: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"TeamChat" <${this.configService.get('EMAIL_FROM')}>`,
        to: email,
        subject: 'Verify your email — TeamChat',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">TeamChat</h2>
            <p>Hello <strong>${displayName}</strong>!</p>
            <p>Your verification code is:</p>
            <div style="background: #F3F4F6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4F46E5;">
                ${otp}
              </span>
            </div>
            <p style="color: #6B7280; font-size: 14px;">
              This code expires in <strong>10 minutes</strong>.
            </p>
            <p style="color: #6B7280; font-size: 14px;">
              If you did not sign up, please ignore this email.
            </p>
          </div>
        `,
      });

      this.logger.log(`OTP email sent to: ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error}`);
    }
  }
}
