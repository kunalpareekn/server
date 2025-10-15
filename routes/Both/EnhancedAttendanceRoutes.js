import express from "express";
import {
    clockInWithImage,
    clockOutWithImage,
    getAttendancePhoto,
    getAttendanceWithDetails,
    validateAttendanceLocation,
    uploadAttendancePhoto
} from "../../controllers/both/enhancedAttendanceController.js";
import { authenticateToken } from "../../middlewares/authMiddleware.js";
import isAdminAuthenticated from "../../middlewares/isAdminAuthenticated.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Clock in with image and geolocation
router.post("/clock-in", uploadAttendancePhoto.single('attendancePhoto'), clockInWithImage);

// Clock out with image and geolocation
router.post("/clock-out", uploadAttendancePhoto.single('attendancePhoto'), clockOutWithImage);

// Get attendance photo
router.get("/photo/:attendanceId/:type", getAttendancePhoto);

// Get attendance with details (location, images)
router.get("/details", getAttendanceWithDetails);

// Validate attendance location (Admin only)
router.post("/validate-location", isAdminAuthenticated, validateAttendanceLocation);

export default router;
