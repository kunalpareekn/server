import express from "express";
import {
    generateIdCardData,
    generateVisitingCardData,
    generateEmployeeQRCode,
    bulkGenerateIdCards,
    getCardTemplateSettings
} from "../../controllers/both/cardGenerationController.js";
import { authenticateToken } from "../../middlewares/authMiddleware.js";
import isAdminAuthenticated from "../../middlewares/isAdminAuthenticated.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Generate ID card data for employee
router.get("/id-card/:employeeId", generateIdCardData);

// Generate visiting card data for employee
router.get("/visiting-card/:employeeId", generateVisitingCardData);

// Generate QR code for employee
router.get("/qr-code/:employeeId", generateEmployeeQRCode);

// Bulk generate ID cards for department (Admin only) - Override auth for this route
router.get("/bulk-id-cards/:departmentId", (req, res, next) => {
    // Remove the general auth and apply admin auth
    isAdminAuthenticated(req, res, next);
}, bulkGenerateIdCards);

// Get card template settings
router.get("/template-settings", getCardTemplateSettings);

export default router;
