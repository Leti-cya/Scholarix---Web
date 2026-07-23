const express = require("express")
const verifyToken = require("../middleware/verifyToken")

const {
    register,
    login,
    checkEmail,
    getProfile,
    updateProfile,
    resetPassword,
    getProviderPublicProfile
} = require("../controller/authController")

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/check-email", checkEmail)
router.get("/profile", verifyToken, getProfile)
router.put("/profile", verifyToken, updateProfile)
router.post("/reset-password", resetPassword)
router.get("/provider/:id", getProviderPublicProfile)

module.exports = router