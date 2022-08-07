const User = require("../models/User");
const router = require("express").Router();
const Crypto = require("crypto-js");
const log = require("../logger");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async (req, res) => {

    if(!req.body) { 
        log.error(`400 || "No request body" - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(400).json({success: false,  "Error": "Missing Request"});
        return;
    }
    if(!req.body.username) { 
        log.error(`400 || "No username in body" - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(400).json({success: false,  "Error": "No Username"});
        return;
    }
    if(!req.body.email) { 
        log.error(`400 || "No email in body" - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(400).json({success: false,  "Error": "No Email"});
        return;
    }
    if(!req.body.password) { 
        log.error(`400 || "No password in body" - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(400).json({success: false,  "Error": "No Password"});
        return;
    }

    try {    
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: Crypto.AES.encrypt(req.body.password, process.env.PASSWORD_SECRET).toString()
        });

        const savedUser = await newUser.save();
        log.info(`200 || "Customer Registered" - ${req.method} - ${req.ip}`);
        res.status(200).json({success: true, ...savedUser._doc});
    } catch (err) {
        log.error(`500 || ${err} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(500).json({success: false, error: err});
    }
})

//Login
router.post("/login", async (req, res) => {
    if(!req.body.username) { 
        log.error(`400 || "No username in body" - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(400).json({success: false,  "Error": "No Username"});
        return;
    }
    if(!req.body.password) { 
        log.error(`400 || "No password in body" - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(400).json({success: false,  "Error": "No Password"});
        return;
    }
    try{
        const user = await User.findOne({username: req.body.username});
        if(!user){
            log.error(`400 || "Wrong Credentials" - ${req.originalUrl} - ${req.method} - ${req.ip}`);
            throw 400;
        //    res.status(400).json({success: false, error: "Wrong Credentials"});
        }

        const hashedPassword = Crypto.AES.decrypt(user.password, process.env.PASSWORD_SECRET);
        const thePassword = hashedPassword.toString(Crypto.enc.Utf8);

        if(thePassword !== req.body.password){
            log.error(`400 || "Wrong Credentials" - ${req.originalUrl} - ${req.method} - ${req.ip}`);
            throw 400;
        //   res.status(400).json({success: false, error: "Wrong Credentials"});
        }

        const { password, ...others } = user._doc;

        const accessToken = jwt.sign({
            id: user._id,
            isAdmin: user.isAdmin
        }, process.env.JWT_SECRET, {expiresIn: "1d"});

        log.info(`200 || "User Registered" - ${req.method} - ${req.ip}`);
        res.status(200).json({success: true, ...others, accessToken })

    } catch(err) {
        if(err == 400){
            res.status(400).json({success: false, error: "Wrong Credintials"});
        } else {
            log.error(`500 || "Internal server error" - ${req.originalUrl} - ${req.method} - ${req.ip}`);
            res.status(500).json({success: false, "error": "Internal server Error", "message": err});
        }

    }
})

module.exports = router;