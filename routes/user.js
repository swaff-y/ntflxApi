const { verifyTokenAndAuthorization, verifyTokenAndAdmin } = require("./verifyToken");
const router = require("express").Router();
const User = require("../models/User");
const Crypto = require("crypto-js");
const log = require("../logger");

router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try{
        if(!req.body) throw "No Request Body";
        if(req.body.password){
            req.body.password = Crypto.AES.encrypt(req.body.password, process.env.PASSWORD_SECRET).toString();
        };

        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set: req.body
        },{new: true});

        log.info(`200 || "Updated User" - ${req.method} - ${req.ip}`);
        res.status(200).json({success: true, ...updatedUser});
    } catch (err) {
        log.error(`500 || ${err || "Internal server error"} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(500).json({success: false, "error": "Internal server Error"});
    }
})

//DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
    try{
        if(!req.params.id) throw "No ID";
        const user = await User.findByIdAndDelete(req.params.id); 

        if(user){
            log.info(`200 || "Deleted User" - ${req.method} - ${req.ip}`);
            res.status(200).json({success: true, message:"User has been deleted", user});
        } else {
            throw "User does not exist";
        }

    } catch (err) {
        log.error(`500 || ${err} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(500).json({success: false, "error": err});
    }
});

//GET
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
    try{
        const user = await User.findById(req.params.id); 

        const { password, ...others } = user._doc;

        if(user)
        {
            log.info(`200 || "Found User" - ${req.method} - ${req.ip}`);
            res.status(200).json({success: true, ...others});
        } else {
            throw "User does not exist";
        }
    } catch (err) {
        log.error(`500 || ${err || "Internal server error"} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(500).json({success: false, "error": err});
    }
});

//GET All
router.get("/", verifyTokenAndAdmin, async (req, res) => {
    try{
        const query = req.query.new;
        const users = query ? await User.find().sort({_id:-1}).limit(5) : await User.find(); 

        if(users)
        {
            log.info(`200 || "Got All Users" - ${req.method} - ${req.ip}`);
            res.status(200).json(users);
        } else {
            throw "No Users";
        }
    } catch (err) {
        log.error(`500 || ${err || "Internal server error"} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(500).json({success: false,  "error": err});
    }
});

//GET USER STATS
router.get("/stats", verifyTokenAndAdmin, async (req, res)=>{
    try {
        const date = new Date();
        const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

        const data = await User.aggregate([
            {
                $match: {createdAt: {$gte: lastYear}}
            },
            {
                $project: {
                    month: {$month: "$createdAt"}
                }
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: 1},
                }
            }
        ]);
        log.info(`200 || "User stats requested" - ${req.method} - ${req.ip}`);
        res.status(200).json({success: true, data});
    }
    catch(err){
        log.error(`500 || ${err || "Internal server error"}  - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(500).json({success: false, "error": err});
    }
})

module.exports = router;