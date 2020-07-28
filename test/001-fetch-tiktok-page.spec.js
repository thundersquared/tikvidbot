const {shortLink, chatMessage} = require('../handler/fetch');

describe('Fetch TikTok page', () => {
    it('Should return true if equal', () => {
        return /https??:\/\/(vm\.)??tiktok\.com\/(\w|\W|\d)+/ === shortLink;
    });

    it('Should return true if equal', async () => {
        const ctx = {
            message: {
                from: {
                    username: 'implode'
                },
                text: 'https://vm.tiktok.com/JY4YFyv/'
            },
            replyWithChatAction: e => {
                console.log(e)
            },
            replyWithVideo: e => {
                console.log(e)
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
