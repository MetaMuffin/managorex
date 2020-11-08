import { CONFIG, MCSERVER_IP } from "../config/config";
import fetch from "node-fetch"

async function update() {
    var res = await fetch(`http://${MCSERVER_IP}:8732/update`, {
        method: "POST",
        body: JSON.stringify({servers: CONFIG.servers}),
        headers: {
            "Content-Type": "application/json"
        }
    })
    var rtext = await res.text()
    console.log(JSON.parse(rtext));
}

export function startUpdates() {
    setTimeout(update,1000)
    //setInterval(update,CONFIG.updateInterval * 1000)
}