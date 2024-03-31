const jwt = require("jsonwebtoken");
const usermodel = require("../database/userschema");

const auth = async(req, res, next)=>{
    try{
        
        const gettoken =  req.headers["token"];


        // console.log("token"+gettoken);
        const verifyuser = jwt.verify(gettoken, process.env.JWT_SECRET);
        console.log(verifyuser.token);


        const user = await usermodel.findOne({_id: verifyuser.token});
          
            req.token = gettoken;
            req.user = user;
            next();
            
        //  console.log("user", verifyuser)
       
    }catch(e){
        res.send(e);
    }

}

module.exports = auth;