import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    description: {
        type: String,
        trim: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },
    employees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    budget: {
        type: Number,
        default: 0
    },
    location: {
        type: String,
        trim: true
    }
}, { timestamps: true });

const Department = mongoose.model("Department", departmentSchema, "departments");

export default Department;
