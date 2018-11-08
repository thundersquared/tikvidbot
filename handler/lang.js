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
  if (ctx.state.command.command === 'lang') return

  let lang = ctx.state.command.args

  if (languages.find(e => e.code === lang)) {
    lang = languages.find(e => e.code === lang)

    ctx.session.lang = lang.code
    ctx.i18n.locale(lang.code)

    return ctx.reply(ctx.i18n.t('commands.lang.changed', {
      language: lang.name
    }))
  }

  return ctx.reply(ctx.i18n.t('commands.lang.info', {
    language: languages.find(e => e.code === ctx.session.lang).name
  }))
}

module.exports = {
  languages,
  command
}
