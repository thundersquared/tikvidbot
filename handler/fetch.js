const got           = require('got')
const jsdom         = require('jsdom')
const Extra         = require('telegraf/extra')
const Markup        = require('telegraf/markup')
const { Script }    = require('vm')
const { JSDOM }     = jsdom

// Domain checks
const command = ctx => {
  if (ctx.message.text) {
    let url

    if (typeof ctx.state.command !== 'undefined') {
      if (ctx.state.command.command === 'lookup') {
        url = ctx.state.command.args
      }
    } else {
      url = ctx.message.text
    }

    if (url.match(/https??:\/\/(vm\.)??tiktok\.com\/(\w|\W|\d)+?\//)) {
      if (ctx.session) {
        ctx.session.lookups++
      }

      ctx.replyWithChatAction('typing')

      return download(ctx, url)
    } else {
      if (ctx.message.chat.type !== 'group' || ctx.message.chat.type !== 'supergroup') {
        return ctx.reply(ctx.i18n.t('errors.url'))
      }
    }
  }

  return false
}

// Lookup process
const download = async (ctx, url) => {
  try {
    const response = await got(url)
    if (response.body) {
      const dom = new JSDOM(response.body, { runScripts: 'outside-only' })

      let scripts = dom.window.document.getElementsByTagName('script')
      let script = [...scripts].filter(e => e.innerHTML.match(/var data/)).pop()
      let data = script.innerHTML.split('$(function')[0]
      let s = new Script(data)
      dom.runVMScript(s)

      if (dom.window.data && dom.window.data.video) {
        try {
          return ctx.replyWithVideo({
            source: got.stream(dom.window.data.video.download_addr.url_list.pop())
          })
        } catch (e) {
          return ctx.reply(dom.window.data.video.download_addr.url_list.pop())
        }
      } else {
        return ctx.reply(ctx.i18n.t('errors.stream'))
      }
    }
  } catch (error) {
    console.error(error)
    return ctx.reply(ctx.i18n.t('errors.http'))
  }
}

module.exports = command
