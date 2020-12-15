import { CONFIG, MCSERVER_IP } from "../config/config";
import fetch from "node-fetch"
import { ServerInfo, ServerStats, ServerStatsMerged } from "../config/types";
import {inspect} from "util"
import { runningServers } from "../mcserver/server";

export var stats_last: ServerStats = {}
export var stats_last_update = 0;
export var stats_merged: ServerStatsMerged = {}
export var server_info: ServerInfo = {}

async function update() {
    var res = await fetch(`http://${MCSERVER_IP}:8732/update`, {
        method: "POST",
        body: JSON.stringify({servers: CONFIG.servers}),
        headers: {
            "Content-Type": "application/json"
        }
    })
    stats_last = JSON.parse(await res.text())
    stats_last_update = new Date().getTime()

    stats_merged = {}
    for (const servername in stats_last) {
        if (!stats_last.hasOwnProperty(servername)) continue
        var state = "offline"
        if (runningServers.find(s => s.config.name == servername)) state = "online"
        stats_merged[servername] = {
            meta: {},
            values: {},
            state
        }
        var sconfig = CONFIG.servers.find(s => s.name == servername)?.display.exposedStats
        if (!sconfig) continue
        for (const statname in sconfig) {
            if (!sconfig.hasOwnProperty(statname)) continue
            stats_merged[servername].meta[statname] = {
                display: sconfig[statname].display,
                primary: sconfig[statname].primary,
                unit: sconfig[statname].unit,
            }
        }
        for (const playeruuid in stats_last[servername]) {
            if (!stats_last[servername].hasOwnProperty(playeruuid)) continue
            stats_merged[servername].values[playeruuid] = {}
            for (const statname in stats_last[servername][playeruuid]) {
                if (!stats_last[servername][playeruuid].hasOwnProperty(statname)) continue
                if (!sconfig) continue
                stats_merged[servername].values[playeruuid][statname] = stats_last[servername][playeruuid][statname] * (sconfig[statname].factor || 1)
            }
        }
    }
    server_info = {}
    for (const serverconfig of CONFIG.servers) {
        server_info[serverconfig.name] = {
            name: serverconfig.display.name,
            banner: serverconfig.display.banner,
            description: serverconfig.display.description,
            allowWebStart: serverconfig.allowWebStart || false,
        }
    }
    // console.log(inspect(stats_merged));
    // console.log(inspect(stats_last));
    
}

export function startUpdates() {
    //setTimeout(update,10000)
    setInterval(update,CONFIG.updateInterval * 1000)
}