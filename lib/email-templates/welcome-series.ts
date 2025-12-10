/**
 * Welcome Email Series Templates for The Fort Jiu-Jitsu
 * Automated onboarding sequence to guide new members
 */

export interface EmailTemplate {
  subject: string;
  html: (data: {
    firstName: string;
    lastName: string;
    memberCardUrl?: string;
    firstClassDate?: string;
    scheduleLinkUrl?: string;
  }) => string;
}

export const welcomeEmails: Record<string, EmailTemplate> = {
  immediate: {
    subject: "Welcome to The Fort Jiu-Jitsu! 🥋",
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #000000;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      font-size: 28px;
      margin: 0;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .hero-text {
      font-size: 18px;
      color: #1a1a1a;
      margin-bottom: 30px;
    }
    .member-card {
      background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%);
      border-radius: 12px;
      padding: 30px;
      margin: 30px 0;
      text-align: center;
    }
    .member-card h2 {
      color: #ffffff;
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .member-card p {
      color: #cccccc;
      margin: 5px 0;
    }
    .qr-code {
      background-color: #ffffff;
      padding: 20px;
      border-radius: 8px;
      display: inline-block;
      margin-top: 20px;
    }
    .what-to-bring {
      background-color: #f9f9f9;
      border-left: 4px solid #000000;
      padding: 20px;
      margin: 30px 0;
    }
    .what-to-bring h3 {
      margin-top: 0;
      color: #1a1a1a;
    }
    .checklist {
      list-style: none;
      padding: 0;
    }
    .checklist li {
      padding: 8px 0;
      padding-left: 30px;
      position: relative;
    }
    .checklist li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #000000;
      font-weight: bold;
      font-size: 18px;
    }
    .cta-button {
      display: inline-block;
      background-color: #000000;
      color: #ffffff !important;
      padding: 15px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 10px 5px;
    }
    .cta-secondary {
      background-color: #ffffff;
      color: #000000 !important;
      border: 2px solid #000000;
    }
    .footer {
      background-color: #1a1a1a;
      color: #cccccc;
      padding: 30px;
      text-align: center;
      font-size: 14px;
    }
    .footer a {
      color: #ffffff;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to The Fort! 🥋</h1>
    </div>

    <div class="content">
      <p class="hero-text">
        Hey ${data.firstName},
      </p>

      <p class="hero-text">
        Welcome to The Fort Jiu-Jitsu family! We're incredibly excited to have you join us on the mats.
        Brazilian Jiu-Jitsu is more than just a martial art—it's a journey of self-improvement,
        discipline, and community. You've taken the first step, and we're here to support you every
        roll of the way.
      </p>

      ${data.memberCardUrl ? `
      <div class="member-card">
        <h2>${data.firstName} ${data.lastName}</h2>
        <p>Member Card</p>
        <div class="qr-code">
          <img src="${data.memberCardUrl}" alt="Your Member QR Code" width="150" height="150" />
        </div>
        <p style="margin-top: 15px; font-size: 12px;">
          Save this email or screenshot your QR code for quick check-ins
        </p>
      </div>
      ` : ''}

      ${data.firstClassDate ? `
      <div class="what-to-bring">
        <h3>📅 Your First Class</h3>
        <p style="font-size: 18px; font-weight: bold; color: #000;">
          ${new Date(data.firstClassDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })}
        </p>
      </div>
      ` : ''}

      <div class="what-to-bring">
        <h3>What to Bring</h3>
        <ul class="checklist">
          <li><strong>Water bottle</strong> - Stay hydrated during training</li>
          <li><strong>Athletic clothes</strong> - Comfortable workout attire (no zippers or buttons)</li>
          <li><strong>Flip flops/sandals</strong> - For walking off the mat</li>
          <li><strong>Towel</strong> - You'll work up a sweat!</li>
          <li><strong>Gi (optional)</strong> - We have loaners if you don't have one yet</li>
          <li><strong>Positive attitude</strong> - Most important thing you'll bring!</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        ${data.scheduleLinkUrl ? `
        <a href="${data.scheduleLinkUrl}" class="cta-button">View Class Schedule</a>
        ` : ''}
        <a href="https://maps.google.com/?q=1519+Goshen+Road+Fort+Wayne+IN+46808" class="cta-button cta-secondary">Get Directions</a>
      </div>

      <p>
        If you have any questions before your first class, don't hesitate to reach out.
        We're here to help make your first experience as smooth as possible!
      </p>

      <p style="margin-top: 30px;">
        <strong>See you on the mats!</strong><br>
        The Fort Jiu-Jitsu Team
      </p>
    </div>

    <div class="footer">
      <p>
        <strong>The Fort Jiu-Jitsu</strong><br>
        1519 Goshen Road, Fort Wayne, IN 46808<br>
        <a href="tel:260-452-7615">(260) 452-7615</a>
      </p>
      <p style="margin-top: 20px; font-size: 12px;">
        Questions? Reply to this email or call us anytime.
      </p>
    </div>
  </div>
</body>
</html>
    `,
  },

  day1: {
    subject: "Your First Class Guide - What to Expect",
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #000; padding: 30px 20px; text-align: center; color: #fff; }
    .content { padding: 40px 30px; }
    .tip-box { background-color: #f9f9f9; border-left: 4px solid #000; padding: 20px; margin: 20px 0; }
    .footer { background-color: #1a1a1a; color: #ccc; padding: 30px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your First Class Guide</h1>
    </div>
    <div class="content">
      <p>Hi ${data.firstName},</p>

      <p>Your first BJJ class is coming up! Here's what to expect so you can walk in feeling confident:</p>

      <div class="tip-box">
        <h3>🚗 Arrival (10 minutes early)</h3>
        <ul>
          <li>Park in our lot at 1519 Goshen Road</li>
          <li>Enter through the main door</li>
          <li>Check in at the front desk with your name</li>
          <li>Change if needed (restrooms available)</li>
        </ul>
      </div>

      <div class="tip-box">
        <h3>👋 Class Structure (60-90 minutes)</h3>
        <ul>
          <li><strong>Warm-up (10 min):</strong> Light cardio and stretching</li>
          <li><strong>Technique (30-40 min):</strong> Learning new moves step-by-step</li>
          <li><strong>Drilling (20-30 min):</strong> Practicing with a partner</li>
          <li><strong>Live Rolling (20-30 min):</strong> Light sparring (optional for beginners)</li>
        </ul>
      </div>

      <div class="tip-box">
        <h3>🥋 BJJ Etiquette 101</h3>
        <ul>
          <li><strong>Bow when stepping on/off the mat</strong> - Shows respect for the training space</li>
          <li><strong>Keep nails trimmed</strong> - Safety for you and training partners</li>
          <li><strong>Tap early, tap often</strong> - There's no shame in tapping out</li>
          <li><strong>Ask questions</strong> - Instructors are here to help!</li>
          <li><strong>Shower before class</strong> - Basic hygiene goes a long way</li>
        </ul>
      </div>

      <p><strong>Most Important:</strong> Everyone at The Fort was a beginner once. We're all here to learn
      and grow together. Don't worry about being perfect—just show up and have fun!</p>

      <p style="margin-top: 30px;">
        See you soon,<br>
        The Fort Team
      </p>
    </div>
    <div class="footer">
      <p>The Fort Jiu-Jitsu | 1519 Goshen Road, Fort Wayne, IN 46808 | (260) 452-7615</p>
    </div>
  </div>
</body>
</html>
    `,
  },

  day3: {
    subject: "How's your first week going?",
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #000; padding: 30px 20px; text-align: center; color: #fff; }
    .content { padding: 40px 30px; }
    .cta-button { display: inline-block; background-color: #000; color: #fff !important; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { background-color: #1a1a1a; color: #ccc; padding: 30px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Checking In 👊</h1>
    </div>
    <div class="content">
      <p>Hey ${data.firstName},</p>

      <p>It's been a few days since you joined The Fort. We wanted to check in and see how things are going!</p>

      <p><strong>Have you made it to your first class yet?</strong> If not, no worries—life gets busy.
      Your membership is active and we'll be ready whenever you can make it.</p>

      <p><strong>Questions we often get asked:</strong></p>
      <ul>
        <li>"Will I get hurt?" - Safety is our #1 priority. Beginners start slow and controlled.</li>
        <li>"Do I need to be in shape?" - Nope! BJJ will get you in shape. Start where you are.</li>
        <li>"Will I be the only beginner?" - We have beginners starting every week. You're not alone!</li>
        <li>"What if I can't keep up?" - Everyone goes at their own pace. No pressure, no judgment.</li>
      </ul>

      <p>If there's anything holding you back from coming to class, or if you have questions,
      just reply to this email or give us a call. We're here to help!</p>

      <div style="text-align: center;">
        <a href="tel:260-452-7615" class="cta-button">Call Us: (260) 452-7615</a>
      </div>

      <p style="margin-top: 30px;">
        Looking forward to seeing you!<br>
        The Fort Team
      </p>
    </div>
    <div class="footer">
      <p>The Fort Jiu-Jitsu | 1519 Goshen Road, Fort Wayne, IN 46808 | (260) 452-7615</p>
    </div>
  </div>
</body>
</html>
    `,
  },

  day7: {
    subject: "You survived week 1! 💪",
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); padding: 40px 20px; text-align: center; color: #fff; }
    .content { padding: 40px 30px; }
    .milestone { background-color: #f0f0f0; padding: 30px; text-align: center; border-radius: 12px; margin: 30px 0; }
    .footer { background-color: #1a1a1a; color: #ccc; padding: 30px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="font-size: 32px; margin: 0;">Week 1 Complete! 🎉</h1>
    </div>
    <div class="content">
      <p>Congratulations, ${data.firstName}!</p>

      <div class="milestone">
        <div style="font-size: 48px; margin-bottom: 10px;">🥋</div>
        <h2 style="margin: 0; font-size: 24px;">You've Completed Your First Week</h2>
        <p style="color: #666; margin-top: 10px;">The hardest part is showing up. You did it!</p>
      </div>

      <p><strong>Here's what happens next:</strong></p>

      <p><strong>Keep Coming Consistently</strong> - The biggest difference between those who progress
      and those who don't? Showing up 2-3 times per week. Your body and brain need consistent practice
      to build the muscle memory.</p>

      <p><strong>Focus on Fundamentals</strong> - Don't worry about fancy techniques yet. Master the
      basics: positions, escapes, and defense. These will serve you for your entire BJJ journey.</p>

      <p><strong>Tap Early, Tap Often</strong> - Protecting yourself is more important than your ego.
      The best training partners tap quickly and get back to learning.</p>

      <p><strong>Ask Questions</strong> - If something doesn't make sense, ask! Our instructors love
      helping students understand the "why" behind techniques.</p>

      <p><strong>Connect with Training Partners</strong> - BJJ is a community sport. The people you
      train with become some of your closest friends. Don't be afraid to introduce yourself!</p>

      <p style="margin-top: 30px;">
        We're proud of you for sticking with it. Keep showing up!<br><br>
        See you on the mats,<br>
        The Fort Team
      </p>
    </div>
    <div class="footer">
      <p>The Fort Jiu-Jitsu | 1519 Goshen Road, Fort Wayne, IN 46808 | (260) 452-7615</p>
    </div>
  </div>
</body>
</html>
    `,
  },

  day14: {
    subject: "2 Weeks In - How to Keep the Momentum",
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #000; padding: 30px 20px; text-align: center; color: #fff; }
    .content { padding: 40px 30px; }
    .tip-card { background-color: #f9f9f9; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #000; }
    .footer { background-color: #1a1a1a; color: #ccc; padding: 30px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Two Weeks Strong 💪</h1>
    </div>
    <div class="content">
      <p>Hey ${data.firstName},</p>

      <p>You're two weeks into your BJJ journey! This is where many beginners face their first real
      challenge: staying consistent when the initial excitement wears off.</p>

      <p><strong>Here's how to keep your momentum going:</strong></p>

      <div class="tip-card">
        <h3 style="margin-top: 0;">🎯 Set Specific Goals</h3>
        <p>Instead of "get better at BJJ," try:</p>
        <ul>
          <li>Master the trap and roll escape this month</li>
          <li>Attend 8 classes this month</li>
          <li>Successfully execute one armbar from guard</li>
        </ul>
      </div>

      <div class="tip-card">
        <h3 style="margin-top: 0;">📅 Schedule Your Training</h3>
        <p>Treat training like an important appointment. Block out time on your calendar and commit
        to those slots. Consistency beats intensity.</p>
      </div>

      <div class="tip-card">
        <h3 style="margin-top: 0;">🤝 Find a Training Partner</h3>
        <p>Having a buddy who expects to see you makes it harder to skip. Plus, you'll progress
        faster training with familiar partners who know your game.</p>
      </div>

      <div class="tip-card">
        <h3 style="margin-top: 0;">📓 Keep a Training Journal</h3>
        <p>Write down one thing you learned after each class. Looking back at this journal in a
        few months will blow your mind at how far you've come.</p>
      </div>

      <p><strong>Remember:</strong> Everyone feels overwhelmed in the beginning. Your brain is
      learning a completely new language of movement. Give yourself grace, stay consistent, and
      trust the process.</p>

      <p style="margin-top: 30px;">
        Keep grinding,<br>
        The Fort Team
      </p>
    </div>
    <div class="footer">
      <p>The Fort Jiu-Jitsu | 1519 Goshen Road, Fort Wayne, IN 46808 | (260) 452-7615</p>
    </div>
  </div>
</body>
</html>
    `,
  },

  day30: {
    subject: "Your First Month at The Fort - What's Next?",
    html: (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #1a1a1a 0%, #444 100%); padding: 50px 20px; text-align: center; color: #fff; }
    .content { padding: 40px 30px; }
    .achievement { background: linear-gradient(135deg, #f0f0f0 0%, #fff 100%); padding: 40px; text-align: center; border-radius: 12px; margin: 30px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .next-steps { background-color: #f9f9f9; padding: 25px; border-radius: 8px; margin: 20px 0; }
    .cta-button { display: inline-block; background-color: #000; color: #fff !important; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px; }
    .footer { background-color: #1a1a1a; color: #ccc; padding: 30px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="font-size: 36px; margin: 0;">1 Month Anniversary! 🎉</h1>
    </div>
    <div class="content">
      <p>Congratulations, ${data.firstName}!</p>

      <div class="achievement">
        <div style="font-size: 64px; margin-bottom: 15px;">🥋</div>
        <h2 style="margin: 0 0 10px 0; font-size: 28px;">30 Days Strong</h2>
        <p style="color: #666; font-size: 18px; margin: 0;">You've officially made it through the hardest part!</p>
      </div>

      <p>One month ago, you walked through our doors for the first time. Maybe you were nervous,
      unsure, or questioning if BJJ was right for you. But you showed up. You kept showing up.
      And now look at you—30 days later, you're part of The Fort family.</p>

      <div class="next-steps">
        <h3>What's Next on Your Journey:</h3>

        <p><strong>🎯 Set Your 3-Month Goals</strong><br>
        Where do you want to be by month three? More submissions? Better defense? Competing in a tournament?
        Let's build a plan to get you there.</p>

        <p><strong>🥋 Consider Getting Your Own Gi</strong><br>
        If you've been using loaners, now's a great time to invest in your own gi. It's like having
        your own armor—breaks in to fit you perfectly and feels amazing.</p>

        <p><strong>🤝 Bring a Friend</strong><br>
        Know someone who'd love BJJ? Bring them to a class! Training with friends makes it even better,
        and you'll help them experience what you've discovered.</p>

        <p><strong>📚 Start Studying (Optional)</strong><br>
        Ready to level up faster? Ask your instructors for video recommendations to study between classes.
        Watching high-level BJJ helps your brain process techniques.</p>

        <p><strong>🏆 Consider Your First Competition</strong><br>
        Not for everyone, but competitions accelerate learning dramatically. Even if you don't win,
        you'll learn more in one match than in ten training sessions.</p>
      </div>

      <p><strong>A Note from Your Coaches:</strong></p>
      <p style="font-style: italic; padding-left: 20px; border-left: 3px solid #ccc;">
        "${data.firstName}, watching you progress over this first month has been awesome. You're doing
        great. Keep showing up, keep asking questions, and remember—every black belt was once a
        white belt who never quit. We're proud to have you at The Fort."
      </p>

      <div style="text-align: center; margin: 40px 0;">
        <a href="tel:260-452-7615" class="cta-button">Got Questions? Call Us</a>
        <a href="https://maps.google.com/?q=1519+Goshen+Road+Fort+Wayne+IN+46808" class="cta-button"
           style="background-color: #fff; color: #000 !important; border: 2px solid #000;">Share The Fort</a>
      </div>

      <p style="margin-top: 40px;">
        Here's to many more months on the mats together!<br><br>
        Ossu,<br>
        The Fort Jiu-Jitsu Team
      </p>
    </div>
    <div class="footer">
      <p><strong>The Fort Jiu-Jitsu</strong></p>
      <p>1519 Goshen Road, Fort Wayne, IN 46808 | (260) 452-7615</p>
      <p style="margin-top: 20px; font-size: 12px;">
        Questions about your membership? Reply to this email anytime.
      </p>
    </div>
  </div>
</body>
</html>
    `,
  },
};
