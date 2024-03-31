const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://ernavedshaikh7869:9589157798@cluster0.az20xqo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(()=>{console.log("connected")}).catch(()=>{console.log("not connected")})
// mongodb+srv://ernavedshaikh7869:<password>@cluster0.az20xqo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

// mongodb://127.0.0.1:27017/adminpanel