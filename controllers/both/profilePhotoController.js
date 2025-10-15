import Employee from "../../models/employee.model.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for profile photo upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'public/uploads/profile-photos';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `profile-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

export const uploadProfilePhoto = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

// Upload profile photo
export const updateProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const employeeId = req.user.id;
        const employee = await Employee.findById(employeeId);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        // Delete old profile photo if exists
        if (employee.profilePhoto && employee.profilePhoto.filePath) {
            const oldFilePath = employee.profilePhoto.filePath;
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        // Update employee with new profile photo
        employee.profilePhoto = {
            fileName: req.file.filename,
            filePath: req.file.path,
            uploadedAt: new Date()
        };

        await employee.save();

        res.status(200).json({
            success: true,
            message: "Profile photo updated successfully",
            data: {
                profilePhoto: employee.profilePhoto
            }
        });
    } catch (error) {
        // Clean up uploaded file if error occurs
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get profile photo
export const getProfilePhoto = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const employee = await Employee.findById(employeeId);

        if (!employee || !employee.profilePhoto || !employee.profilePhoto.filePath) {
            return res.status(404).json({
                success: false,
                message: "Profile photo not found"
            });
        }

        const filePath = employee.profilePhoto.filePath;
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "Profile photo file not found"
            });
        }

        res.sendFile(path.resolve(filePath));
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete profile photo
export const deleteProfilePhoto = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const employee = await Employee.findById(employeeId);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        if (employee.profilePhoto && employee.profilePhoto.filePath) {
            const filePath = employee.profilePhoto.filePath;
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        employee.profilePhoto = undefined;
        await employee.save();

        res.status(200).json({
            success: true,
            message: "Profile photo deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
