import { Config } from "./types";

const VERSIONS = {
    //VANILLA_16_3: { name: "Vanilla 1.16.3", url: "http://launcher.mojang.com/v1/objects/f02f4473dbf152c23d7d484952121db0b36698cb/server.jar" },
    VANILLA_16_3: { name: "Vanilla 1.16.3", url: "http://lolcalhorst:8000/server.jar" },
    VANILLA_16_4: { name: "Vanilla 1.16.4", url: "http://launcher.mojang.com/v1/objects/35139deedbd5182953cf1caa23835da59ca3d7cd/server.jar" },
    SPIGOT_16_3: { name: "Spigot 1.16.3", url: "" },
}

export const MCSERVER_IP = "localhost"
export const SERVERS_ROOT = "/home/muffin/minecraft/servers"
export const MCSERVER_BIND = "127.0.0.1" // use 127.0.0.1 if both apps are running on the same device. Else use 0.0.0.0, which is unsafe if the port is exposed to the internet


export const USE_HTTP = true
export const USE_HTTPS = false
export const USE_DEV_PORTS = true

export const CONFIG: Config = {

    updateInterval: 30,
    servers: [
        {
            name: "test-1",
            allowWebStart: true,
            deploy: {
                version: VERSIONS.VANILLA_16_3,
                options: {
                    gamemode: "creative",
                    motd: "Hallo keks!"
                },
                arguments: []
            },
            display: {
                name: "KEK Vanilla Server",
                description: "Just testing",
                exposedStats: {
                    "minecraft:custom.minecraft:play_one_minute": {
                        display: "Online zeit",
                        primary: true,
                        factor: 1 / 1000 / 60,
                        unit: "m"
                    },
                    "minecraft:mined.minecraft:dirt": {
                        display: "Dirt abgebaut"
                    }
                },
                showConsole: true
            }
        },
        {
            display:{
                name: "blub server",
                description: "ein blub server",
                exposedStats: {
                    "minecraft:custom.minecraft:play_one_minute": {
                        display: "Online zeit",
                        primary: true,
                        factor: 1 / 1000 / 60,
                        unit: "m"
                    },
                    "minecraft:mined.minecraft:dirt": {
                        display: "Dirt abgebaut"
                    }
                }
            },
            name: "blub",
            allowWebStart: true,
            deploy: {
                arguments: [],
                options: {
                    port: 25569
                },
                version: VERSIONS.VANILLA_16_3
            },
        }
    ],
}

