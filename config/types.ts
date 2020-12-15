

export interface Config {
    servers: ServerConfig[]
    updateInterval: number
}

export interface ServerConfig {
    name: string
    noPlayerStop?: number; // time it takes for the server to stop if no players are online in ms
    deploy?: { // Dont include this if you want to supress automatic setup of the server and version updates
        version: {
            url: string, // Download link for the minecraft server software
            name: string,
        }
        options: MinecraftServerOptions,
        arguments: string[]
    },
    allowWebStart?: boolean
    display: {
        exposedStats: {
            [key: string]: {
                display: string,
                primary?: boolean,
                factor?: number,
                unit?: string
            }
        }, // Mapping from internal stats keys to display name on the website
        name: string, // name to display on the website
        description: string, // No XSS here please
        showConsole?: true, // Allows unauthorised users to see the console log
        banner?: string // Path or url to a fancy background image
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

export type ServerStats = { [key: string]: { [key: string]: { [key: string]: number } } }
export type ServerStatsMerged = {
    [key: string]: { // server
        meta: {
            [key: string]: {
                display: string,
                primary?: boolean,
                unit?: string
            }
        },
        state: string
        values: {
            [key: string]: { // player uuid
                [key: string]: number, // statname
            }
        }
    }
}
export type ServerInfo = {
    [key:string]: {
        name: string,
        description?: string,
        banner?: string
        allowWebStart: boolean,
    }
}
