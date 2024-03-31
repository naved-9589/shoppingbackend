const mongoose = require("mongoose")


const orderchema = new mongoose.Schema({
    userid: String,
    paymentid: String,
    paymentstatus: String,
    products:[{
        id: {type: Number},
        quantity: {type: Number}
    }
    ],
    name: String,
    email: String,
    price: Number,
    address: {
        line1: String,
        city: String,
        postal_code: String,
        state: String,
        country: String
    }
})

const ordermodel = new mongoose.model("orderchema", orderchema)
module.exports = ordermodel;