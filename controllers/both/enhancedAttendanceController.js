import Attendance from "../../models/attendance.model.js";
import Employee from "../../models/employee.model.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for attendance photos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'public/uploads/attendance-photos';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const type = req.body.type || 'clockin'; // clockin or clockout
        cb(null, `${type}-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

export const uploadAttendancePhoto = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: fileFilter
});

// Enhanced Clock In with image and geolocation
export const clockInWithImage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            latitude, 
            longitude, 
            address, 
            accuracy, 
            workLocation = 'office',
            ipAddress,
            userAgent,
            deviceType
        } = req.body;

        // Check if user already clocked in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existingAttendance = await Attendance.findOne({
            userId,
            date: { $gte: today }
        });

        if (existingAttendance && existingAttendance.clockIn) {
            return res.status(400).json({
                success: false,
                message: "You have already clocked in today"
            });
        }

        let clockInImage = null;
        if (req.file) {
            clockInImage = {
                fileName: req.file.filename,
                filePath: req.file.path,
                uploadedAt: new Date()
            };
        }

        const attendanceData = {
            userId,
            clockIn: new Date(),
            clockInImage,
            clockInLocation: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                address,
                accuracy: parseFloat(accuracy)
            },
            networkInfo: {
                ipAddress,
                userAgent,
                deviceType
            },
            workLocation,
            status: 'present'
        };

        let attendance;
        if (existingAttendance) {
            // Update existing record
            Object.assign(existingAttendance, attendanceData);
            attendance = await existingAttendance.save();
        } else {
            // Create new record
            attendance = new Attendance(attendanceData);
            await attendance.save();
        }

        res.status(200).json({
            success: true,
            message: "Clocked in successfully",
            data: attendance
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

// Enhanced Clock Out with image and geolocation
export const clockOutWithImage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            latitude, 
            longitude, 
            address, 
            accuracy,
            ipAddress,
            userAgent,
            deviceType
        } = req.body;

        // Find today's attendance record
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const attendance = await Attendance.findOne({
            userId,
            date: { $gte: today },
            clockIn: { $exists: true },
            clockOut: { $exists: false }
        });

        if (!attendance) {
            return res.status(400).json({
                success: false,
                message: "No clock-in record found for today or already clocked out"
            });
        }

        let clockOutImage = null;
        if (req.file) {
            clockOutImage = {
                fileName: req.file.filename,
                filePath: req.file.path,
                uploadedAt: new Date()
            };
        }

        attendance.clockOut = new Date();
        attendance.clockOutImage = clockOutImage;
        attendance.clockOutLocation = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            address,
            accuracy: parseFloat(accuracy)
        };
        
        // Update network info for clock out
        attendance.networkInfo = {
            ...attendance.networkInfo,
            clockOutIpAddress: ipAddress,
            clockOutUserAgent: userAgent,
            clockOutDeviceType: deviceType
        };

        await attendance.save();

        res.status(200).json({
            success: true,
            message: "Clocked out successfully",
            data: attendance
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

// Get attendance photo
export const getAttendancePhoto = async (req, res) => {
    try {
        const { attendanceId, type } = req.params; // type: 'clockin' or 'clockout'
        
        const attendance = await Attendance.findById(attendanceId);
        
        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found"
            });
        }

        let imageData;
        if (type === 'clockin') {
            imageData = attendance.clockInImage;
        } else if (type === 'clockout') {
            imageData = attendance.clockOutImage;
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid image type. Use 'clockin' or 'clockout'"
            });
        }

        if (!imageData || !imageData.filePath) {
            return res.status(404).json({
                success: false,
                message: `${type} photo not found`
            });
        }

        const filePath = imageData.filePath;
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "Photo file not found"
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

// Get attendance with location and images
export const getAttendanceWithDetails = async (req, res) => {
    try {
        const { date, employeeId } = req.query;
        const userId = employeeId || req.user.id;
        
        let query = { userId };
        
        if (date) {
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(targetDate);
            nextDay.setDate(nextDay.getDate() + 1);
            
            query.date = {
                $gte: targetDate,
                $lt: nextDay
            };
        }
        
        const attendance = await Attendance.find(query)
            .populate('userId', 'name lastName email employeeCode')
            .sort({ date: -1 });
        
        res.status(200).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Validate attendance location (for admin)
export const validateAttendanceLocation = async (req, res) => {
    try {
        const { attendanceId, isValid, comments } = req.body;
        
        const attendance = await Attendance.findById(attendanceId);
        
        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found"
            });
        }
        
        attendance.locationValidated = isValid;
        attendance.validationComments = comments;
        attendance.validatedBy = req.user.id;
        attendance.validatedAt = new Date();
        
        await attendance.save();
        
        res.status(200).json({
            success: true,
            message: "Attendance location validation updated",
            data: attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
