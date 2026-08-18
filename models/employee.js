const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    phone:{
        type: Number,
        require: true,
        unique: true
    },
    dob:{
        type: Date,
        require: true
    },
    gender:{
        type: String,
        require: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps : true
});

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;