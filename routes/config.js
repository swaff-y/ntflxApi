const Config = require("../models/Config");
const router = require("express").Router();
const log = require("../logger");
var AWS = require('aws-sdk');
AWS.config.update({region: 'ap-southeast-2'});
s3 = new AWS.S3({apiVersion: '2006-03-01'});

const listAllKeys = (params, out = []) => new Promise((resolve, reject) => {
  s3.listObjectsV2(params).promise()
    .then(({Contents, IsTruncated, NextContinuationToken}) => {
      out.push(...Contents);
      !IsTruncated ? resolve(out) : resolve(listAllKeys(Object.assign(params, {ContinuationToken: NextContinuationToken}), out));
    })
    .catch(reject);
});

function categories(arr){
    const ret = [];
    arr.forEach((item)=>{
        
        const obj = {},
              path = item.Key,
              sp = path.split("/");

        if((sp.length === 3) && (sp[2] !== ""))
        {
            obj.category = sp[1];
            obj.file = sp[2];
            obj.url = item.Key;
            obj.tag = item.ETag;
        }

        if(sp.length === 4)
        {
            obj.category = sp[1];
            obj.file = sp[3];
            obj.name = sp[2]
            obj.url = item.Key;
            obj.tag = item.ETag;
        }

        if(obj.category && obj.file) ret.push(obj);
    })
    return ret;
}

let gotten = null;

//Get Config
router.get("/build", async (req, res) => {
    try{
            const obj = await listAllKeys({Bucket: process.env.BUCKET});
            const arr = categories(obj);
            
            let retArr = [];
            arr?.forEach(async (item)=>{
                try{      
                    const rec = await Config.findOne({tag: item.tag});
                    let saved = null;
                    if(!rec){
                        const conf = new Config(item);
                        saved = await conf.save();
                        if(saved) retArr.push(saved)
                    } else {
                        saved = await Config.findByIdAndUpdate(
                            rec._id,
                            { $set: rec }, 
                            { new: true }
                        );
                        if(saved) retArr.push(saved);
                        console.log("Else", saved);
                    }
                }
                catch(err){console.log(err)}
            })

            res.status(200).json({success: "true", retArr});
            gotten = obj;
            log.info(`200 || "Config Sent" - ${req.method} - ${req.ip}`);
    }
    catch (err){
         log.error(`500 || ${err || "Internal server error"} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
         res.status(500).json({success: false, "error": err});
    }
})

//GET stars
router.get("/stars" , async (req, res) => {
    // const qCategory = req.query.category;
    try{
        let products;

        // products = await Product.find().populate("categories");
        stars = await Config.find({category: "stars"})

        if(stars)
        {
            log.info(`200 || "Got All Stars" - ${req.method} - ${req.ip} - ${req?.query?.category ? "category:" + req?.query?.category : "category: none"}`);
            res.status(200).json(stars);
        } else {
            throw "Stars does not exist";
        }
    } catch (err) {
        log.error(`500 || ${err || "Internal server error"} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(500).json({success: false, "error": err});
    }
});

module.exports = router;