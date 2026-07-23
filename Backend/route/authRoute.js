const express = require("express")
const verifyToken = require("../middleware/verifyToken")

const {
    register,
    login,
    checkEmail,
    getProfile,
    resetPassword
} = require("../controller/authController")

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/check-email", checkEmail)
router.get("/profile", verifyToken, getProfile)
router.post("/reset-password", resetPassword)

module.exports = router