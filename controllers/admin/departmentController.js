import Department from "../../models/department.model.js";
import Employee from "../../models/employee.model.js";

// Create new department
export const createDepartment = async (req, res) => {
    try {
        const { name, code, description, manager, budget, location } = req.body;
        
        const department = new Department({
            name,
            code: code.toUpperCase(),
            description,
            manager,
            budget,
            location
        });
        
        await department.save();
        
        res.status(201).json({
            success: true,
            message: "Department created successfully",
            data: department
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all departments
export const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true })
            .populate('manager', 'name lastName email')
            .populate('employees', 'name lastName email employeeCode');
        
        res.status(200).json({
            success: true,
            data: departments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get department by ID
export const getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id)
            .populate('manager', 'name lastName email')
            .populate('employees', 'name lastName email employeeCode jobTitle');
        
        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: department
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update department
export const updateDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('manager', 'name lastName email');
        
        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Department updated successfully",
            data: department
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Assign employee to department
export const assignEmployeeToDepartment = async (req, res) => {
    try {
        const { departmentId, employeeId } = req.body;
        
        const department = await Department.findById(departmentId);
        const employee = await Employee.findById(employeeId);
        
        if (!department || !employee) {
            return res.status(404).json({
                success: false,
                message: "Department or Employee not found"
            });
        }
        
        // Update employee's department
        employee.departmentId = departmentId;
        await employee.save();
        
        // Add employee to department if not already present
        if (!department.employees.includes(employeeId)) {
            department.employees.push(employeeId);
            await department.save();
        }
        
        res.status(200).json({
            success: true,
            message: "Employee assigned to department successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete department (soft delete)
export const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        
        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Department deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
