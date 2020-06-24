const getUrls = require("get-urls");
const got = require("got");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

// Config import and checks
const config = require("../config");

if (!config.http || !config.http.agent) {
  process.exit();
}

// Domain checks
const command = (ctx) => {
  if (ctx.message.text) {
    let urls = getUrls(ctx.message.text);

    urls.forEach((url) => {
      if (url.match(/https??:\/\/(vm\.)??tiktok\.com\/(\w|\W|\d)+/)) {
        if (ctx.session) {
          ctx.session.lookups++;
        }

        ctx.replyWithChatAction("typing");

        download(ctx, url);
      }
    });
  }
};

// Lookup process
const download = async (ctx, url) => {
  try {
    const response = await got(url, {
      headers: {
        "user-agent":
          config.http.agent ||
          `tikvidbot/${pkg.version} (https://github.com/thundersquared/tikvidbot)`,
      },
    });

    if (response.body) {
      let data = response.body.match(/"urls":\s*?(?<list>\[.+?\])/m);
      let videos = JSON.parse(data.groups.list);

      if (videos && videos.length) {
        let video = videos.pop();

        if (video.startsWith("//")) {
          video = `https:${video}`;
        }

        try {
          return ctx.replyWithVideo({
            source: got.stream(video),
          });
        } catch (e) {
          console.log(e);
          return ctx.reply(video);
        }
      } else {
        return ctx.reply(ctx.i18n.t("errors.stream"));
      }
    }
  } catch (e) {
    console.log(e);
    return ctx.reply(ctx.i18n.t("errors.http"));
  }
};

module.exports = command;
