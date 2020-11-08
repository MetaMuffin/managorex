
import express from "express"
import { createWriteStream } from "fs"
import { mkdir, readFile, stat, unlink, writeFile } from "fs/promises"
import { join } from "path"
import { SERVERS_ROOT } from "../config/config"
import http, { Server } from "http"
import https from "https"
import { ServerConfig } from "../config/types"
import { stdout } from "process"
import { launchAndQuit } from "./server"

const hostapp = express()

export function pathToServer(name: string) {
    return join(SERVERS_ROOT, name.replace("/", "").replace(".", "").replace(" ", "-"))
}

export async function acceptEula(name: string) {
    console.log(`Accepting eula for ${name}`);
    var path = join(pathToServer(name), "eula.txt")
    var content = (await readFile(path)).toString()
    content = content.replace("eula=false", "eula=true")
    writeFile(path, content)
}

export function downloadAndSave(path: string, url: string): Promise<void> {
    process.stdout.write("Downloading server....");
    var dist = join(path, "server.jar")
    return new Promise((resolve, reject) => {
        var file = createWriteStream(dist);
        http.get(url, function (response) {
            response.pipe(file);
            file.on("finish", async () => {
                file.close();
                await writeFile(join(path,".version"),url)
                console.log("  Done");
                resolve()
            });
        }).on("error", (err) => {
            unlink(dist);
            console.log("Failed to download server from: " + url);

            reject()
        });
    })
}

export async function updateServer(config: ServerConfig) {
    if (!config.deploy) return
    var path = pathToServer(config.name)
    await unlink(join(path,"server.jar"))
    await downloadAndSave(path,config.deploy.version.url)
}

export async function rebuildProperties(config: ServerConfig) {
    console.log(`Rebuilding server.properties for ${config.name}`);
    var path = join(pathToServer(config.name),"server.properties")
    var default_file_path = join(__dirname,"../config/default.properties")
    var props = (await readFile(default_file_path)).toString().split("\n")

    for (const key in config.deploy?.options) {
        if (Object.prototype.hasOwnProperty.call(config.deploy?.options, key)) {
            //@ts-ignore
            const newValue = config.deploy?.options[key];
            const keyProp = key.replace("_","-")
            props.map(p => {
                if (p.split("=")[0] == keyProp) {
                    var newProp = p.split("=")[0] + "=" + newValue
                    console.log(`Replaced property ${p}`)
                    console.log(`             with ${newProp}`)
                    return newProp
                } else return p
            })
        }
    }
    await writeFile(path,props.join("\n"))
}


export async function setupServer(config: ServerConfig) {
    console.log(`Deploying server ${config.name}`);
    if (!config.deploy) return
    var path = pathToServer(config.name)
    await mkdir(path,{recursive: true})
    await downloadAndSave(path, config.deploy.version.url)
    await launchAndQuit(config)
    await acceptEula(config.name)
    await rebuildProperties(config)
}

export async function getServerInstalledVersion(name: string): Promise<string | undefined> {
    var path = pathToServer(name)
    try {
        var res = (await readFile(join(path, ".version"))).toString()
        return res
    } catch(e) {
        return undefined
    }
}


//mcapp.use(express.urlencoded({extended: true}))
hostapp.use(express.json())

hostapp.post("/update",async (req,res) => {
    console.log("Update requested");
    var configs:ServerConfig[] = req.body.servers
    res.send("{}")
    for (const serverconfig of configs) {
        if (!serverconfig.deploy) continue
        var installed = await getServerInstalledVersion(serverconfig.name)
        if (!installed) {
            await setupServer(serverconfig)
        } else if (installed != serverconfig.deploy.version.url) {
            await updateServer(serverconfig)
        }
    }
})

hostapp.get("/stats/:name", (req, res) => {
    var name = req.params.name

})



hostapp.listen(8732, () => {
    console.log("Management Server running!");
})