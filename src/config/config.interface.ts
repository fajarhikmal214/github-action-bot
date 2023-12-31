export interface Config {
    app: {
        name: string
        env: string
        port: {
            http: number
        }
        log: string
    }
    db: {
        host: string
        name: string
        username: string
        password: string
    }
    bot: {
        access_token: string
    }
}
