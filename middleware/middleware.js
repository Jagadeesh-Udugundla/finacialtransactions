const jwt = require("jsonwebtoken")

module.exports = (req, res, next)=>{
    try{
        let token = req.header('x-token')
        if (!token){
            return res.status(500).send("Token Not Found")
        }
        let decode = jwt.verify(token,"key")
        req.user=decode.user
        next();
    }
    catch(err){
        console.log(err)
        return res.status(500).send("internal error")
    }
}