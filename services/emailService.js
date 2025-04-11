const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
  },
});

exports.sendVerificationEmail = async (email, firstName, verificationToken) => {
    try {
        const verificationLink = `${process.env.APP_URL}/users/verify/${verificationToken}`;

        const mailOptions = {
            from: `"Suresh Shrestha" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify your email",
            html: `
                <div style="font-size:15px;">
                    <p>Hi ${firstName},</p>
                    <p>
                        Thank you for signing up! Please click <a href="${verificationLink}">here</a> to verify your email address.
                    </p>
                    <p>Best regards,
                    <br>
                    ${process.env.SENDER_NAME}</p>
                </div>
                <hr>
                <p style="font-size:12px; color:gray;">
                    If you received this email by mistake, you can safely ignore or delete it.
                </p>`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}`);
    } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
    }
};

exports.resetPasswordEmail = async (firstName, email, resetToken) => {
    try {
        const resetUrl = `${process.env.APP_URL}/password-reset/${resetToken}`;
        const expiryTime = (parseInt(process.env.RESET_PASSWORD_EXPIRY, 10) ?? 3600000) / 60000; // Convert ms to minutes

        const mailOptions = {
            from: `"Suresh Shrestha" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Password reset request",
            html: `
                <div style="font-size:15px;">
                    <p>Hi ${firstName},</p>
                    <p>
                        You recently requested to reset your password. Please click <a href="${resetUrl}">here</a> to reset your password. This link will expire in <strong>${expiryTime} minutes</strong>.
                    </p>
                    <p>Thanks,
                    <br>
                    ${process.env.SENDER_NAME}</p>
                </div>
                <hr>
                <p style="font-size:12px; color:gray;">
                    If you received this email by mistake, you can safely ignore or delete it.
                </p>`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}`);
    } catch (error) {
        console.error("Forgot password error:", error);
    }
};
