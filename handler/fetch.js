const getUrls = require("get-urls");
const got = require("got");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

// Config import and checks
const config = require("../config");

if (!config.http || !config.http.agent) {
  process.exit();
}

const tiktokRegex = /https??:\/\/(vm\.)??tiktok\.com\/(\w|\W|\d)+/;

const isWhitelisted = (username) => {
  return config.whitelist.length == 0 || config.whitelist.includes(username);
};

const handleChatMessage = async (ctx) => {
  if (!ctx.message.text) return;
  if (!isWhitelisted(ctx.message.from.username)) {
    return ctx.reply(ctx.i18n.t("errors.whitelist"));
  }

  let urls = getUrls(ctx.message.text);

  urls.forEach((url) => {
    if (url.match(tiktokRegex)) {
      ctx.replyWithChatAction("upload_video");
      replyWithVideo(ctx, url);
    }
  });
};

const handleInlineMessage = async (ctx) => {
  if (!isWhitelisted(ctx.inlineQuery.from.username)) return;

  let query = ctx.inlineQuery.query;
  let urls = Array.from(getUrls(query));

  let results = await Promise.all(
    urls.map(async (url) => {
      if (url.match(tiktokRegex)) {
        let data = await fetchTikTok(url);
        if (!data) return;

        let info = data.props?.pageProps?.videoData?.itemInfos;
        let cover = info?.covers[0];
        let meta = info?.video?.videoMeta;

        return {
          type: "video",
          id: data.props?.pageProps?.key,
          video_url: getVideoUrl(data),
          mime_type: "video/mp4",
          thumb_url: cover,
          title: `via @${config.telegram.username}`,
          video_width: meta?.width,
          video_height: meta?.height,
          video_duration: meta?.duration,
        };
      }
    })
  );
  if (!results) return;

  try {
    ctx.answerInlineQuery(results);
  } catch (e) {
    console.log(e);
  }
};

const replyWithVideo = async (ctx, url) => {
  let data = await fetchTikTok(url);
  if (!data) return ctx.reply(ctx.i18n.t("errors.http"));

  let video = getVideoUrl(data);
  if (!video) return ctx.reply(ctx.i18n.t("errors.stream"));

  try {
    return ctx.replyWithVideo(
      { source: got.stream(video) },
      { reply_to_message_id: ctx.message.message_id }
    );
  } catch (e) {
    console.log(e);
    return ctx.reply(video);
  }
};

const fetchTikTok = async (url) => {
  try {
    const response = await got(url, {
      headers: { "user-agent": config.http.agent },
    });

    return parseResponseBody(response.body);
  } catch (e) {
    console.log(e);
  }
};

const parseResponseBody = (responseBody) => {
  let raw = responseBody.match(
    /<script id="__NEXT_DATA__".*?>(?<data>.*?)<\/script>/m
  );
  return JSON.parse(raw.groups.data);
};

const getVideoUrl = (data) => {
  let videos = data?.props?.pageProps?.videoData?.itemInfos?.video?.urls;
  if (!videos || !videos.length) return;

  let video = videos[0];

  if (video.startsWith("//")) {
    return `https:${video}`;
  } else {
    return video;
  }
};

module.exports = {
  redex: tiktokRegex,
  chatMessage: handleChatMessage,
  inlineMessage: handleInlineMessage,
};
