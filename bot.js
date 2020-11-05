// Config import and checks
const config = require("./config");

if (
    !config.telegram ||
    !config.telegram.token ||
    config.telegram.token.indexOf(":") < 0
) {
    process.exit();
}

// Telegram modules loading
const path = require("path");
const Telegraf = require("telegraf");
const TelegrafI18n = require("telegraf-i18n");
const RateLimit = require("telegraf-ratelimit");
const MySQLSession = require("telegraf-session-mysql");
const LocalSession = require("telegraf-session-local");
const commandParts = require("telegraf-command-parts");
const fetch = require("./handler/fetch");
const lang = require("./handler/lang").command;

const bot = new Telegraf(config.telegram.token, {
    username: config.telegram.username,
});

// DB connection if any
if (config.mysql && config.mysql.host) {
    const session = new MySQLSession(config.mysql);
    bot.use(session.middleware());
} else {
    const session = new LocalSession({database: "session_db.json"});
    bot.use(session.middleware());
}

// Internationalization
const i18n = new TelegrafI18n({
    directory: path.resolve(__dirname, "locales"),
    defaultLanguage: "en",
    sessionName: "session",
});
bot.use(i18n.middleware());

// Limit lookups
const limiter = new RateLimit({
    window: config.limiter.window,
    limit: config.limiter.limit,
    onLimitExceeded: (ctx, next) => {
        return ctx.reply(ctx.i18n.t("rate.limit"));
    },
});
if (config.limiter.enabled) {
    bot.use(limiter);
}

// Apply middlewares
bot.use(commandParts());
bot.use((ctx, next) => {
    if (ctx.session) {
        ctx.session.lang = ctx.session.lang || "en";
        ctx.i18n.locale(ctx.session.lang);
    }

    return next();
});

// Catch errors
bot.catch((err) => {
    console.log("Bot did an ooopsie!", err);
});

// Start command
bot.start((ctx) => {
    return ctx.reply(ctx.i18n.t("commands.start"));
});

bot.command("help", (ctx) =>
    ctx.reply(ctx.i18n.t("commands.help"), {
        parse_mode: "Markdown",
    })
);

bot.command("lang", lang);

// Disabled inline queries as TikTok requires specific headers to display a video,
// which we can't control since preview downloads are server-side
// bot.on("inline_query", fetch.inlineMessage);

bot.hears(fetch.fullLink, fetch.chatMessage);
bot.hears(fetch.shortLink, fetch.chatMessage);

bot.launch();
