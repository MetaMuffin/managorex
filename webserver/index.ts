
import express from "express"
import { readFileSync } from "fs";
import http from "http"
import https from "https"
import { join } from "path";
import { CONFIG, MCSERVER_IP, USE_DEV_PORTS, USE_HTTP, USE_HTTPS } from "../config/config";
import { server_info, startUpdates, stats_last, stats_last_update, stats_merged } from "./update";
import fetch from "node-fetch"
import { ServerStats, ServerStatsMerged } from "../config/types";


var app = express();


app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "../frontend/index.html"))
})
app.use("/static", express.static(join(__dirname, "../frontend/public")))

app.get("/api/stats", async (req, res) => {
    
    res.send(JSON.stringify({ stats: stats_merged, last_update: stats_last_update }))
})

app.get("/api/info",async (req,res) => {
    res.send(JSON.stringify(server_info))
})

app.post("/api/start/:name", async (req, res) => {
    var name = req.params.name
    if (!name) return res.send("Not OK")
    if (!CONFIG.servers.find(s => s.name = name)?.allowWebStart) return res.status(404).send("Server not found")
    var fr = await fetch(`http://${MCSERVER_IP}:8732/start/${encodeURIComponent(name)}`, {
        method: "POST"
    })
    res.status(fr.status)
    res.send("OK")
})

startUpdates()

app.disable("x-powered-by")

if (USE_HTTP) {
    http.createServer(app).listen(USE_DEV_PORTS ? 8080 : 80, () => {
        console.log("HTTP Server running!")
    })
}
if (USE_HTTPS) {
    var options = {
        key: readFileSync(join(__dirname, '../key.pem')),
        cert: readFileSync(join(__dirname, '../cert.pem')),
        ca: readFileSync(join(__dirname, '../ca.pem'))
    };
    https.createServer(options, app).listen(USE_DEV_PORTS ? 8443 : 443, () => {
        console.log("HTTPS Server running!")
    });
}