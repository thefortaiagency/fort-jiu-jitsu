/**
 * Family Account Email Notification Templates
 * These can be integrated with your existing email system
 */

interface FamilyMemberWelcomeEmailParams {
  memberEmail: string;
  memberName: string;
  primaryName: string;
  familyName: string;
  memberCount: number;
  monthlyRate: number;
  loginUrl?: string;
}

interface FamilyMemberRemovedEmailParams {
  memberEmail: string;
  memberName: string;
  primaryName: string;
  familyName: string;
}

interface FamilyBillingUpdatedEmailParams {
  primaryEmail: string;
  primaryName: string;
  familyName: string;
  oldMemberCount: number;
  newMemberCount: number;
  oldMonthlyRate: number;
  newMonthlyRate: number;
  changeType: 'member_added' | 'member_removed';
  changedMemberName?: string;
}

interface FamilySubscriptionConfirmationParams {
  primaryEmail: string;
  primaryName: string;
  familyName: string;
  memberCount: number;
  monthlyRate: number;
  savings: number;
  familyMembers: Array<{ name: string; program: string }>;
  nextBillingDate: string;
}

/**
 * Welcome email for new family member
 */
export function getFamilyMemberWelcomeEmailContent(
  params: FamilyMemberWelcomeEmailParams
): { subject: string; html: string; text: string } {
  const { memberName, primaryName, familyName, memberCount, monthlyRate, loginUrl } = params;

  const subject = `Welcome to ${familyName} at The Fort Jiu-Jitsu!`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to The Fort Jiu-Jitsu!</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Hi ${memberName},</p>

    <p style="font-size: 16px;">Great news! You've been added to <strong>${familyName}</strong> by ${primaryName}.</p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h2 style="color: #667eea; margin-top: 0;">Family Account Details</h2>
      <p style="margin: 10px 0;"><strong>Family Name:</strong> ${familyName}</p>
      <p style="margin: 10px 0;"><strong>Total Members:</strong> ${memberCount}</p>
      <p style="margin: 10px 0;"><strong>Monthly Rate:</strong> $${monthlyRate}</p>
      <p style="margin: 10px 0;"><strong>Primary Account Holder:</strong> ${primaryName}</p>
    </div>

    <h3 style="color: #667eea;">What's Next?</h3>
    <ul style="font-size: 16px;">
      <li>Check your email for your member QR code and PIN for check-ins</li>
      <li>Review the class schedule and pick your first session</li>
      <li>Bring your signed waiver (if not already completed)</li>
      <li>Show up ready to train!</li>
    </ul>

    ${
      loginUrl
        ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Access Your Account</a>
    </div>
    `
        : ''
    }

    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <p style="margin: 0; font-size: 14px;"><strong>Note:</strong> All billing is managed by ${primaryName}. If you have any questions about your membership, please contact them or reach out to us at The Fort.</p>
    </div>

    <p style="font-size: 16px; margin-top: 30px;">See you on the mats!</p>

    <p style="font-size: 16px;">
      <strong>The Fort Jiu-Jitsu Team</strong><br>
      <a href="mailto:info@thefortjiujitsu.com">info@thefortjiujitsu.com</a><br>
      <a href="https://thefortjiujitsu.com">thefortjiujitsu.com</a>
    </p>
  </div>
</body>
</html>
  `;

  const text = `
Welcome to The Fort Jiu-Jitsu!

Hi ${memberName},

Great news! You've been added to ${familyName} by ${primaryName}.

FAMILY ACCOUNT DETAILS:
- Family Name: ${familyName}
- Total Members: ${memberCount}
- Monthly Rate: $${monthlyRate}
- Primary Account Holder: ${primaryName}

WHAT'S NEXT?
- Check your email for your member QR code and PIN for check-ins
- Review the class schedule and pick your first session
- Bring your signed waiver (if not already completed)
- Show up ready to train!

${loginUrl ? `Access Your Account: ${loginUrl}` : ''}

Note: All billing is managed by ${primaryName}. If you have any questions about your membership, please contact them or reach out to us at The Fort.

See you on the mats!

The Fort Jiu-Jitsu Team
info@thefortjiujitsu.com
thefortjiujitsu.com
  `.trim();

  return { subject, html, text };
}

/**
 * Notification when a member is removed from family
 */
export function getFamilyMemberRemovedEmailContent(
  params: FamilyMemberRemovedEmailParams
): { subject: string; html: string; text: string } {
  const { memberName, primaryName, familyName } = params;

  const subject = `Update: Family Membership at The Fort Jiu-Jitsu`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Membership Update</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Hi ${memberName},</p>

    <p style="font-size: 16px;">You've been removed from <strong>${familyName}</strong> by ${primaryName}.</p>

    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <p style="margin: 0; font-size: 14px;"><strong>Your membership is now inactive.</strong> If you'd like to continue training with us, you can sign up for an individual membership at any time.</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://thefortjiujitsu.com/signup" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Sign Up for Individual Membership</a>
    </div>

    <p style="font-size: 16px;">If you have any questions or believe this was a mistake, please contact ${primaryName} or reach out to us directly.</p>

    <p style="font-size: 16px; margin-top: 30px;">Thank you for training with us!</p>

    <p style="font-size: 16px;">
      <strong>The Fort Jiu-Jitsu Team</strong><br>
      <a href="mailto:info@thefortjiujitsu.com">info@thefortjiujitsu.com</a><br>
      <a href="https://thefortjiujitsu.com">thefortjiujitsu.com</a>
    </p>
  </div>
</body>
</html>
  `;

  const text = `
Membership Update

Hi ${memberName},

You've been removed from ${familyName} by ${primaryName}.

Your membership is now inactive. If you'd like to continue training with us, you can sign up for an individual membership at any time.

Sign up at: https://thefortjiujitsu.com/signup

If you have any questions or believe this was a mistake, please contact ${primaryName} or reach out to us directly.

Thank you for training with us!

The Fort Jiu-Jitsu Team
info@thefortjiujitsu.com
thefortjiujitsu.com
  `.trim();

  return { subject, html, text };
}

/**
 * Billing update notification for primary account holder
 */
export function getFamilyBillingUpdatedEmailContent(
  params: FamilyBillingUpdatedEmailParams
): { subject: string; html: string; text: string } {
  const {
    primaryName,
    familyName,
    oldMemberCount,
    newMemberCount,
    oldMonthlyRate,
    newMonthlyRate,
    changeType,
    changedMemberName,
  } = params;

  const subject = `Family Billing Updated - ${familyName}`;

  const changeDescription =
    changeType === 'member_added'
      ? `${changedMemberName} has been added to your family account`
      : `${changedMemberName} has been removed from your family account`;

  const priceDifference = newMonthlyRate - oldMonthlyRate;
  const priceChange =
    priceDifference > 0
      ? `increased by $${Math.abs(priceDifference).toFixed(2)}`
      : priceDifference < 0
      ? `decreased by $${Math.abs(priceDifference).toFixed(2)}`
      : 'remained the same';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Family Billing Updated</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Hi ${primaryName},</p>

    <p style="font-size: 16px;">${changeDescription}.</p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h2 style="color: #667eea; margin-top: 0;">Billing Update</h2>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Previous:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${oldMemberCount} members at $${oldMonthlyRate}/month</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Current:</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${newMemberCount} members at $${newMonthlyRate}/month</td>
        </tr>
        <tr>
          <td style="padding: 10px;"><strong>Change:</strong></td>
          <td style="padding: 10px; ${priceDifference > 0 ? 'color: #d32f2f;' : priceDifference < 0 ? 'color: #388e3c;' : ''}">${priceChange}</td>
        </tr>
      </table>
    </div>

    ${
      priceDifference !== 0
        ? `
    <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3;">
      <p style="margin: 0; font-size: 14px;"><strong>Prorated Billing:</strong> Your next invoice will reflect the prorated amount based on when this change occurred in your billing cycle.</p>
    </div>
    `
        : ''
    }

    <p style="font-size: 16px;">Questions about your billing? Contact us anytime!</p>

    <p style="font-size: 16px;">
      <strong>The Fort Jiu-Jitsu Team</strong><br>
      <a href="mailto:info@thefortjiujitsu.com">info@thefortjiujitsu.com</a><br>
      <a href="https://thefortjiujitsu.com">thefortjiujitsu.com</a>
    </p>
  </div>
</body>
</html>
  `;

  const text = `
Family Billing Updated

Hi ${primaryName},

${changeDescription}.

BILLING UPDATE:
- Previous: ${oldMemberCount} members at $${oldMonthlyRate}/month
- Current: ${newMemberCount} members at $${newMonthlyRate}/month
- Change: ${priceChange}

${
  priceDifference !== 0
    ? 'Prorated Billing: Your next invoice will reflect the prorated amount based on when this change occurred in your billing cycle.'
    : ''
}

Questions about your billing? Contact us anytime!

The Fort Jiu-Jitsu Team
info@thefortjiujitsu.com
thefortjiujitsu.com
  `.trim();

  return { subject, html, text };
}

/**
 * Family subscription confirmation email
 */
export function getFamilySubscriptionConfirmationEmailContent(
  params: FamilySubscriptionConfirmationParams
): { subject: string; html: string; text: string } {
  const { primaryName, familyName, memberCount, monthlyRate, savings, familyMembers, nextBillingDate } =
    params;

  const subject = `Family Subscription Confirmed - ${familyName}`;

  const membersListHtml = familyMembers
    .map(
      (member) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${member.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${member.program}</td>
    </tr>
  `
    )
    .join('');

  const membersListText = familyMembers.map((member) => `  - ${member.name} (${member.program})`).join('\n');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Family Subscription Confirmed!</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Hi ${primaryName},</p>

    <p style="font-size: 16px;">Congratulations! Your family subscription at The Fort Jiu-Jitsu has been confirmed.</p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h2 style="color: #667eea; margin-top: 0;">Subscription Details</h2>
      <p style="margin: 10px 0;"><strong>Family Name:</strong> ${familyName}</p>
      <p style="margin: 10px 0;"><strong>Total Members:</strong> ${memberCount}</p>
      <p style="margin: 10px 0;"><strong>Monthly Rate:</strong> $${monthlyRate}</p>
      <p style="margin: 10px 0;"><strong>Next Billing Date:</strong> ${nextBillingDate}</p>
    </div>

    ${
      savings > 0
        ? `
    <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50; text-align: center;">
      <p style="margin: 0; font-size: 18px; color: #2e7d32;"><strong>You're saving $${savings}/month with the family plan!</strong></p>
    </div>
    `
        : ''
    }

    <h3 style="color: #667eea;">Family Members</h3>
    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
      <thead>
        <tr style="background: #667eea; color: white;">
          <th style="padding: 12px; text-align: left;">Name</th>
          <th style="padding: 12px; text-align: left;">Program</th>
        </tr>
      </thead>
      <tbody>
        ${membersListHtml}
      </tbody>
    </table>

    <h3 style="color: #667eea; margin-top: 30px;">What's Next?</h3>
    <ul style="font-size: 16px;">
      <li>Each family member will receive their own QR code and PIN for check-ins</li>
      <li>Review the class schedule at <a href="https://thefortjiujitsu.com/schedule">thefortjiujitsu.com/schedule</a></li>
      <li>Ensure all waivers are signed</li>
      <li>Show up ready to train!</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://thefortjiujitsu.com/member" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">View Member Portal</a>
    </div>

    <p style="font-size: 16px; margin-top: 30px;">See you on the mats!</p>

    <p style="font-size: 16px;">
      <strong>The Fort Jiu-Jitsu Team</strong><br>
      <a href="mailto:info@thefortjiujitsu.com">info@thefortjiujitsu.com</a><br>
      <a href="https://thefortjiujitsu.com">thefortjiujitsu.com</a>
    </p>
  </div>
</body>
</html>
  `;

  const text = `
Family Subscription Confirmed!

Hi ${primaryName},

Congratulations! Your family subscription at The Fort Jiu-Jitsu has been confirmed.

SUBSCRIPTION DETAILS:
- Family Name: ${familyName}
- Total Members: ${memberCount}
- Monthly Rate: $${monthlyRate}
- Next Billing Date: ${nextBillingDate}

${savings > 0 ? `You're saving $${savings}/month with the family plan!` : ''}

FAMILY MEMBERS:
${membersListText}

WHAT'S NEXT?
- Each family member will receive their own QR code and PIN for check-ins
- Review the class schedule at thefortjiujitsu.com/schedule
- Ensure all waivers are signed
- Show up ready to train!

View Member Portal: https://thefortjiujitsu.com/member

See you on the mats!

The Fort Jiu-Jitsu Team
info@thefortjiujitsu.com
thefortjiujitsu.com
  `.trim();

  return { subject, html, text };
}
