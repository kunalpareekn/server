import User from "../models/user.model.js";
import Employee from "../models/employee.model.js";

// Authorize based on roles
export const authorizeRoles = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            
            // Check in User model first (for admin users)
            let user = await User.findById(userId);
            let userRole = user?.role;
            
            // If not found in User model, check Employee model
            if (!user) {
                const employee = await Employee.findById(userId).populate('roleHierarchy');
                userRole = employee?.role;
                
                // If employee has role hierarchy, use that for more granular permissions
                if (employee?.roleHierarchy) {
                    userRole = employee.roleHierarchy.roleName.toLowerCase();
                }
            }
            
            if (!userRole) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. User role not found."
                });
            }
            
            // Check if user's role is in allowed roles
            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Insufficient permissions."
                });
            }
            
            req.user.role = userRole;
            next();
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error checking user permissions"
            });
        }
    };
};

// Check specific permissions
export const checkPermission = (module, action) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            
            // Get employee with role hierarchy
            const employee = await Employee.findById(userId).populate('roleHierarchy');
            
            if (!employee || !employee.roleHierarchy) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Role hierarchy not found."
                });
            }
            
            const roleHierarchy = employee.roleHierarchy;
            
            // Check if role has permission for the module and action
            const modulePermission = roleHierarchy.permissions.find(p => p.module === module);
            
            if (!modulePermission || !modulePermission.actions.includes(action)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. No permission to ${action} ${module}.`
                });
            }
            
            next();
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error checking permissions"
            });
        }
    };
};

// Check approval permissions
export const checkApprovalPermission = (approvalType, amount = 0) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            
            const employee = await Employee.findById(userId).populate('roleHierarchy');
            
            if (!employee || !employee.roleHierarchy) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Role hierarchy not found."
                });
            }
            
            const roleHierarchy = employee.roleHierarchy;
            
            // Check if role can approve this type
            if (!roleHierarchy.canApprove.includes(approvalType)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Cannot approve ${approvalType}.`
                });
            }
            
            // Check amount limit if applicable
            if (amount > 0 && amount > roleHierarchy.maxApprovalAmount) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Amount exceeds approval limit of ${roleHierarchy.maxApprovalAmount}.`
                });
            }
            
            next();
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error checking approval permissions"
            });
        }
    };
};
