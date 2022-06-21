const router = require("express").Router();
const log = require("../logger");
const path = require('path')

router.get("/:name", async (req, res) => {
    try{
        switch(req.params.name){
            case "chris-kyle":
                log.info(`200 || "Mock HTML sent" - ${req.method} - ${req.ip}`);
                res.status(200).sendFile(path.join(__dirname, "../html/chrisKyle.html"));
            break;
            case "harry-potter":
                log.info(`200 || "Mock HTML sent" - ${req.method} - ${req.ip}`);
                res.status(200).sendFile(path.join(__dirname, "../html/harryPotter.html"));
            break;
            case "jack-sparrow":
                log.info(`200 || "Mock HTML sent" - ${req.method} - ${req.ip}`);
                res.status(200).sendFile(path.join(__dirname, "../html/jackSparrow.html"));
            break;
            case "jack-white":
                log.info(`200 || "Mock HTML sent" - ${req.method} - ${req.ip}`);
                res.status(200).sendFile(path.join(__dirname, "../html/jackWhite.html"));
            break;
            case "shaun-lowry":
                log.info(`200 || "Mock HTML sent" - ${req.method} - ${req.ip}`);
                res.status(200).sendFile(path.join(__dirname, "../html/shaunLowry.html"));
            break;
            case "tom-shoe":
                log.info(`200 || "Mock HTML sent" - ${req.method} - ${req.ip}`);
                res.status(200).sendFile(path.join(__dirname, "../html/tomShoe.html"));
            break;
            default:
                log.info(`200 || "Mock HTML sent" - ${req.method} - ${req.ip}`);
                res.status(200).sendFile(path.join(__dirname, "../html/default.html"));
        }
    } catch (err) {
        log.error(`500 || ${err || "Internal server error"} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(500).json({success: false, "error": "Internal server Error"});
    }
})

// //DELETE
// router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
//     try{
//         if(!req.params.id) throw "No ID";
//         const user = await User.findByIdAndDelete(req.params.id); 

//         if(user){
//             log.info(`200 || "Deleted User" - ${req.method} - ${req.ip}`);
//             res.status(200).json({success: true, message:"User has been deleted", user});
//         } else {
//             throw "User does not exist";
//         }

//     } catch (err) {
//         log.error(`500 || ${err} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
//         res.status(500).json({success: false, "error": err});
//     }
// });

// //GET
// router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
//     try{
//         const user = await User.findById(req.params.id); 

//         const { password, ...others } = user._doc;

//         if(user)
//         {
//             log.info(`200 || "Found User" - ${req.method} - ${req.ip}`);
//             res.status(200).json({success: true, ...others});
//         } else {
//             throw "User does not exist";
//         }
//     } catch (err) {
//         log.error(`500 || ${err || "Internal server error"} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
//         res.status(500).json({success: false, "error": err});
//     }
// });

// //GET All
// router.get("/", verifyTokenAndAdmin, async (req, res) => {
//     try{
//         const query = req.query.new;
//         const users = query ? await User.find().sort({_id:-1}).limit(5) : await User.find(); 

//         if(users)
//         {
//             log.info(`200 || "Got All Users" - ${req.method} - ${req.ip}`);
//             res.status(200).json(users);
//         } else {
//             throw "No Users";
//         }
//     } catch (err) {
//         log.error(`500 || ${err || "Internal server error"} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
//         res.status(500).json({success: false,  "error": err});
//     }
// });

// //GET USER STATS
// router.get("/stats", verifyTokenAndAdmin, async (req, res)=>{
//     try {
//         const date = new Date();
//         const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

//         const data = await User.aggregate([
//             {
//                 $match: {createdAt: {$gte: lastYear}}
//             },
//             {
//                 $project: {
//                     month: {$month: "$createdAt"}
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$month",
//                     total: { $sum: 1},
//                 }
//             }
//         ]);
//         log.info(`200 || "User stats requested" - ${req.method} - ${req.ip}`);
//         res.status(200).json({success: true, data});
//     }
//     catch(err){
//         log.error(`500 || ${err || "Internal server error"}  - ${req.originalUrl} - ${req.method} - ${req.ip}`);
//         res.status(500).json({success: false, "error": err});
//     }
// })

module.exports = router;