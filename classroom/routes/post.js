const express = require("express");
const router = express.Router();

// Index
router.get("/", (req, res)=>{
    res.send("GET for post");
})
// Show - users
router.get("/:id",(req, res)=>{
    res.send("GET for show posts id");

})
// Post-users
router.post("/",(req, res)=>{ 
    res.send("Post for posts");
})
// Delete- users
router.delete("/:id",(req, res)=>{
    res.send("DELETE for post id");
})
module.exports = router;