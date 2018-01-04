import SlackBot from './SlackBot';
import initialize from './initialize';

const slackBot = new SlackBot({
    token: process.env.BOT_TOKEN,
    name: process.env.BOT_NAME
});

slackBot.on('start', async () => {
    try {
        const { id, name } = await slackBot.getUser(process.env.BOT_NAME);
        await initialize(slackBot, id, name);
        console.log('Slack Bot has been initialized.')
    } catch (error) {
        console.error(error);
    }
});
