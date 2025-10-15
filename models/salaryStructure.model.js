import mongoose from "mongoose";

const salaryStructureSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    effectiveDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    
    // Basic Salary Components
    basicSalary: {
        type: Number,
        required: true
    },
    
    // Allowances
    allowances: {
        houseRentAllowance: {
            type: Number,
            default: 0
        },
        medicalAllowance: {
            type: Number,
            default: 0
        },
        transportAllowance: {
            type: Number,
            default: 0
        },
        foodAllowance: {
            type: Number,
            default: 0
        },
        specialAllowance: {
            type: Number,
            default: 0
        },
        performanceAllowance: {
            type: Number,
            default: 0
        },
        overtimeAllowance: {
            type: Number,
            default: 0
        }
    },
    
    // Employer Contributions
    employerContributions: {
        providentFund: {
            percentage: { type: Number, default: 12 },
            amount: { type: Number, default: 0 }
        },
        esi: {
            percentage: { type: Number, default: 3.25 },
            amount: { type: Number, default: 0 }
        },
        gratuity: {
            percentage: { type: Number, default: 4.81 },
            amount: { type: Number, default: 0 }
        },
        bonus: {
            percentage: { type: Number, default: 8.33 },
            amount: { type: Number, default: 0 }
        }
    },
    
    // Employee Deductions
    deductions: {
        providentFund: {
            percentage: { type: Number, default: 12 },
            amount: { type: Number, default: 0 }
        },
        esi: {
            percentage: { type: Number, default: 0.75 },
            amount: { type: Number, default: 0 }
        },
        professionalTax: {
            amount: { type: Number, default: 200 }
        },
        incomeTax: {
            amount: { type: Number, default: 0 }
        },
        otherDeductions: {
            amount: { type: Number, default: 0 },
            description: String
        }
    },
    
    // Calculated Fields
    grossSalary: {
        type: Number,
        default: 0
    },
    totalDeductions: {
        type: Number,
        default: 0
    },
    netSalary: {
        type: Number,
        default: 0
    },
    ctc: {
        type: Number,
        default: 0
    },
    
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Approval
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },
    approvedDate: Date,
    
    // Comments
    comments: String
    
}, { timestamps: true });

// Pre-save middleware to calculate totals
salaryStructureSchema.pre('save', function(next) {
    // Calculate gross salary
    const allowanceTotal = Object.values(this.allowances).reduce((sum, val) => sum + (val || 0), 0);
    this.grossSalary = this.basicSalary + allowanceTotal;
    
    // Calculate employer contributions
    this.employerContributions.providentFund.amount = (this.basicSalary * this.employerContributions.providentFund.percentage) / 100;
    this.employerContributions.esi.amount = (this.grossSalary * this.employerContributions.esi.percentage) / 100;
    this.employerContributions.gratuity.amount = (this.basicSalary * this.employerContributions.gratuity.percentage) / 100;
    this.employerContributions.bonus.amount = (this.basicSalary * this.employerContributions.bonus.percentage) / 100;
    
    // Calculate employee deductions
    this.deductions.providentFund.amount = (this.basicSalary * this.deductions.providentFund.percentage) / 100;
    this.deductions.esi.amount = (this.grossSalary * this.deductions.esi.percentage) / 100;
    
    // Calculate total deductions
    this.totalDeductions = this.deductions.providentFund.amount + 
                          this.deductions.esi.amount + 
                          this.deductions.professionalTax.amount + 
                          this.deductions.incomeTax.amount + 
                          this.deductions.otherDeductions.amount;
    
    // Calculate net salary
    this.netSalary = this.grossSalary - this.totalDeductions;
    
    // Calculate CTC
    const employerContributionTotal = Object.values(this.employerContributions).reduce((sum, contrib) => sum + (contrib.amount || 0), 0);
    this.ctc = this.grossSalary + employerContributionTotal;
    
    next();
});

const SalaryStructure = mongoose.model("SalaryStructure", salaryStructureSchema, "salaryStructures");

export default SalaryStructure;
