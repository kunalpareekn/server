import Employee from "../models/employee.model.js";
import Department from "../models/department.model.js";

// Generate unique employee code
export const generateEmployeeCode = async (departmentId, joiningDate) => {
    try {
        // Get department info
        const department = await Department.findById(departmentId);
        const deptCode = department ? department.code : 'GEN';
        
        // Get year from joining date
        const year = new Date(joiningDate).getFullYear().toString().slice(-2);
        
        // Find the last employee code for this department and year
        const lastEmployee = await Employee.findOne({
            employeeCode: { $regex: `^${deptCode}${year}` }
        }).sort({ employeeCode: -1 });
        
        let sequence = 1;
        if (lastEmployee && lastEmployee.employeeCode) {
            const lastSequence = parseInt(lastEmployee.employeeCode.slice(-4));
            sequence = lastSequence + 1;
        }
        
        // Format: DEPTCODE + YEAR + 4-digit sequence (e.g., IT24001)
        const employeeCode = `${deptCode}${year}${sequence.toString().padStart(4, '0')}`;
        
        return employeeCode;
    } catch (error) {
        throw new Error(`Error generating employee code: ${error.message}`);
    }
};

// Validate employee code format
export const validateEmployeeCode = (code) => {
    const regex = /^[A-Z]{2,4}\d{6}$/;
    return regex.test(code);
};

// Check if employee code is unique
export const isEmployeeCodeUnique = async (code, excludeId = null) => {
    try {
        const query = { employeeCode: code };
        if (excludeId) {
            query._id = { $ne: excludeId };
        }
        
        const existingEmployee = await Employee.findOne(query);
        return !existingEmployee;
    } catch (error) {
        throw new Error(`Error checking employee code uniqueness: ${error.message}`);
    }
};

// Generate employee code on registration
export const assignEmployeeCode = async (employeeData) => {
    try {
        if (!employeeData.employeeCode) {
            const generatedCode = await generateEmployeeCode(
                employeeData.departmentId, 
                employeeData.joiningDate
            );
            employeeData.employeeCode = generatedCode;
        }
        
        // Validate the code
        if (!validateEmployeeCode(employeeData.employeeCode)) {
            throw new Error('Invalid employee code format');
        }
        
        // Check uniqueness
        const isUnique = await isEmployeeCodeUnique(employeeData.employeeCode);
        if (!isUnique) {
            throw new Error('Employee code already exists');
        }
        
        return employeeData.employeeCode;
    } catch (error) {
        throw error;
    }
};
