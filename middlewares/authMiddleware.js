import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Employee from "../models/employee.model.js";

// General authentication middleware
export const authenticateToken = async (req, res, next) => {
    try {
        console.log("Received Cookies:", req.cookies);

        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }

        console.log("Extracted Token:", token);

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Decoded Token:", decoded);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Session expired, please log in again", success: false });
            }
            return res.status(401).json({ message: "Invalid token", success: false });
        }

        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: "Invalid or missing user data in token", success: false });
        }

        // Set user object with basic info
        req.user = {
            id: decoded.userId,
            _id: decoded.userId,
            role: decoded.role
        };

        console.log("Authenticated User:", req.user);
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(500).json({ message: "Server authentication error", error: error.message });
    }
};

// Admin-only authentication middleware
export const authenticateAdmin = async (req, res, next) => {
    try {
        console.log("Received Cookies:", req.cookies);

        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded);

        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: "Invalid token payload", success: false });
        }

        // Restrict access to admins only
        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Access restricted to admins only", success: false });
        }

        // Set user object with role info
        req.user = {
            id: decoded.userId,
            _id: decoded.userId,
            role: decoded.role
        };
        
        console.log("Authenticated Admin User:", req.user);
        next();
    } catch (error) {
        console.error("Admin Auth Middleware Error:", error);
        return res.status(500).json({ message: "Server authentication error", error: error.message });
    }
};

// Employee-only authentication middleware
export const authenticateEmployee = async (req, res, next) => {
    try {
        console.log("Received Cookies:", req.cookies);

        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: "User not authenticated", success: false });
        }

        console.log("Extracted Token:", token);

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Decoded Token:", decoded);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Session expired, please log in again", success: false });
            }
            return res.status(401).json({ message: "Invalid token", success: false });
        }

        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: "Invalid or missing user data in token", success: false });
        }

        // Restrict access to employees ONLY (Admins blocked)
        if (decoded.role !== "employee") {
            return res.status(403).json({ message: "Access restricted to employees only", success: false });
        }

        req.employee = { _id: decoded.userId };
        req.user = { 
            id: decoded.userId,
            _id: decoded.userId,
            role: decoded.role 
        };
        
        next();
    } catch (error) {
        console.error("Employee Auth Middleware Error:", error);
        return res.status(500).json({ message: "Server authentication error", error: error.message });
    }
};
