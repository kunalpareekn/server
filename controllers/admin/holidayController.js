import Holiday from "../../models/holiday.model.js";

// Create new holiday
export const createHoliday = async (req, res) => {
    try {
        const { name, date, type, description, isRecurring, departments } = req.body;
        
        const holiday = new Holiday({
            name,
            date: new Date(date),
            type,
            description,
            isRecurring,
            departments,
            year: new Date(date).getFullYear()
        });
        
        await holiday.save();
        
        res.status(201).json({
            success: true,
            message: "Holiday created successfully",
            data: holiday
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all holidays
export const getAllHolidays = async (req, res) => {
    try {
        const { year, month } = req.query;
        let query = { isActive: true };
        
        if (year) {
            query.year = parseInt(year);
        }
        
        if (month) {
            const startDate = new Date(year || new Date().getFullYear(), month - 1, 1);
            const endDate = new Date(year || new Date().getFullYear(), month, 0);
            query.date = { $gte: startDate, $lte: endDate };
        }
        
        const holidays = await Holiday.find(query)
            .populate('departments', 'name code')
            .sort({ date: 1 });
        
        res.status(200).json({
            success: true,
            data: holidays
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get holiday by ID
export const getHolidayById = async (req, res) => {
    try {
        const holiday = await Holiday.findById(req.params.id)
            .populate('departments', 'name code');
        
        if (!holiday) {
            return res.status(404).json({
                success: false,
                message: "Holiday not found"
            });
        }
        
        res.status(200).json({
            success: true,
            data: holiday
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update holiday
export const updateHoliday = async (req, res) => {
    try {
        const updateData = { ...req.body };
        
        if (updateData.date) {
            updateData.year = new Date(updateData.date).getFullYear();
        }
        
        const holiday = await Holiday.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('departments', 'name code');
        
        if (!holiday) {
            return res.status(404).json({
                success: false,
                message: "Holiday not found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Holiday updated successfully",
            data: holiday
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete holiday (soft delete)
export const deleteHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        
        if (!holiday) {
            return res.status(404).json({
                success: false,
                message: "Holiday not found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Holiday deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get company calendar
export const getCompanyCalendar = async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;
        
        const holidays = await Holiday.find({
            year: parseInt(year),
            isActive: true
        }).populate('departments', 'name code').sort({ date: 1 });
        
        // Group holidays by month
        const calendar = {};
        holidays.forEach(holiday => {
            const month = holiday.date.getMonth() + 1;
            if (!calendar[month]) {
                calendar[month] = [];
            }
            calendar[month].push(holiday);
        });
        
        res.status(200).json({
            success: true,
            data: {
                year: parseInt(year),
                calendar,
                totalHolidays: holidays.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
