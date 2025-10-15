import express from "express";
import {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    assignEmployeeToDepartment,
    deleteDepartment
} from "../../controllers/admin/departmentController.js";
import isAdminAuthenticated from "../../middlewares/isAdminAuthenticated.js";

const router = express.Router();

// All routes require admin authentication
router.use(isAdminAuthenticated);

// Create new department
router.post("/create", createDepartment);

// Get all departments
router.get("/all", getAllDepartments);

// Get department by ID
router.get("/:id", getDepartmentById);

// Update department
router.put("/update/:id", updateDepartment);

// Assign employee to department
router.post("/assign-employee", assignEmployeeToDepartment);

// Delete department
router.delete("/delete/:id", deleteDepartment);

export default router;
