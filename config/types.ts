

export interface Config {
    servers: ServerConfig[]
    updateInterval: number
}

export interface ServerConfig {
    name: string
    deploy?: { // Dont include this if you want to supress automatic setup of the server and version updates
        version: {
            url:string, // Download link for the minecraft server software
            name:string,
        }
        options: MinecraftServerOptions,
        arguments: string[]
    },
    display: {
        exposedStats: {[key: string]: string}, // Mapping from internal stats keys to display name on the website
        description: string, // No XSS here
        showConsole?: true, // Allows unauthorised users to see the console log
        banner?: string // Fancy background image
    },
}

export interface MinecraftServerOptions {
    port?: number,
    online_mode?: boolean,
    spawn_protection?: number,
    view_distance?: number,
    motd?: string,
    gamemode?: "survival" | "creative" | "adventure" | "spectator",
    max_players?: number
}
