const {
    chatMessage,
    inlineMessage,
    shortLink
} = require('../handler/fetch');

describe('Check regex', () => {
    it('Should return true if equal', () => {
        return /https??:\/\/(vm\.)??tiktok\.com\/(\w|\W|\d)+/ === shortLink;
    });
});

describe('Fetch TikTok video from chat message', () => {
    it('Should return Promise', async () => {
        const ctx = {
            message: {
                from: {
                    username: 'implode'
                },
                text: 'https://vm.tiktok.com/JY4YFyv/'
            },
            replyWithChatAction: e => {

            },
            replyWithVideo: e => {

            },
            reply: e => {
                console.log(e)
            },
            i18n: {
                t: s => s
            }
        };
        return await chatMessage(ctx);
    });
});

describe('Fetch TikTok video from inline query', () => {
    it('Should return Promise', async () => {
        const ctx = {
            inlineQuery: {
                from: {
                    username: 'implode'
                },
                query: 'https://vm.tiktok.com/JY4YFyv/'
            },
            answerInlineQuery: e => {
                console.log(e)
            },
            reply: e => {
                console.log(e)
            },
            i18n: {
                t: s => s
            }
        };
        return await inlineMessage(ctx);
    });
});
