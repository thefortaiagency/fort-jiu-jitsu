// Email utility for The Fort Jiu-Jitsu contact form
// Using Resend API

import { Resend } from 'resend';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  interest: string;
  message: string;
}

export async function sendContactNotification(data: ContactFormData) {
  console.log('📧 sendContactNotification called with:', {
    name: data.name,
    email: data.email,
    hasApiKey: !!process.env.RESEND_API_KEY,
    recipient: process.env.CONTACT_RECIPIENT || 'aoberlin@thefortaiagency.ai'
  });

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment');
    throw new Error('Email service not configured');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const interestLabels: Record<string, string> = {
    general: 'General Inquiry',
    kids: 'Kids Classes',
    adult: 'Adult Classes',
    morning: 'Morning Rolls',
    private: 'Private Training',
  };

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <!-- Dark Header -->
      <div style="background: #1b1b1b; padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
          New Contact Form Submission
        </h1>
        <p style="color: rgba(255,255,255,0.7); margin: 10px 0 0 0; font-size: 16px;">
          The Fort Jiu-Jitsu
        </p>
      </div>

      <!-- Content Body -->
      <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none;">
        <!-- Contact Info Card -->
        <div style="background: #f9f9f9; border-left: 4px solid #1b1b1b; border-radius: 0 8px 8px 0; padding: 25px; margin-bottom: 25px;">
          <h3 style="color: #1b1b1b; margin: 0 0 20px 0; font-size: 20px;">
            Contact Information
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #5e5e5e; font-weight: 600; width: 120px;">Name:</td>
              <td style="padding: 8px 0; color: #1b1b1b;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #5e5e5e; font-weight: 600;">Email:</td>
              <td style="padding: 8px 0;">
                <a href="mailto:${data.email}" style="color: #1b1b1b; text-decoration: underline;">${data.email}</a>
              </td>
            </tr>
            ${data.phone ? `
            <tr>
              <td style="padding: 8px 0; color: #5e5e5e; font-weight: 600;">Phone:</td>
              <td style="padding: 8px 0; color: #1b1b1b;">${data.phone}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #5e5e5e; font-weight: 600;">Interest:</td>
              <td style="padding: 8px 0; color: #1b1b1b;">${interestLabels[data.interest] || data.interest}</td>
            </tr>
          </table>
        </div>

        <!-- Message Card -->
        <div style="background: #f9f9f9; border-left: 4px solid #303030; border-radius: 0 8px 8px 0; padding: 25px;">
          <h3 style="color: #1b1b1b; margin: 0 0 20px 0; font-size: 20px;">
            Message
          </h3>
          <p style="color: #1b1b1b; line-height: 1.6; white-space: pre-wrap; margin: 0; font-size: 16px;">
            ${data.message}
          </p>
        </div>

        <!-- Quick Actions -->
        <div style="text-align: center; margin-top: 30px;">
          <a href="mailto:${data.email}?subject=Re: The Fort Jiu-Jitsu Inquiry"
             style="display: inline-block; background: #1b1b1b; color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; margin: 0 10px;">
            Reply to ${data.name.split(' ')[0]}
          </a>
          ${data.phone ? `
          <a href="tel:${data.phone}"
             style="display: inline-block; background: #ffffff; color: #1b1b1b; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; margin: 0 10px; border: 2px solid #1b1b1b;">
            Call ${data.name.split(' ')[0]}
          </a>
          ` : ''}
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="color: #777777; font-size: 12px; margin: 0;">
          Submitted at ${new Date().toLocaleString()}<br>
          From: <a href="https://thefortjiujitsu.com" style="color: #1b1b1b; text-decoration: none;">thefortjiujitsu.com</a>
        </p>
      </div>
    </div>
  `;

  // Send notification email
  console.log('📧 Sending notification email to:', process.env.CONTACT_RECIPIENT || 'aoberlin@thefortaiagency.ai');

  const result = await resend.emails.send({
    from: `The Fort Jiu-Jitsu <${(process.env.RESEND_FROM_EMAIL || 'noreply@thefortaiagency.ai').trim()}>`,
    to: (process.env.CONTACT_RECIPIENT || 'aoberlin@thefortaiagency.ai').trim(),
    replyTo: data.email.trim(),
    subject: `New Contact: ${data.name} - ${interestLabels[data.interest] || 'Inquiry'}`,
    html: emailHtml,
    text: `New Contact Form Submission - The Fort Jiu-Jitsu\n\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'Not provided'}\nInterest: ${interestLabels[data.interest] || data.interest}\n\nMessage:\n${data.message}\n\nSubmitted at ${new Date().toLocaleString()}`
  });

  if (result.error) {
    console.error('❌ Failed to send notification email:', result.error);
    throw new Error(`Email failed: ${result.error.message}`);
  }

  console.log('✅ Notification email sent successfully! ID:', result.data?.id);

  // Wait 2 seconds to avoid Resend rate limit
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Send confirmation email to user
  try {
    const confirmationHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <!-- Dark Header -->
        <div style="background: #1b1b1b; padding: 50px 20px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">
            Thank You for Reaching Out
          </h1>
          <p style="color: rgba(255,255,255,0.8); margin: 15px 0 0 0; font-size: 18px;">
            The Fort Jiu-Jitsu
          </p>
        </div>

        <!-- Content Body -->
        <div style="background: #ffffff; padding: 45px 35px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #1b1b1b; font-size: 18px; line-height: 1.6; margin: 0 0 20px 0;">
            Hi ${data.name.split(' ')[0]},
          </p>
          <p style="color: #5e5e5e; font-size: 16px; line-height: 1.7; margin: 0 0 30px 0;">
            We've received your message and appreciate your interest in The Fort Jiu-Jitsu.
            Our team will review your inquiry and get back to you within <strong style="color: #1b1b1b;">24 hours</strong>.
          </p>

          <!-- Submission Summary -->
          <div style="background: #f9f9f9; border-left: 4px solid #1b1b1b; border-radius: 0 8px 8px 0; padding: 25px; margin: 30px 0;">
            <h3 style="color: #1b1b1b; margin: 0 0 15px 0; font-size: 18px;">
              Your Message
            </h3>
            <p style="color: #5e5e5e; line-height: 1.6; margin: 0; white-space: pre-wrap;">
              ${data.message}
            </p>
          </div>

          <!-- Contact Info -->
          <div style="background: #f9f9f9; border-radius: 8px; padding: 25px; text-align: center; margin: 30px 0;">
            <h3 style="color: #1b1b1b; margin: 0 0 15px 0; font-size: 18px;">
              Questions? Reach Us Directly
            </h3>
            <p style="color: #5e5e5e; margin: 0 0 20px 0;">
              Call us at <a href="tel:2604527615" style="color: #1b1b1b; font-weight: 600;">(260) 452-7615</a>
            </p>
            <p style="color: #5e5e5e; margin: 0;">
              Visit us at 1519 Goshen Road, Fort Wayne, IN 46808
            </p>
          </div>

          <!-- What to Expect -->
          <div style="border-left: 3px solid #303030; padding-left: 20px; margin: 30px 0;">
            <h4 style="color: #1b1b1b; margin: 0 0 10px 0; font-size: 16px;">What Happens Next?</h4>
            <ol style="color: #5e5e5e; margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Our team reviews your inquiry</li>
              <li>We'll contact you within 24 hours</li>
              <li>Schedule your free trial class</li>
            </ol>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f9f9f9; padding: 25px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #777777; font-size: 14px; margin: 0 0 10px 0;">
            <em>"It is not about the destination, it is about the journey."</em>
          </p>
          <p style="color: #777777; font-size: 13px; margin: 0;">
            The Fort Jiu-Jitsu • <a href="https://thefortjiujitsu.com" style="color: #1b1b1b; text-decoration: none;">thefortjiujitsu.com</a>
          </p>
        </div>
      </div>
    `;

    console.log('📧 Sending confirmation email to user:', data.email);

    const confirmResult = await resend.emails.send({
      from: `The Fort Jiu-Jitsu <${(process.env.RESEND_FROM_EMAIL || 'noreply@thefortaiagency.ai').trim()}>`,
      to: data.email.trim(),
      subject: 'Thank you for contacting The Fort Jiu-Jitsu',
      html: confirmationHtml,
      text: `Hi ${data.name},\n\nWe've received your message and appreciate your interest in The Fort Jiu-Jitsu. Our team will review your inquiry and get back to you within 24 hours.\n\nYour first class is on us - we look forward to meeting you on the mats!\n\nBest regards,\nThe Fort Jiu-Jitsu Team\n\nQuestions? Call us at (260) 452-7615\n1519 Goshen Road, Fort Wayne, IN 46808\nthefortjiujitsu.com`
    });

    if (confirmResult.error) {
      console.error('❌ Failed to send confirmation email:', confirmResult.error);
    } else {
      console.log('✅ Confirmation email sent successfully! ID:', confirmResult.data?.id);
    }
  } catch (confirmError) {
    console.log('⚠️ User confirmation email failed, but continuing:', confirmError);
  }

  return true;
}
