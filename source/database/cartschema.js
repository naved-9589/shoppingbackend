const mongoose = require("mongoose")


const cartchema = new mongoose.Schema({
     userid: String,
     productid: String,
     name: String,
     image: String,
     regularprice: Number,
     quantity: Number,
     saleprice: Number,
})

const cartmodel = new mongoose.model("cartchema", cartchema)
module.exports = cartmodel;