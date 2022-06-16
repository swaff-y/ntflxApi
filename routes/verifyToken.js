const jwt = require("jsonwebtoken");
const log = require("../logger");

const verifyToken = (req, res, next) => {
    try{
        const authHeader = req.headers.token;
        if(authHeader){
            const token = authHeader.split(" ")[1];
            jwt.verify(token, process.env.JWT_SECRET, (err, user)=>{
                if(err){
                    log.error(`403 || "Token is not valid" - ${req.originalUrl} - ${req.method} - ${req.ip}`);
                    return res.status(403).json({success: false, error: "Token is not valid"});
                }
                req.user = user;
                next();
            });
        } else {
            log.error(`401 || "Not Authenticated" - ${req.originalUrl} - ${req.method} - ${req.ip}`);
            return res.status(401).json({success: false, error: "Not Authenticated"});
        }
    } catch (error) {
        log.error(`Fatal || ${ "Error on verifyToken - " + error || "Internal server error"}`);
    }
}

const verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req, res, ()=>{
        try{
            if((req.user.id === req.params.id) || req.user.isAdmin) {
               next();
            } else {
                log.error(`403 || "Not Allowed" - ${req.originalUrl} - ${req.method} - ${req.ip}`);
                res.status(403).json({success: false, error: "Not Allowed"});
            }
        } catch (error) {
            log.error(`Fatal || ${ "Error on verifyTokenAndAuthorization - " + error || "Internal server error"}`);
        }
    })
}

const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, ()=>{
        try{
            if(req.user.isAdmin) {
                next();
            } else {
                log.error(`403 || "Not Allowed" - ${req.originalUrl} - ${req.method} - ${req.ip}`);
                res.status(403).json({success: false, error: "Not Allowed ->"});
            }
        } catch (error) {
            log.error(`Fatal || ${ "Error on verifyTokenAndAdmin - " + error || "Internal server error"}`);
        }
    })
}

module.exports = { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin };