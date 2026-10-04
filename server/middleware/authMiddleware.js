const jwt = require("jsonwebtoken");

// ==========================================
// VERIFY TOKEN
// ==========================================
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Authorization header not provided
    if (!authHeader) {
        return res.status(401).json({
            message: "Access Denied: No Token Provided"
        });
    }

    // Check Bearer token format
    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Invalid Authorization Format"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access Denied: No Token Provided"
        });
    }

    try {
        const verified = jwt.verify(
            token,
            process.env.JWT_SECRET || "YOUR_SECRET_KEY"
        );

        req.user = verified;

        next();

    } catch (err) {
        console.error(
            "JWT Verification Error:",
            err.message
        );

        return res.status(403).json({
            message: "Invalid or Expired Token"
        });
    }
};


// ==========================================
// CHECK ROLE
// ==========================================
const checkRole = (allowedRoles) => {

    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        const userRole = String(
            req.user.role || ""
        ).toLowerCase();

        const lowerAllowedRoles = allowedRoles.map(
            role => String(role).toLowerCase()
        );

        if (!lowerAllowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: "Access Denied: Unauthorized Role"
            });
        }

        next();
    };
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    verifyToken,
    checkRole
};