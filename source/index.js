const express = require("express")
const app = express();
const cors = require('cors');
const path = require("path")
const fileUpload = require('express-fileupload');
const port = process.env.PORT || 1000

require("./database/conn");

app.use(cors({origin: "*"}));

app.use(fileUpload());

app.use("/shop", express.static(path.join(__dirname, './uploads')));


app.use("/", require("./endpoints/checkout"))

app.use(express.json());

app.use("/shop", require("./endpoints/endpoints"))


const start = async()=>{
   try {
      
      app.listen(port,()=>{
         console.log("hello express")
      })

   } catch (error) {
      console.log(error);
   }
}

start();