import express from "express";
import {
    updateProfilePhoto,
    getProfilePhoto,
    deleteProfilePhoto,
    uploadProfilePhoto
} from "../../controllers/both/profilePhotoController.js";
import { authenticateToken } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Upload/Update profile photo
router.post("/upload", uploadProfilePhoto.single('profilePhoto'), updateProfilePhoto);

// Get profile photo
router.get("/:employeeId", getProfilePhoto);

// Delete profile photo
router.delete("/delete", deleteProfilePhoto);

export default router;
