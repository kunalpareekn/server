import express from "express";
import {
    createHoliday,
    getAllHolidays,
    getHolidayById,
    updateHoliday,
    deleteHoliday,
    getCompanyCalendar
} from "../../controllers/admin/holidayController.js";
import isAdminAuthenticated from "../../middlewares/isAdminAuthenticated.js";

const router = express.Router();

// All routes require admin authentication
router.use(isAdminAuthenticated);

// Create new holiday
router.post("/create", createHoliday);

// Get all holidays (with optional year/month filter)
router.get("/all", getAllHolidays);

// Get company calendar
router.get("/calendar", getCompanyCalendar);

// Get holiday by ID
router.get("/:id", getHolidayById);

// Update holiday
router.put("/update/:id", updateHoliday);

// Delete holiday
router.delete("/delete/:id", deleteHoliday);

export default router;
