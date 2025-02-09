import sgMail from '@sendgrid/mail';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug log (remove it later)
console.log('API Key length:', process.env.SENDGRID_API_KEY?.length);

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.SITE_URL}/api/newsletter/verify/${token}`;
    
    const msg = {
        to: email,
        from: {
            email: process.env.EMAIL_FROM,
            name: process.env.SITE_NAME
        },
        subject: 'Verify your newsletter subscription',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1>Verify your email</h1>
                <p>Thanks for subscribing to our newsletter!</p>
                <p>Please click the button below to verify your email address:</p>
                <a href="${verificationUrl}" 
                   style="display: inline-block; padding: 12px 24px; 
                          background-color: #4A90E2; color: white; 
                          text-decoration: none; border-radius: 4px;">
                    Verify Email
                </a>
                <p style="margin-top: 24px; color: #666;">
                    If the button doesn't work, copy and paste this link:
                    <br>
                    ${verificationUrl}
                </p>
            </div>
        `
    };

    try {
        await sgMail.send(msg);
        console.log('Verification email sent to:', email);
    } catch (error) {
        console.error('SendGrid error:', error);
        if (error.response) {
            console.error('Error body:', error.response.body);
        }
        throw error;
    }
}

function generateUnsubscribeToken(email) {
    return crypto
        .createHash('sha256')
        .update(email + process.env.APP_SECRET)
        .digest('hex');
}

export async function sendWelcomeEmail(email) {
    const unsubscribeToken = generateUnsubscribeToken(email);
    const unsubscribeUrl = `${process.env.SITE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken}`;
    
    const msg = {
        to: email,
        from: {
            email: process.env.EMAIL_FROM,
            name: process.env.SITE_NAME
        },
        subject: 'Welcome to our newsletter!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1>Welcome!</h1>
                <p>Thanks for verifying your email address.</p>
                <p>You're now subscribed to our newsletter!</p>
                <p style="color: #666; font-size: 12px; margin-top: 24px;">
                    Don't want to receive these emails? 
                    <a href="${unsubscribeUrl}">Unsubscribe here</a>
                </p>
            </div>
        `
    };

    try {
        await sgMail.send(msg);
        console.log('Welcome email sent to:', email);
    } catch (error) {
        console.error('SendGrid error:', error);
        throw error;
    }
}

export async function sendNewsletterEmail(email, subject, content) {
    const unsubscribeToken = generateUnsubscribeToken(email);
    const unsubscribeUrl = `${process.env.SITE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken}`;
    
    const msg = {
        to: email,
        from: {
            email: process.env.EMAIL_FROM,
            name: process.env.SITE_NAME
        },
        subject: subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                ${content}
                <p style="color: #666; font-size: 12px; margin-top: 24px; border-top: 1px solid #eee; padding-top: 24px;">
                    You received this email because you're subscribed to our newsletter.
                    <br>
                    <a href="${unsubscribeUrl}">Unsubscribe here</a>
                </p>
            </div>
        `
    };

    try {
        await sgMail.send(msg);
        console.log('Newsletter sent to:', email);
    } catch (error) {
        console.error('SendGrid error:', error);
        throw error;
    }
} 