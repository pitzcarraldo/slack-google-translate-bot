import { promisify } from 'util'
import BotCommander from './BotCommander';
import { translate } from './translator';
import { read } from 'fs';

const commander = new BotCommander();

export default function initialize(bot, botId, botName) {
    const APPENDED_MESSAGE = process.env.APPENDED_MESSAGE || '';
    bot.postMessageToUserPromise = promisify(bot.postMessageToUser)
    bot.postMessageToGroupPromise = promisify(bot.postMessageToGroup)
    bot.postMessageToChannelPromise = promisify(bot.postMessageToChannel)

    bot.on('message', async function (data) {
        const { type, channel: channelId, text, user: userId, subtype } = data;
        if (type !== 'message') {
            return;
        }

        if (['bot_message', 'message_changed'].indexOf(subtype) > -1) {
            return;
        }

        if (userId === botId) {
            return;
        }

        if (text.indexOf('`') === 0) {
            return;
        }

        if (text.indexOf(`<@${botId}>`) === 0) {
            const command = text.split(`<@${botId}> `)[1];
            return commander.command(command, channelId);
        }

        if (commander.getSuspended().has(channelId)) {
            return;
        }

        try {
            const translated = await translate(text);
            if (!translated) {
                return;
            }
            const username = await bot.getUserName(userId);
            const message = `*@${username}:* ${translated} ${APPENDED_MESSAGE}`;
            const channel = await bot.getChannelNameById(channelId);
            if (!channel) {
                return await bot.postMessageToUserPromise(username, message, { as_user: process.env.BOT_AS_USER });
            }
            const { name: channelName, is_group, is_channel, is_im } = channel;
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

