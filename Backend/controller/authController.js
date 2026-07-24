const bcrypt = require("bcrypt")
const JWT = require("jsonwebtoken")
const crypto = require("crypto")

const {
    findUserByEmail,
    createUser,
    updateUserProfile,
    findUserById,
    findUserByVerificationToken,
    markUserVerified,
    setVerificationToken,
    setPasswordResetToken,
    findUserByResetToken,
    resetPasswordWithToken
} = require("../model/userModel")
const { getScholarshipsByProvider } = require("../model/scholarshipModel");

const { createNotification } = require("../model/notificationModel")
const { sendMail } = require("../utils/mailer")

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173"
const IS_DEV = process.env.NODE_ENV !== "production"

function makeVerificationToken() {
    return {
        token: crypto.randomBytes(32).toString("hex"),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }
}

function makePasswordResetToken() {
    return {
        token: crypto.randomBytes(32).toString("hex"),
        expires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour — shorter-lived, sensitive action
    }
}

async function sendPasswordResetEmail(email, token) {
    const link = `${CLIENT_URL}/reset-password?token=${token}`
    return sendMail({
        to: email,
        subject: "Reset your Scholarix password",
        text: `We received a request to reset your Scholarix password:\n\n${link}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.`,
        html: `
            <div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:auto">
              <h2 style="color:#1D4ED8">Reset your password 🔑</h2>
              <p>We received a request to reset the password on your Scholarix account.</p>
              <p style="margin:24px 0">
                <a href="${link}" style="background:#1D4ED8;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600">Reset my password →</a>
              </p>
              <p style="color:#64748B;font-size:13px">Or paste this link into your browser:<br>${link}</p>
              <p style="color:#94A3B8;font-size:12px">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
            </div>`
    })
}

async function sendVerificationEmail(email, token) {
    const link = `${CLIENT_URL}/verify-email?token=${token}`
    return sendMail({
        to: email,
        subject: "Verify your Scholarix account",
        text: `Welcome to Scholarix! Confirm your email to activate your account:\n\n${link}\n\nThis link expires in 24 hours.`,
        html: `
            <div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:auto">
              <h2 style="color:#1D4ED8">Welcome to Scholarix 🎓</h2>
              <p>Confirm your email address to activate your account and start matching with scholarships.</p>
              <p style="margin:24px 0">
                <a href="${link}" style="background:#1D4ED8;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:600">Verify my email →</a>
              </p>
              <p style="color:#64748B;font-size:13px">Or paste this link into your browser:<br>${link}</p>
              <p style="color:#94A3B8;font-size:12px">This link expires in 24 hours.</p>
            </div>`
    })
}

const register = async (req, res) => {
    try {
        const data = req.body

        const existingUser = await findUserByEmail(data.email)

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(
            data.password,
            10
        )

        data.password = hashedPassword

        const { token: verifyToken, expires: verifyExpires } = makeVerificationToken()
        data.verificationToken = verifyToken
        data.verificationExpires = verifyExpires

        const user = await createUser(data)

        const { password, verification_token, ...safeUser } = user

        const mailResult = await sendVerificationEmail(user.email, verifyToken)

        try {
            await createNotification({
                userId: user.id,
                type: "info",
                title: "Welcome to Scholarix 🎉",
                body: "Please verify your email address to unlock all features.",
                link: "/verify-email"
            })
        } catch (notifErr) {
            console.error("WELCOME NOTIFICATION ERROR:", notifErr.message)
        }

        const token = JWT.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || "xfxghxmcz",
            { expiresIn: "7d" }
        )

        res.status(201).json({
            message: "Account created successfully",
            token,
            user: safeUser,
            emailDelivered: mailResult.delivered,
            ...(IS_DEV ? { devVerificationToken: verifyToken } : {})
        })

    } catch (e) {
        console.error("REGISTER ERROR:", e);
        res.status(500).json({
            message: e.message
        });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            })
        }

        const user = await findUserByEmail(email)

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password."
            })
        }

        const { password: _, ...safeUser } = user

        const token = JWT.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || "xfxghxmcz",
            { expiresIn: "7d" }
        )

        res.status(200).json({
            message: "Login successful",
            token,
            user: safeUser
        })

    } catch (e) {
        console.error("LOGIN ERROR:", e);
        res.status(500).json({
            message: e.message
        });
    }
}

const checkEmail = async (req, res) => {
    try {
        const { email } = req.query

        if (!email) {
            return res.status(400).json({
                message: "Email parameter is required."
            })
        }

        const user = await findUserByEmail(email)

        res.status(200).json({
            exists: !!user
        })

    } catch (e) {
        console.error("CHECK EMAIL ERROR:", e);
        res.status(500).json({
            message: e.message
        });
    }
}

const getProfile = async (req, res) => {
    try {
        const user = await findUserByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        const { password, ...safeUser } = user;
        res.status(200).json(safeUser);
    } catch (e) {
        console.error("GET PROFILE ERROR:", e);
        res.status(500).json({
            message: e.message
        });
    }
}

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const updatedUser = await updateUserProfile(userId, role, req.body);
        if (!updatedUser) {
            return res.status(404).json({ message: "User profile not found." });
        }
        const { password, ...safeUser } = updatedUser;
        res.status(200).json({
            message: "Profile updated successfully",
            user: safeUser
        });
    } catch (e) {
        console.error("UPDATE PROFILE ERROR:", e);
        res.status(500).json({
            message: e.message
        });
    }
}

