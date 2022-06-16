const express = require("express");
const app = express();
const mongoose = require('mongoose');
require("dotenv").config();
const base = "/api/v1/";
const configRoute = require("./routes/config");
const authRoute = require("./routes/auth");
const log = require("./logger");
const cors = require("cors");

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', (error)=>{ log.error(`database login || ${error}`) });
db.once('open',() => log.info(`connected to database`));

app.use(express.json());

const corsOpts = {
    origin: '*',
  
    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE'
    ],
  
    allowedHeaders: [
      'Content-Type',
      'token'
    ],
  };

//routes
try {
    app.use(cors(corsOpts));
    app.use(base+"config", configRoute);
    app.use(base+"auth", authRoute);
} catch (error) {
    log.error(`Fatal || ${ "Error on routes - " + error || "Internal server error"}`);
}

app.listen(process.env.PORT, ()=>{
    log.info(`server running on port || ${process.env.PORT}`)
});
