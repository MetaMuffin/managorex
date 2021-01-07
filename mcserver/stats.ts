import { getServerInstalledVersion, pathToServer } from ".";
import { CONFIG } from "../config/config";
import { ServerConfig, ServerStats } from "../config/types";
import { readdir, readFile } from "fs/promises"
import { join } from "path"

export async function getStats(): Promise<ServerStats> {
    var exp: ServerStats = {}
    for (const serverconfig of CONFIG.servers) {
        exp[serverconfig.name] = {}
        var iver = await getServerInstalledVersion(serverconfig.name)
        console.log(iver);

        if (!iver.startsWith("@ready")) continue
        var path = pathToServer(serverconfig.name)
        try { var s_files = await readdir(join(path, "world/stats")) }
        catch (e) { continue }
        for (const s_file of s_files) {
            var uuid = s_file.slice(0, -5);
            var stats_raw = (await readFile(join(path, "world/stats", s_file))).toString()
            var stats = JSON.parse(stats_raw).stats
            exp[serverconfig.name][uuid] = {}
            for (const sname in serverconfig.display.exposedStats) {
                if (!serverconfig.display.exposedStats.hasOwnProperty(sname)) continue
                exp[serverconfig.name][uuid][sname] = deepGet(stats, sname.split(".")) || 0
            }
        }
    }
    return exp
}

export function deepGet(object: any, path: string[]): any {
    var c = object
    for (const i of path) {
        c = c[i]
        if (!c) return undefined
    }
    return c
}