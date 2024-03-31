const express = require("express")
const app = express();
const cors = require('cors');
const path = require("path")
const fileUpload = require('express-fileupload');


require("./database/conn");

app.use(cors({origin: "*"}));

app.use(fileUpload());

app.use("/shop", express.static(path.join(__dirname, 'uploads')));


app.use("/shop", require("./endpoints/checkout"))

app.use(express.json());

app.use("/shop", require("./endpoints/endpoints"))

app.listen("1000",()=>{
   console.log("hello express")
})