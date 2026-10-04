const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require("../middleware/authMiddleware");
const db = require("../config/db");

// =====================================================
// PROFILE
// =====================================================

router.get("/profile", verifyToken, (req, res) => {
    res.json({
        message: "Profile data retrieved successfully",
        user: req.user,
    });
});

// =====================================================
// ADMIN PANEL
// =====================================================

router.get(
    "/admin-panel",
    verifyToken,
    checkRole(["admin"]),
    (req, res) => {
        res.json({
            message: "Welcome to the admin panel",
        });
    }
);

// =====================================================
// GET NOTIFICATIONS
// LOGGED-IN USER
// =====================================================

router.get("/notifications", verifyToken, (req, res) => {
    const userId = req.user?.id;

    console.log("=================================");
    console.log("NOTIFICATION REQUEST");
    console.log("Logged in user:", req.user);
    console.log("User ID:", userId);
    console.log("=================================");

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "User ID missing from token",
        });
    }

    const query = `
        SELECT
            id,
            user_id,
            title,
            message,
            type,
            is_read,
            created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC, id DESC
    `;

    db.query(query, [userId], (err, notifications) => {
        if (err) {
            console.error(
                "❌ Error fetching notifications:",
                err
            );

            return res.status(500).json({
                success: false,
                message: "Failed to load notifications",
            });
        }

        console.log(
            `✅ Notifications found for user ${userId}:`,
            notifications.length
        );

        res.status(200).json(
            notifications || []
        );
    });
});

module.exports = router;