/**
 * Step 1 of the forgot-password flow.
 * POST /api/auth/forgot-password  { email }
 *
 * Always responds with the same generic message regardless of whether the
 * email exists, so this endpoint can't be used to enumerate registered users.
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email address is required." });
        }

        const genericResponse = {
            message: "If an account exists for that email, a password reset link has been sent."
        };

        const user = await findUserByEmail(email);

        if (!user) {
            // Don't reveal whether the account exists.
            return res.status(200).json(genericResponse);
        }

        const { token, expires } = makePasswordResetToken();
        await setPasswordResetToken(email, token, expires);
        const mailResult = await sendPasswordResetEmail(email, token);

        res.status(200).json({
            ...genericResponse,
            emailDelivered: mailResult.delivered,
            ...(IS_DEV ? { devResetToken: token } : {})
        });

    } catch (e) {
        console.error("FORGOT PASSWORD ERROR:", e);
        res.status(500).json({
            message: e.message
        });
    }
}

/**
 * Lets the reset-password page validate the token from the email link
 * before showing the "set a new password" form.
 * GET /api/auth/verify-reset-token?token=xxxx
 */
const verifyResetToken = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ valid: false, message: "Reset token is required." });
        }

        const user = await findUserByResetToken(token);

        if (!user) {
            return res.status(400).json({
                valid: false,
                message: "This reset link is invalid or has expired."
            });
        }

        res.status(200).json({ valid: true, email: user.email });

    } catch (e) {
        console.error("VERIFY RESET TOKEN ERROR:", e);
        res.status(500).json({ valid: false, message: e.message });
    }
}

/**
 * Step 2 of the forgot-password flow — consumes the token from the email
 * link and sets the new password. This is the only way a password can be
 * changed via "forgot password" (no email-only path anymore).
 * POST /api/auth/reset-password  { token, newPassword }
 */
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                message: "Reset token and new password are required."
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters."
            });
        }

        const user = await findUserByResetToken(token);

        if (!user) {
            return res.status(400).json({
                message: "This reset link is invalid or has expired. Please request a new one."
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await resetPasswordWithToken(user.id, hashedPassword);

        try {
            await createNotification({
                userId: user.id,
                type: "success",
                title: "Password changed 🔒",
                body: "Your password was successfully updated. If this wasn't you, contact support immediately."
            });
        } catch (notifErr) {
            console.error("RESET NOTIFICATION ERROR:", notifErr.message);
        }

        res.status(200).json({
            message: "Password updated successfully. You can now sign in with your new password."
        });

    } catch (e) {
        console.error("RESET PASSWORD ERROR:", e);
        res.status(500).json({
            message: e.message
        });
    }
}

const getProviderPublicProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await findUserById(id);
        if (!user || user.role !== "provider") {
            return res.status(404).json({ message: "Provider profile not found." });
        }
        const scholarships = await getScholarshipsByProvider(id);
        const { password, ...safeUser } = user;
        res.status(200).json({
            provider: safeUser,
            scholarships
        });
    } catch (e) {
        console.error("GET PROVIDER PUBLIC PROFILE ERROR:", e);
        res.status(500).json({
            message: e.message
        });
    }
}

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: "Verification token is required." });
        }

        const user = await findUserByVerificationToken(token);

        if (!user) {
            return res.status(400).json({
                message: "This verification link is invalid or has expired."
            });
        }

        if (user.is_verified) {
            return res.status(200).json({ message: "Your email is already verified.", alreadyVerified: true });
        }

        await markUserVerified(user.id);

        try {
            await createNotification({
                userId: user.id,
                type: "success",
                title: "Email verified ✅",
                body: "Your account is now fully activated. Welcome aboard!"
            });
        } catch (notifErr) {
            console.error("VERIFY NOTIFICATION ERROR:", notifErr.message);
        }

        res.status(200).json({ message: "Email verified successfully. Your account is now active." });

    } catch (e) {
        console.error("VERIFY EMAIL ERROR:", e);
        res.status(500).json({ message: e.message });
    }
}

const resendVerification = async (req, res) => {
    try {
        const user = await findUserByEmail(req.user.email);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (user.is_verified) {
            return res.status(400).json({ message: "Your email is already verified." });
        }

        const { token, expires } = makeVerificationToken();
        await setVerificationToken(user.id, token, expires);
        const mailResult = await sendVerificationEmail(user.email, token);

        res.status(200).json({
            message: "Verification email sent. Please check your inbox.",
            emailDelivered: mailResult.delivered,
            ...(IS_DEV ? { devVerificationToken: token } : {})
        });

    } catch (e) {
        console.error("RESEND VERIFICATION ERROR:", e);
        res.status(500).json({ message: e.message });
    }
}

module.exports = {
    register,
    login,
    checkEmail,
    getProfile,
    updateProfile,
    forgotPassword,
    verifyResetToken,
    resetPassword,
    verifyEmail,
    resendVerification,
    getProviderPublicProfile
}