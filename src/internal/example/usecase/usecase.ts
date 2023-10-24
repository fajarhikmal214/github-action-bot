import winston from 'winston'
import { Context, Telegraf } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'

import { Config } from '../../../config/config.interface'

import User from '../../../database/mongo/schemas/user.schema'

class Usecase {
    constructor(
        private config: Config,
        private logger: winston.Logger,
        private bot: Telegraf<Context<Update>>
    ) {}

    public launch() {
        // Load all commands
        this.start()
        this.help()

        this.list_user()
        this.add_user()
        this.delete_user()

        this.bot.launch()
        this.logger.info(`🚀 Bot launched`)

        this.bot.action('help', (ctx) => {
            this.func_help(ctx)
        })

        this.bot.action('list', (ctx) => {
            this.func_list_user(ctx)
        })
    }

    private start() {
        this.bot.command('start', async (ctx) => {
            this.logger.info(ctx.from)

            await this.bot.telegram.sendMessage(
                ctx.chat.id,
                `👋 Hello ${ctx.from.first_name}, Nice to meet you! 👋`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'Need Help ?',
                                    callback_data: 'help',
                                },
                            ],
                            [
                                {
                                    text: 'List of Users',
                                    callback_data: 'list',
                                },
                            ],
                        ],
                    },
                }
            )
        })
    }

    private help() {
        this.bot.command('help', async (ctx) => {
            this.logger.info(ctx.from)

            await this.func_help(ctx)
        })
    }

    private list_user() {
        this.bot.command('list', async (ctx) => {
            this.logger.info(ctx.from)

            await this.func_list_user(ctx)
        })
    }

    private add_user() {
        this.bot.command('add', async (ctx) => {
            this.logger.info(ctx.from)

            await this.func_add_user(ctx)
        })
    }

    private delete_user() {
        this.bot.command('delete', async (ctx) => {
            this.logger.info(ctx.from)

            await this.func_delete_user(ctx)
        })
    }

    private async func_help(ctx: any) {
        let message = 'Available commands : \n \n'

        message += '- /start : Starts the bot \n'
        message += '- /help : List of commands \n'
        message += '- /list : list of registered people \n'
        message += '- /add <username> <name> : Add people \n'
        message += '- /delete <username> : Delete people \n'

        await this.bot.telegram.sendMessage(ctx.chat.id, message)
    }

    private async func_list_user(ctx: any) {
        const users = await User.find()

        if (!users.length) {
            await this.bot.telegram.sendMessage(
                ctx.chat.id,
                "😔 There's no one on the list"
            )

            return
        }

        let message =
            'This is a list of people who are registered as members of the SQUAD \n\n'

        message += users
            .map(
                (user, index) =>
                    `${index + 1}. ${user.name} (${user.username}) ${
                        user.isAdmin ? '💎' : ''
                    }`
            )
            .join('\n')

        await this.bot.telegram.sendMessage(ctx.chat.id, message)
    }

    private async func_add_user(ctx: any) {
        const isAdmin = await this.func_is_admin(ctx)
        if (!isAdmin) {
            await this.func_is_admin_throw(ctx)
            return
        }

        const text = ctx.update.message.text.split(' ')

        let username = text.slice(1, 2)[0]
        if (username && username.charAt(0) !== '@') {
            this.bot.telegram.sendMessage(
                ctx.chat.id,
                `❌ Username must start with @`
            )

            return
        }

        let name = text.slice(2).join(' ')

        if (!username) {
            username = `@${ctx.from.username!}`
        }

        const isExists = await User.findOne({ username })
        if (isExists) {
            this.bot.telegram.sendMessage(ctx.chat.id, `❌ User already added`)

            return
        }

        if (!name) {
            name = username.substring(1)
        }

        const user = new User({ username, name })
        await user.save()

        this.bot.telegram.sendMessage(ctx.chat.id, `✅ New user added`)
    }

    private async func_delete_user(ctx: any) {
        const isAdmin = await this.func_is_admin(ctx)
        if (!isAdmin) {
            await this.func_is_admin_throw(ctx)
            return
        }

        let username = ctx.update.message.text.split(' ')?.slice(1, 2)[0]

        if (!username) {
            username = `@${ctx.from.username!}`
        }

        const isExists = await User.findOne({ username })
        if (!isExists) {
            this.bot.telegram.sendMessage(ctx.chat.id, `❌ User not found`)

            return
        }

        await User.deleteOne({ username })
        this.bot.telegram.sendMessage(ctx.chat.id, `✅ User deleted`)
    }

    private async func_is_admin_throw(ctx: any) {
        this.bot.telegram.sendMessage(
            ctx.chat.id,
            `🥺 Sorry, You are not a premium member`
        )

        return
    }

    private async func_is_admin(ctx: any) {
        const isAdmin = await User.findOne({
            username: `@${ctx.from.username!}`,
            isAdmin: true,
        })

        if (!isAdmin) {
            return false
        }

        return true
    }
}

export default Usecase
