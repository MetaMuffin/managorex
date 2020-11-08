import { ChildProcessWithoutNullStreams, spawn } from "child_process"
import { EventEmitter } from "events"
import { pathToServer } from "."
import { ServerConfig } from "../config/types"

export var runningServers: RunningServer[] = []


export async function launchAndQuit(config:ServerConfig) {
    var server = new RunningServer(config)
    await new Promise<void>((r,_) => {
        var handle = (log:string) => {
            if (log == "Failed to load eula.txt") {
                server.off("log",handle)
                r()
            }
        }
        server.on("log", handle)
        server.once("ready", () => {
            server.off("log",handle)
            r()
        })
    })
    return    
}

const REGEX_LOG = /\[.+\] \[.+\]: (.+)/

export class RunningServer extends EventEmitter {
    public config: ServerConfig
    private process:ChildProcessWithoutNullStreams
    private readBuf:string = ""


    constructor(config:ServerConfig) {
        super()
        console.log(`Starting server ${config.name}`);
        this.config = config
        var path = pathToServer(config.name)
        var args = config.deploy?.arguments || []
        this.process = spawn("java", ["-jar","server.jar",...args], {
            cwd: path,
        })
        this.process.stdout.on("data",(chunk) => {
            console.log("Chunk: " + chunk);
            
            this.readBuf += chunk
            var bufsplit = this.readBuf.split("\n",1)
            while (bufsplit.length > 1) {
                this.emit("output",bufsplit.shift())
            }
            this.readBuf = bufsplit[0]
        })
        this.on("command",(command) => {
            this.process.stdin.write(command + "\n")
        })
        this.on("output",(output) => {
            var log = output.match(REGEX_LOG)
            console.log(`[LOG] ${log}`)
            this.emit("log",log)
            
        })
        runningServers.push(this)
    }

    waitReady(): Promise<void> {
        return new Promise((r,reject) => {
            this.once("ready", r)
        })
    }

    async stop() {
        this.process.kill("SIGTERM")
    }

}
