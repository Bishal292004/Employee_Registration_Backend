const mongoose = require("mongoose");
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bcrypt = require("bcrypt");

const Employee = require("./models/employee");

const app = express();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected.");

    return {
        success:  true,
        message: "MongoDB connected."
    };
  } catch (error) {
    console.log("MongoDB connection failed.");
    console.log(error.message);

    return {
        success: false,
        message: error.message
    };
  }
}
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
connectDB();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "The backend is live."
  });
});


// app.get("/db-test", async (req, res) => {
//   try {
//     await mongoose.connection.db.admin().ping();

//     return res.status(200).json({
//       success: true,
//       message: "Backend and MongoDB are connected."
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "MongoDB connection failed.",
//       error: error.message
//     });
//   }
// });

app.get("/db-test", async (req, res) => {
    const result = await connectDB();
    if(result.success){
        return res.status(200).json(result);
    }
    return res.status(500).json(result);
});

app.post("/register", async (req, res) => {
  try {
    //validating employee data
    if (
      !req.body.name ||
      !req.body.email ||
      !req.body.phone ||
      !req.body.dob ||
      !req.body.gender ||
      !req.body.password
    ){
        return res.status(400).json({
            success: false,
            message: "Missing/Invalid Employee details."
        });
    }

    console.log(req.body);

    const existingEmployee = await Employee.findOne({
        email: req.body.email,
    });

    if(existingEmployee === null){
        //hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        //create new employee document
        const employee = new Employee({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            dob: req.body.dob,
            gender: req.body.gender,
            password: hashedPassword,
        });

        await employee.save();

        return res.status(201).json({
            success: true,
            message: "Employee registered successfully",
        });
    }else{
        return res.status(400).json({
            success: false,
            message: "User with this email already exist."
        });
    }
  } catch (error) {
    console.log(error.message);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server Error.",
    });
  }
});

//login

app.post("/login", async(req, res)=>{
    try{
        //validate employee data
        if(!req.body.email || !req.body.password){
            return res.status(400).json({
                success: false,
                message: "Invalid email or password."
            });
        }
        console.log(req.body);
        const existingEmployee = await Employee.findOne({
            email: req.body.email
        });

        if(!existingEmployee){
            return res.status(400).json({
                success: false,
                message: "Invalid email or password.",
            });
        }else{
            const isMatch = await bcrypt.compare(req.body.password, existingEmployee.password);
            if(!isMatch){
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password."
                });
            }
      
            return res.status(200).json({
                success: true,
                message: "Login successful."
            });
        }
    }catch(error){
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "Server error."
        });
    }
});

// app.listen(3500, () => console.log("Server Started."));



const PORT = process.env.PORT || 3500;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});