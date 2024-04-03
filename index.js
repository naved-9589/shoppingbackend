const express = require("express")
const app = express();
const cors = require('cors');
const path = require("path")
const fileUpload = require('express-fileupload');
const port = process.env.PORT || 1000

// require("./source/database/conn");

app.use(cors({origin: "*"}));

app.use(fileUpload());

app.use("/shop", express.static(path.join(__dirname, './source/uploads')));


app.use("/", require("./source/endpoints/checkout"))

app.use(express.json());

app.use("/shop", require("./source/endpoints/endpoints"))


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