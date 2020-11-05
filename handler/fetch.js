const {unlink} = require('fs');
const validUrl = require("valid-url");
const getUrls = require("get-urls");
const TikTokScraper = require("tiktok-scraper");

// Config import and checks
const config = require("../config");

if (!config.http || !config.http.agent) {
    process.exit();
}

const fullLinkRegex = /https:\/\/www\.tiktok\.com\/@.*\/video\/\d{18,}.*/;
const shortLinkRegex = /https??:\/\/(v[m|t]\.)??tiktok\.com\/(\w|\W|\d)+/;

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
                try {
                    return await replyWithVideo(ctx, url);
                } catch (e) {
                    console.error(e);
                    return false;
                }
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
                try {
                    let video = await fetchVideoMeta(url);
                    if (!video) return false;

                    if (!validUrl.isUri(video.videoUrlNoWaterMark)) {
                        return false;
                    }

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
                } catch (e) {
                    return ctx.reply(ctx.i18n.t("errors.stream"));
                }
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
    let dest = '/tmp';
    let path = null;

    try {
        let meta = await TikTokScraper.getVideoMeta(url);

        let download = await TikTokScraper.video(url, {
            download: true,
            filepath: dest,
            noWaterMark: true,
        });

        path = `${dest}/${meta.id}.mp4`;

        return await ctx.replyWithVideo(
            {source: path},
            {reply_to_message_id: ctx.message.message_id}
        );
    } catch (err) {
        return ctx.reply(ctx.i18n.t("errors.stream"));
    } finally {
        if (path) {
            unlink(path, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        }
    }
};

const fetchVideoMeta = async (url) => {
    try {
        let res = await TikTokScraper.getVideoMeta(url, {
            noWaterMark: true,
            hdVideo: true,
        });

        if (!res.videoUrlNoWaterMark || res.videoUrlNoWaterMark.length === 0) {
            res.videoUrlNoWaterMark = res.videoUrl;
        }

        return res;
    } catch (e) {
        return false;
    }
};

module.exports = {
    fullLink: fullLinkRegex,
    shortLink: shortLinkRegex,
    chatMessage: handleChatMessage,
    inlineMessage: handleInlineMessage,
};
