const url           = require('url')
const Extra         = require('telegraf/extra')
const Markup        = require('telegraf/markup')
const werist        = require('werist')
const isDomainName  = require('is-domain-name')
const isHttpUrl     = require('is-http-url')

// Domain checks
const check = ctx => {
  if (ctx.message.text) {
    let domain

    if (typeof ctx.state.command !== 'undefined') {
      if (ctx.state.command.command === 'lookup') {
        domain = ctx.state.command.args
      }
    } else {
      domain = ctx.message.text
    }

    if (isHttpUrl(domain)) {
      let query = url.parse(domain)
      domain = query.hostname
    }

    if (isDomainName(domain)) {
      if (ctx.session) {
        ctx.session.lookups++
      }

      ctx.replyWithChatAction('typing')

      return lookup(ctx, domain)
    } else {
      if (ctx.message.chat.type !== 'group' || ctx.message.chat.type !== 'supergroup') {
        return ctx.reply(ctx.i18n.t('errors.domain'))
      }
    }
  }

  return false
}

// Lookup process
const lookup = (ctx, domain) => {
  werist.lookup(domain, (err, data) => {
    if (err) {
      console.error(err)
      return ctx.reply(ctx.i18n.t('errors.whois'))
    }

    if (data) {
      let whois = data.split('<<<')[0]

      whois = `<pre>${whois}</pre>`

      if (ctx.session) {
        whois += ctx.i18n.t('rate.lookup', {
          lookups: ctx.session.lookups,
          domain: domain
        })
      }

      return ctx.reply(whois, {
        disable_web_page_preview: true,
        parse_mode: 'HTML'
      })
    }
  })
}

module.exports = check
