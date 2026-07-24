const express = require("express")
const verifyToken = require("../middleware/verifyToken")

const {
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
} = require("../controller/authController")

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/check-email", checkEmail)
router.get("/profile", verifyToken, getProfile)
router.put("/profile", verifyToken, updateProfile)
router.post("/forgot-password", forgotPassword)
router.get("/verify-reset-token", verifyResetToken)
router.post("/reset-password", resetPassword)
router.get("/verify-email", verifyEmail)
router.post("/resend-verification", verifyToken, resendVerification)
router.get("/provider/:id", getProviderPublicProfile)

module.exports = router