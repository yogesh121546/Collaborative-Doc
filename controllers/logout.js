
const async_wrapper = require("../middleware/async_wrapper");

const logout = async_wrapper(async(req,res)=>{
    res.clearCookie("token").json({msg: "logged out successfully"});
})
module.exports = logout;