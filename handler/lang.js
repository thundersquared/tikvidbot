const util = require('util')

const languages = [
    {
        code: 'en',
        name: 'English'
    },
    {
        code: 'it',
        name: 'Italiano'
    },
]

const command = ctx => {
    if (!ctx.session) return

    if (ctx.state.command.command !== 'lang') return

    if (ctx.state.command && ctx.state.command.args) {
        let lang = ctx.state.command.args

        if (languages.find(e => e.code === lang)) {
            lang = languages.find(e => e.code === lang)

            ctx.session.lang = lang.code
            ctx.i18n.locale(lang.code)

            return ctx.reply(ctx.i18n.t('commands.lang.changed', {
                language: lang.name
            }))
        }
    }

    if (ctx.session && !ctx.session.lang) {
        ctx.session.lang = languages[0]
    }

    return ctx.reply(ctx.i18n.t('commands.lang.info', {
        language: languages.find(e => e.code === ctx.session.lang).name
    }))
}

module.exports = {
    languages,
    command
}
