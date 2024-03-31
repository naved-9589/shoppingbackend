const mongoose = require("mongoose")


const userschema = new mongoose.Schema({
     name: String,
     email: String,
     phone: Number,
     password: String,
     cpassword: String
})

const usermodel = new mongoose.model("userschema", userschema)
module.exports = usermodel;