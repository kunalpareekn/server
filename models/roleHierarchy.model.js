import mongoose from "mongoose";

const roleHierarchySchema = new mongoose.Schema({
    roleName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    level: {
        type: Number,
        required: true,
        min: 1
    },
    permissions: [{
        module: {
            type: String,
            required: true,
            enum: ['employees', 'attendance', 'leave', 'payroll', 'projects', 'reports', 'settings', 'departments']
        },
        actions: [{
            type: String,
            enum: ['create', 'read', 'update', 'delete', 'approve', 'reject']
        }]
    }],
    reportsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RoleHierarchy'
    },
    canApprove: [{
        type: String,
        enum: ['leave', 'expense', 'overtime', 'project', 'payroll']
    }],
    maxApprovalAmount: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Index for efficient level-based queries
roleHierarchySchema.index({ level: 1 });

const RoleHierarchy = mongoose.model("RoleHierarchy", roleHierarchySchema, "roleHierarchies");

export default RoleHierarchy;
