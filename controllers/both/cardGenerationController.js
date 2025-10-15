import Employee from "../../models/employee.model.js";
import Department from "../../models/department.model.js";
import fs from "fs";
import path from "path";

// Generate Employee ID Card Data
export const generateIdCardData = async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        const employee = await Employee.findById(employeeId)
            .populate('departmentId', 'name code')
            .populate('roleHierarchy', 'roleName level');
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }
        
        const idCardData = {
            employeeCode: employee.employeeCode,
            name: `${employee.name} ${employee.lastName}`,
            jobTitle: employee.jobTitle,
            department: employee.departmentId?.name || 'Not Assigned',
            email: employee.email,
            joiningDate: employee.joiningDate,
            profilePhoto: employee.profilePhoto?.filePath || null,
            isActive: employee.isActive,
            validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Valid for 1 year
            generatedAt: new Date(),
            qrCodeData: {
                employeeId: employee._id,
                employeeCode: employee.employeeCode,
                name: `${employee.name} ${employee.lastName}`,
                department: employee.departmentId?.name || 'Not Assigned'
            }
        };
        
        res.status(200).json({
            success: true,
            message: "ID card data generated successfully",
            data: idCardData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Generate Visiting Card Data
export const generateVisitingCardData = async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        const employee = await Employee.findById(employeeId)
            .populate('departmentId', 'name code')
            .populate('roleHierarchy', 'roleName level');
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }
        
        const visitingCardData = {
            name: `${employee.name} ${employee.lastName}`,
            jobTitle: employee.jobTitle,
            department: employee.departmentId?.name || 'Not Assigned',
            email: employee.email,
            phone: employee.phone1 || employee.phone2 || 'Not Provided',
            address: employee.address || 'Company Address',
            profilePhoto: employee.profilePhoto?.filePath || null,
            companyInfo: {
                name: "Your Company Name", // This should come from company settings
                logo: "/public/company-logo.png", // Company logo path
                website: "www.yourcompany.com",
                phone: "+1-234-567-8900"
            },
            generatedAt: new Date()
        };
        
        res.status(200).json({
            success: true,
            message: "Visiting card data generated successfully",
            data: visitingCardData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Generate QR Code for Employee
export const generateEmployeeQRCode = async (req, res) => {
    try {
        const { employeeId } = req.params;
        
        const employee = await Employee.findById(employeeId);
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }
        
        const qrData = {
            type: "employee_card",
            employeeId: employee._id,
            employeeCode: employee.employeeCode,
            name: `${employee.name} ${employee.lastName}`,
            email: employee.email,
            department: employee.departmentId,
            generatedAt: new Date().toISOString()
        };
        
        res.status(200).json({
            success: true,
            message: "QR code data generated successfully",
            data: {
                qrData: JSON.stringify(qrData),
                displayText: `${employee.name} ${employee.lastName} - ${employee.employeeCode}`
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Bulk generate ID cards for department
export const bulkGenerateIdCards = async (req, res) => {
    try {
        const { departmentId } = req.params;
        
        const employees = await Employee.find({ 
            departmentId, 
            isActive: true 
        }).populate('departmentId', 'name code');
        
        if (employees.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No active employees found in this department"
            });
        }
        
        const idCards = employees.map(employee => ({
            employeeId: employee._id,
            employeeCode: employee.employeeCode,
            name: `${employee.name} ${employee.lastName}`,
            jobTitle: employee.jobTitle,
            department: employee.departmentId?.name || 'Not Assigned',
            email: employee.email,
            joiningDate: employee.joiningDate,
            profilePhoto: employee.profilePhoto?.filePath || null,
            isActive: employee.isActive,
            validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            generatedAt: new Date()
        }));
        
        res.status(200).json({
            success: true,
            message: `Generated ${idCards.length} ID cards successfully`,
            data: idCards
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get card template settings
export const getCardTemplateSettings = async (req, res) => {
    try {
        // This would typically come from a settings/configuration table
        const templateSettings = {
            idCard: {
                width: 85.6, // mm (standard credit card size)
                height: 53.98, // mm
                backgroundColor: "#ffffff",
                primaryColor: "#2563eb",
                secondaryColor: "#64748b",
                logoPosition: "top-left",
                photoPosition: "top-right",
                fontSize: {
                    name: "14px",
                    title: "12px",
                    details: "10px"
                }
            },
            visitingCard: {
                width: 89, // mm (standard business card size)
                height: 51, // mm
                backgroundColor: "#ffffff",
                primaryColor: "#2563eb",
                secondaryColor: "#64748b",
                logoPosition: "top-left",
                photoPosition: "right",
                fontSize: {
                    name: "16px",
                    title: "14px",
                    details: "12px"
                }
            },
            companyInfo: {
                name: "Your Company Name",
                logo: "/public/company-logo.png",
                address: "123 Business Street, City, State 12345",
                phone: "+1-234-567-8900",
                email: "info@yourcompany.com",
                website: "www.yourcompany.com"
            }
        };
        
        res.status(200).json({
            success: true,
            data: templateSettings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
