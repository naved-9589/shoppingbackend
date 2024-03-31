const mongoose = require("mongoose")


const productchema = new mongoose.Schema({
     name: String,
     image: String,
     regularprice: Number,
     saleprice: Number,
     status: String
})

const productmodel = new mongoose.model("productchema", productchema)
module.exports = productmodel;