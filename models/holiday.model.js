import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ['National', 'Regional', 'Company', 'Optional'],
        default: 'Company'
    },
    description: {
        type: String,
        trim: true
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    departments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    year: {
        type: Number,
        required: true
    }
}, { timestamps: true });

// Index for efficient date queries
holidaySchema.index({ date: 1, year: 1 });

const Holiday = mongoose.model("Holiday", holidaySchema, "holidays");

export default Holiday;
