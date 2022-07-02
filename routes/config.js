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
            obj.display = null; //Delete me
        }

        if(sp.length === 4)
        {
            obj.category = sp[1];
            obj.file = sp[3];
            obj.name = sp[2]
            obj.url = item.Key;
            obj.tag = item.ETag;
            obj.display = null; //Delete me
        }

        if(obj.category && obj.file) ret.push(obj);
    })
    return ret;
}

let gotten = null;

function randomArray(arr, length) {

    if(arr.length === 0) return;

    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    }

    const retArr = [];
    let i = 0;
    
    while (i < length){
        const int = getRandomInt(0,arr.length);

        if(i == 0){
            retArr?.push(arr[int]);
            i++;
        } else {
            const obj = arr[int];
            if(!retArr?.find((item)=>{ return item == obj })) {
                retArr?.push(obj);
                i++;
            }
        }
    }
    return retArr;
}

function uniqueArray(arr) {
    const retArr = [];

    arr.forEach((item)=>{
        if(!retArr.find((it)=>{ return it === item.name })) {
            retArr.push(item.name);
        }
    });
    return retArr;
}

function getObjs(arr, name) {
    return arr.filter((item)=>{
        return item.name === name;
    })
}

//Get Config
router.get("/build", async (req, res) => {
    try{
            const obj = await listAllKeys({Bucket: process.env.BUCKET});
            const arr = categories(obj);

            // console.log(arr);
            
            let retArr = [];
            arr?.forEach(async (item)=>{
                try{      
                    const rec = await Config.findOne({tag: item.tag, name: item.name});
                    let saved = null;
                    // if(item.category === "movies") console.log(item.name, rec.name, item.tag);
                    if(!rec){
                        const conf = new Config(item);
                        saved = await conf.save();
                        console.log("Rec",saved);
                    } else {
                        saved = await Config.findOneAndUpdate(
                            {tag: item.tag, name: item.name },
                            { ...item, newVideo: false, display: null }, 
                            { new: true }
                        );
                        // console.log("No Rec",saved);
                    }
                }
                catch(err){
                    log.error(`500 || ${err || "Internal server error"} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
                }
            })

            res.status(200).json({success: "true"});
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
        // stars = await Config.find({category: "stars"})
        const stars = await Config.aggregate([
            {$match: {category: "stars"}},
            {$sample: {size: 50}}])

        if(stars)
        {
            log.info(`200 || "Got All Stars" - ${req.method} - ${req.ip} - "category: stars"`);
            res.status(200).json(stars);
        } else {
            throw "Stars does not exist";
        }
    } catch (err) {
        log.error(`500 || ${err || "Internal server error"} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(500).json({success: false, "error": err});
    }
});

//GET movies
router.get("/movies" , async (req, res) => {
    try{
        let movies;

        movies = await Config.find({category: "movies"})

        if(movies)
        {
            log.info(`200 || "Got All movies" - ${req.method} - ${req.ip} - "category: movies"`);
            res.status(200).json(movies);
        } else {
            throw "Movies does not exist";
        }
    } catch (err) {
        log.error(`500 || ${err || "Internal server error"} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(500).json({success: false, "error": err});
    }
});

//GET display
router.get("/stars/display" , async (req, res) => {
    try{
        let display,
            dateStamp = Date.now();

        display = await Config.find({category: "stars", display: {$gte: dateStamp}});

        if(!display){
            throw "Stars does not exist";
        }
        else if(display.length > 0)
        {
            log.info(`200 || "Got display Stars" - ${req.method} - ${req.ip} - "category: starsDisplay"`);
            res.status(200).json(display);
        } 
        else {
            log.info(`"Creating a new display" - ${req.method} - ${req.ip} - "category: starsDisplay"`);
            stars = await Config.find({category: "stars"});
            const uniqueArr = uniqueArray(stars || []);
            const randomArr = randomArray(uniqueArr, 8);

            const retArr = [];
            randomArr.forEach(async (item)=>{
                const objsArr = getObjs(stars, item);
                objsArr.forEach(async (it)=>{
                    // console.log("=>" + it.name);
                    const future = dateStamp + 86400000;
                    const updatedObj = await Config.findOneAndUpdate({_id: it.id}, { display: future }, {new:true});
                    // console.log("<=" + updatedObj.name);
                    retArr.push(updatedObj)
                    if(retArr.length == (objsArr.length * randomArr.length)){
                        log.info(`200 || "Got display Stars" - ${req.method} - ${req.ip} - "category: starsDisplay"`);
                        res.status(200).json(retArr);
                    }
                });
            });
        }
    } catch (err) {
        log.error(`500 || ${err || "Internal server error"} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(500).json({success: false, "error": err});
    }
});

//SET display
router.put("/stars/display/:id", async (req, res) => {
    try{
        if(!req.body) throw "No Request Body";

        const confObj = await Config.findByIdAndUpdate(req.params.id, {
            $set: req.body
        },{new: true});

        log.info(`200 || "Updated Video" - ${req.method} - ${req.ip}`);
        res.status(200).json({success: true, ...confObj});
    } catch (err) {
        log.error(`500 || ${err || "Internal server error"} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(500).json({success: false, "error": "Internal server Error"});
    }
})

//Get video
router.get("/watch/:id", async (req, res) => {
    try{
        const obj = await Config.findById(req.params.id);

        log.info(`200 || "Got video" - ${req.method} - ${req.ip}`);
        res.status(200).json({success: true, ...obj});
    } catch (err) {
        log.error(`500 || ${err || "Internal server error"} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
        res.status(500).json({success: false, "error": "Internal server Error"});
    }
})

module.exports = router;