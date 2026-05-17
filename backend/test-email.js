const dotenv = require('dotenv');
dotenv.config();

const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('Testing email config...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET***' : '***MISSING***');

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify connection
    await transporter.verify();
    console.log('\n✅ SMTP connection verified! Email config is working correctly.');

    // Send a test email
    await transporter.sendMail({
      from: `"KeeBo Support" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'KeeBo - Test Email ✅',
      html: '<h2>Email is working!</h2><p>Your KeeBo OTP system is ready to go.</p>',
    });

    console.log('✅ Test email sent successfully to', process.env.EMAIL_USER);
  } catch (err) {
    console.error('\n❌ Email test failed:', err.message);
    if (err.code === 'EAUTH') {
      console.error('   → App Password is incorrect or 2FA is not enabled.');
    }
  }
  process.exit(0);
}

testEmail();
