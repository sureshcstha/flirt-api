const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Function to send the verification email with retry logic
const sendVerificationEmailWithRetry = async (email, firstName, verificationToken, retries = 3, delay = 5000) => {
    let attempt = 0;
    while (attempt < retries) {
        try {
            const verificationLink = `${process.env.APP_URL}/users/verify/${verificationToken}`;
            const msg = {
                to: email,
                from: {
                    email: process.env.SENDER_EMAIL,
                    name: process.env.SENDER_NAME || 'Suresh Shrestha'
                },
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

            await sgMail.send(msg);
            console.log(`Email sent to ${email}`);
            return; // Exit if successful
        } catch (error) {
            attempt++;
            console.error(`Attempt ${attempt} failed: ${error.message}`);

            if (attempt < retries) {
                console.log(`Retrying in ${delay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retrying
            } else {
                console.error("Max retries reached. Email could not be sent.");
            }
        }
    }
};

exports.sendVerificationEmail = sendVerificationEmailWithRetry;

// Reset password email
exports.resetPasswordEmail = async (firstName, email, resetToken) => {
    try {
        const resetUrl = `${process.env.FRONTEND_URL}/password-reset/${resetToken}`;
        const expiryTime = (parseInt(process.env.RESET_PASSWORD_EXPIRY, 10) ?? 3600000) / 60000; // Convert ms to minutes

        const msg = {
            to: email,
            from: {
                email: process.env.SENDER_EMAIL,
                name: process.env.SENDER_NAME || 'Suresh Shrestha'
            },
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

        await sgMail.send(msg);
        console.log(`Email sent to ${email}`);
    } catch (error) {
        console.error("Forgot password error:", error);
    }
};
