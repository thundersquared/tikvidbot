const getUrls = require("get-urls");
const got = require("got");
const TikTokScraper = require("tiktok-scraper");
const Extra = require("telegraf/extra");
const Markup = require("telegraf/markup");

// Config import and checks
const config = require("../config");

if (!config.http || !config.http.agent) {
    process.exit();
}

// TODO: add full link support
// const fullLinkRegex = /https??:\/\/(vm\.)??tiktok\.com\/(\w|\W|\d)+/;
const shortLinkRegex = /https??:\/\/(vm\.)??tiktok\.com\/(\w|\W|\d)+/;

const isWhitelisted = (username) => {
    return config.whitelist.length == 0 || config.whitelist.includes(username);
};

const handleChatMessage = async (ctx) => {
    if (!ctx.message.text) return;

    if (!isWhitelisted(ctx.message.from.username)) {
        return ctx.reply(ctx.i18n.t("errors.whitelist"));
    }

    let urls = Array.from(getUrls(ctx.message.text));

    return await Promise.all(
        urls.map(async (url) => {
            if (url.match(shortLinkRegex)) {
                await ctx.replyWithChatAction("upload_video");
                return await replyWithVideo(ctx, url);
            }

            return false;
        })
    );
};

const handleInlineMessage = async (ctx) => {
    if (!isWhitelisted(ctx.inlineQuery.from.username)) return;

    let query = ctx.inlineQuery.query;
    let urls = Array.from(getUrls(query));

    let results = await Promise.all(
        urls.map(async (url) => {
            if (url.match(shortLinkRegex)) {
                let data = await fetchTikTok(url);
                if (!data) return;

                let video = await fetchVideoMeta(data);
                if (!video) return false

                return {
                    type: "video",
                    id: video.id,
                    video_url: video.videoUrlNoWaterMark,
                    mime_type: "video/mp4",
                    thumb_url: video.imageUrl,
                    title: `${video.text} via @${config.telegram.username}`,
                    video_width: video.videoMeta?.width,
                    video_height: video.videoMeta?.height,
                    video_duration: video.videoMeta?.duration,
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

    let video = await fetchVideoMeta(data);
    if (!video) return ctx.reply(ctx.i18n.t("errors.stream"));

    try {
        return await ctx.replyWithVideo(
            {source: got.stream(video.videoUrlNoWaterMark)},
            {reply_to_message_id: ctx.message.message_id}
        );
    } catch (e) {
        return ctx.reply(video.videoUrlNoWaterMark);
    }
};

const fetchTikTok = async (url) => {
    try {
        const {redirectUrls} = await got(url, {
            headers: {"user-agent": config.http.agent},
        });
        return redirectUrls.pop();
    } catch (e) {
        console.log(e);
    }
};

const fetchVideoMeta = async (url) => {
    return await TikTokScraper.getVideoMeta(url, {
        hdVideo: true,
    });
};

module.exports = {
    // TODO: add full link support
    // fullLink: fullLinkRegex,
    shortLink: shortLinkRegex,
    chatMessage: handleChatMessage,
    inlineMessage: handleInlineMessage,
};
