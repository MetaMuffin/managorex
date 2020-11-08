
import express from "express"
import { readFileSync } from "fs";
import http from "http"
import https from "https"
import { join } from "path";
import { USE_DEV_PORTS, USE_HTTP, USE_HTTPS } from "../config/config";
import { startUpdates } from "./update";

var app = express();

app.get("/",(req,res) => {
    res.sendFile(join(__dirname,"/frontend/index.html"))
})
app.use("/static",express.static(join(__dirname,"/frontend/public")))




startUpdates()

app.disable("x-powered-by")

if (USE_HTTP) {
    http.createServer(app).listen(USE_DEV_PORTS ? 8080 : 80,() => {
        console.log("HTTP Server running!")
    })
}
if (USE_HTTPS) {
    var options = {
        key: readFileSync(join(__dirname,'../key.pem')),
        cert: readFileSync(join(__dirname,'../cert.pem')),
        ca: readFileSync(join(__dirname,'../ca.pem'))
    };
    https.createServer(options, app).listen(USE_DEV_PORTS ? 8443 : 443,() => {
        console.log("HTTPS Server running!")
    });
}