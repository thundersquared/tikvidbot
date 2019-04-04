const getUrls       = require('get-urls')
const got           = require('got')
const jsdom         = require('jsdom')
const Extra         = require('telegraf/extra')
const Markup        = require('telegraf/markup')
const { Script }    = require('vm')
const { JSDOM }     = jsdom

// Config import and checks
const config = require('../config')

if (!config.http || !config.http.agent) {
  process.exit()
}

// Domain checks
const command = ctx => {
  if (ctx.message.text) {
    let message

    if (typeof ctx.state.command !== 'undefined') {
      if (['fetch', 'download'].indexOf(ctx.state.command.command) !== -1) {
        message = ctx.state.command.args
      }
    } else {
      message = ctx.message.text
    }

    let urls = getUrls(message)

    if (urls.size > 0) {
      urls.forEach(url => {
        if (url.match(/https??:\/\/(vm\.)??tiktok\.com\/(\w|\W|\d)+/)) {
          if (ctx.session) {
            ctx.session.lookups++
          }

          ctx.replyWithChatAction('typing')

          download(ctx, url)
        }
      })
    } else {
      if (ctx.message.chat.type !== 'group' || ctx.message.chat.type !== 'supergroup') {
        return ctx.reply(ctx.i18n.t('errors.url'))
      }
    }
  } else {
    if (ctx.message.chat.type !== 'group' || ctx.message.chat.type !== 'supergroup') {
      return ctx.reply(ctx.i18n.t('errors.url'))
    }
  }
}

// Lookup process
const download = async (ctx, url) => {
  try {
    const response = await got(url, {
      headers: {
        'user-agent': config.http.agent || `tikvidbot/${pkg.version} (https://github.com/thundersquared/tikvidbot)`
      }
    })

    if (response.body) {
      const dom = new JSDOM(response.body, { runScripts: 'outside-only' })

      let scripts = dom.window.document.getElementsByTagName('script')
      let script = [...scripts].filter(e => e.innerHTML.match(/var data/)).pop()
      let data = script.innerHTML.split('$(function')[0]
      let s = new Script(data)
      dom.runVMScript(s)

      if (dom.window.data && dom.window.data.video) {
        let video = dom.window.data.video.download_addr.url_list.pop()

        if (video.startsWith('//')) {
          video = `https:${video}`
        }

        try {
          return ctx.replyWithVideo({
            source: got.stream(video)
          })
        } catch (e) {
          console.log(e)
          return ctx.reply(video)
        }
      } else {
        return ctx.reply(ctx.i18n.t('errors.stream'))
      }
    }
  } catch (e) {
    console.log(e)
    return ctx.reply(ctx.i18n.t('errors.http'))
  }
}

module.exports = command
