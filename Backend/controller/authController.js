const bcrypt = require("bcrypt")
const JWT = require("jsonwebtoken")

const {
    findUserByEmail,
    createUser,
    updateUserPassword,
    updateUserProfile,
    findUserById
} = require("../model/userModel")
const { getScholarshipsByProvider } = require("../model/scholarshipModel");

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

        const user = await createUser(data)

        const { password, ...safeUser } = user

        const token = JWT.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || "xfxghxmcz",
            { expiresIn: "7d" }
        )

        res.status(201).json({
            message: "Account created successfully",
            token,
            user: safeUser
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

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                message: "Email and new password are required."
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters."
            });
        }

        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(404).json({
                message: "No account found with this email address."
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await updateUserPassword(email, hashedPassword);

        res.status(200).json({
            message: "Password updated successfully in database."
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

module.exports = {
    register,
    login,
    checkEmail,
    getProfile,
    updateProfile,
    resetPassword,
    getProviderPublicProfile
}