import { promisify } from 'util'
import Suspeneder from './Suspender';
import { translate } from './translator';
import { read } from 'fs';

const suspeneder = new Suspeneder();

export default function initialize(bot, botId, botName) {
    const APPENDED_MESSAGE = process.env.APPENDED_MESSAGE || '';
    const SUSPEND_TIMEOUT = parseInt(process.env.SUSPEND_TIMEOUT) || 600000;
    const suspended = suspeneder.getSuspended();
    bot.postMessageToUserPromise = promisify(bot.postMessageToUser)
    bot.postMessageToGroupPromise = promisify(bot.postMessageToGroup)
    bot.postMessageToChannelPromise = promisify(bot.postMessageToChannel)

    bot.on('message', async function ({ type, channel: channelId, text, user: userId, subtype }) {
        if (type !== 'message') {
            return;
        }

        if (['bot_message', 'message_changed'].indexOf(subtype) > -1) {
            return;
        }

        if (userId === botId) {
            return;
        }

        if (suspended.has(channelId)) {
            return;
        }

        if (text === `<@${botId}>: pause`) {
            return suspeneder.suspend(channelId, SUSPEND_TIMEOUT);
        }

        if (text === `<@${botId}>: resume`) {
            return suspeneder.resume(channelId);
        }

        if (text.indexOf('`') === 0) {
            return;
        }

        try {
            const translated = await translate(text);
            const username = getUserName(bot.users, userId);
            const message = `*@${username}:* ${translated} ${APPENDED_MESSAGE}`;
            const channel = getChannelNameById([...bot.channels, ...bot.groups], channelId);
            if (!channel) {
                return await bot.postMessageToUserPromise(username, message, { as_user: process.env.BOT_AS_USER });
            }
            const { name: channelName, is_group, is_channel } = channel;
            if (is_group) {
                return await bot.postMessageToGroupPromise(channelName, message, { as_user: process.env.BOT_AS_USER });
            }
            if (is_channel) {
                return await bot.postMessageToChannelPromise(channelName, message, { as_user: process.env.BOT_AS_USER });
            }
            return;
        } catch (error) {
            console.error(error);
            return;
        }
    });
}

function getUserName(users, userId) {
    const user = users.find(({ id }) => id === userId);
    return user && user.name || '';
}

function getChannelNameById(channels, channelId) {
    return channels.find(({ id }) => id === channelId);
}
