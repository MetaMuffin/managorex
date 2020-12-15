import { ChildProcessWithoutNullStreams, spawn } from "child_process"
import { EventEmitter } from "events"
import { pathToServer } from "."
import { CONFIG } from "../config/config"
import { ServerConfig } from "../config/types"

export var runningServers: RunningServer[] = []


export async function launchAndQuit(config: ServerConfig) {
    var server = new RunningServer(config)
    await new Promise<void>((r, _) => {
        var handle = (log: string) => {
            if (log.startsWith("You need to agree to the EULA in order to run the server.")) {
                console.log(`Server ready to stop again.`)
                server.off("log", handle)
                r()
            }
        }
        server.on("log", handle)
        server.once("ready", () => {
            server.off("log", handle)
            r()
        })
    })
    await server.stop()
    return
}

export function checkServerRunning(name: string): boolean {
    return !!runningServers.find((rs) => rs.config.name == name)
}

export async function launchNormalSafe(config: ServerConfig): Promise<number> {
    if (checkServerRunning(config.name)) return 553
    if (!CONFIG.servers.find(s => s.name == config.name)) return 551
    await launchNormal(config)
    return 200
}

export async function launchNormal(config: ServerConfig) {
    var server = new RunningServer(config)
    await new Promise<void>((r, _) => {
        server.once("ready", () => {
            r()
        })
    })
}

const REGEX_LOG = /\[.+\] \[.+\]: (?<message>.+)/ig

export class RunningServer extends EventEmitter {
    public config: ServerConfig
    private process: ChildProcessWithoutNullStreams
    private readBuf: string = ""


    constructor(config: ServerConfig) {
        super()
        console.log(`Starting server ${config.name}`);
        this.config = config
        var path = pathToServer(config.name)
        var args = config.deploy?.arguments || []
        this.process = spawn("java", ["-jar", "server.jar", ...args, "--nogui"], {
            cwd: path,
        })
        this.process.stdout.on("data", (chunk) => {
            this.readBuf += chunk
            var bufsplit = this.readBuf.split("\n")
            while (bufsplit.length > 1) {
                var ch = bufsplit.shift()
                this.emit("output", ch)
            }
            this.readBuf = bufsplit[0]
        })
        this.on("command", (command) => {
            this.process.stdin.write(command + "\n")
        })
        this.on("output", (output: string) => {
            var res = REGEX_LOG.exec(output)
            if (!res) return
            if (!res.groups) return
            var log = res.groups["message"]
            console.log(`[LOG ${this.config.name}] ${log}`)
            this.emit("log", log)

        })
        this.on("log", this.onlog)
        runningServers.push(this)
    }

    onlog(message: string) {
        if (message.startsWith("Done (") || message.startsWith("Time elapsed:")) {
            console.log(`Server ${this.config.name} is ready!`);
            this.emit("ready")
        }
    }

    waitReady(): Promise<void> {
        return new Promise((r, reject) => {
            this.once("ready", r)
        })
    }

    async stop() {
        console.log(`Stopping ${this.config.name}`);
        this.process.kill("SIGTERM")
        console.log(`Waiting for ${this.config.name} to exit`);
        await new Promise<void>((r) => {
            this.process.on("exit", () => {
                console.log(`   done`);
                r()
            })
        })
    }
}

export async function shutdownAllServers() {
    console.log("Shutting down all servers.");
    await Promise.all(runningServers.map(rs => rs.stop()))
}
/*
process.on("SIGINT",shutdownAllServers)
process.on("SIGTERM",shutdownAllServers)
*/