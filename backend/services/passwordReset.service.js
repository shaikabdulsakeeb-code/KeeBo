const crypto = require('crypto');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

/**
 * Generate a 6-digit OTP, hash it, store on user, and email it.
 */
exports.sendResetOtp = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorResponse('No account found with that email', 404);
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP before storing (same idea as hashing passwords)
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  // Store hashed OTP and expiry (10 minutes) using findOneAndUpdate
  // to reliably write select:false fields
  await User.findOneAndUpdate(
    { _id: user._id },
    {
      $set: {
        resetOtp: hashedOtp,
        resetOtpExpire: new Date(Date.now() + 10 * 60 * 1000),
      },
    }
  );

  // Send email with OTP
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #2563EB 0%, #1e40af 100%); padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🔐 KeeBo</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Password Reset Request</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
          Hi <strong>${user.name}</strong>, we received a request to reset your password. Use the verification code below:
        </p>
        <div style="background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%); border: 2px dashed #2563EB; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #2563EB; font-family: 'Courier New', monospace;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0 0 8px;">
          ⏱️ This code expires in <strong>10 minutes</strong>.
        </p>
        <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
      <div style="background: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} KeeBo. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: 'KeeBo - Password Reset OTP',
      html,
    });
  } catch (err) {
    // Clear OTP fields if email fails
    await User.findOneAndUpdate(
      { _id: user._id },
      { $unset: { resetOtp: '', resetOtpExpire: '' } }
    );
    throw new ErrorResponse('Email could not be sent. Please try again later.', 500);
  }

  return { message: 'OTP sent to your email address' };
};

/**
 * Verify the OTP entered by the user.
 */
exports.verifyOtp = async (email, otp) => {
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({
    email,
    resetOtp: hashedOtp,
    resetOtpExpire: { $gt: new Date() },
  }).select('+resetOtp +resetOtpExpire');

  if (!user) {
    throw new ErrorResponse('Invalid or expired OTP', 400);
  }

  // Mark OTP as verified — extend expiry by 5 min for password reset step
  // but change the OTP so it can't be re-verified
  const verifiedToken = crypto.createHash('sha256').update(otp + '_verified').digest('hex');
  await User.findOneAndUpdate(
    { _id: user._id },
    {
      $set: {
        resetOtp: verifiedToken,
        resetOtpExpire: new Date(Date.now() + 5 * 60 * 1000),
      },
    }
  );

  return { message: 'OTP verified successfully', verifiedToken };
};

/**
 * Reset the password after OTP verification.
 */
exports.resetPassword = async (email, otp, newPassword) => {
  // Check for the verified token (otp + '_verified')
  const verifiedToken = crypto.createHash('sha256').update(otp + '_verified').digest('hex');

  const user = await User.findOne({
    email,
    resetOtp: verifiedToken,
    resetOtpExpire: { $gt: new Date() },
  }).select('+resetOtp +resetOtpExpire +password');

  if (!user) {
    throw new ErrorResponse('Session expired. Please request a new OTP.', 400);
  }

  // Set new password and clear OTP fields
  user.password = newPassword;
  user.resetOtp = undefined;
  user.resetOtpExpire = undefined;
  await user.save();

  return { message: 'Password reset successful' };
};
