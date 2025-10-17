import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./db/database.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";

// Import all routes
import adminRouter from "./routes/Auth/AdminRoutes.js";
import employeeRouter from "./routes/Auth/EmployeeRoutes.js";
import leaveEmployeeRouter from "./routes/Employee/LeaveEmployeeRoutes.js";
import leaveAdminRouter from "./routes/Admin/LeaveAdminRoutes.js";
import projectRouter from "./routes/Admin/ProjectsRoutes.js";
import attendanceRouter from "./routes/Both/AttendaceRoutes.js";
import payrollRouter from "./routes/Admin/PayrollRoutes.js";
import profileDetailsRouter from "./routes/Employee/ProfileDetailsRoutes.js";
import notificationRouter from "./routes/Admin/NotificationRoutes.js";
import uploadRouter from "./routes/Both/UploadRoutes.js";
import forgotPasswordRouter from "./routes/Both/ForgotPasswordRoutes.js";
import taskRouter from "./routes/Both/TaskRoutes.js";
import departmentRouter from "./routes/Admin/DepartmentRoutes.js";
import holidayRouter from "./routes/Admin/HolidayRoutes.js";
import profilePhotoRouter from "./routes/Both/ProfilePhotoRoutes.js";
import enhancedAttendanceRouter from "./routes/Both/EnhancedAttendanceRoutes.js";
import cardGenerationRouter from "./routes/Both/CardGenerationRoutes.js";

// -------------------- Setup --------------------
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// -------------------- Connect MongoDB --------------------
connectDB();

// -------------------- Middleware --------------------
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(apiLimiter);

// ✅ Proper CORS setup for Vercel + Render
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://vite-client-6k3r.onrender.com",
    credentials: true,
  })
);

// -------------------- API Routes --------------------

// -------- ADMIN ROUTES -------------
app.use("/api/v1/admin/auth", adminRouter);
app.use("/api/v1/admin/leave", leaveAdminRouter);
app.use("/api/v1/admin/project", projectRouter);
app.use("/api/v1/admin/payroll", payrollRouter);
app.use("/api/v1/admin/department", departmentRouter);
app.use("/api/v1/admin/holiday", holidayRouter);

// -------- EMPLOYEE ROUTES -------------
app.use("/api/v1/employee/auth", employeeRouter);
app.use("/api/v1/employee/leave", leaveEmployeeRouter);

// -------- BOTH ROUTES -------------
app.use("/api/v1/both/attendance", attendanceRouter);
app.use("/api/v1/both/notification", notificationRouter);
app.use("/api/v1/both/profile-details", profileDetailsRouter);
app.use("/api/v1/both/document", uploadRouter);
app.use("/api/v1/both/password", forgotPasswordRouter);
app.use("/api/v1/both/project-task", taskRouter);
app.use("/api/v1/both/profile-photo", profilePhotoRouter);
app.use("/api/v1/both/enhanced-attendance", enhancedAttendanceRouter);
app.use("/api/v1/both/card-generation", cardGenerationRouter);

// -------------------- Default Routes --------------------
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 EMS Backend API is running successfully!",
    version: "1.0.0",
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "❌ Route not found",
  });
});

// -------------------- Error Middleware --------------------
app.use(errorHandler);

// -------------------- Start Server --------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
