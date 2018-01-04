import * as OriginalSlackBot from 'slackbots';

export default class SlackBot extends OriginalSlackBot {
    async fetchChannels() {
        try {
            const { channels } = await this._api('channels.list');
            this.channels = channels;
            return this.channels;
        } catch (error) {
            console.error(error);
            return this.channels;
        }
    }

    async fetchUsers() {
        try {
            const { members } = await this._api('users.list');
            this.users = members;
            return this.users;
        } catch (error) {
            console.error(error);
            return this.users;
        }
    }

    async fetchGroups() {
        try {
            const { groups } = await this._api('groups.list');
            this.groups = groups;
            return this.groups;
        } catch (error) {
            console.error(error);
            return this.groups;
        }
    }

    async getUserName(userId) {
        try {
            const user = this.users.find(({ id }) => id === userId);
            if (user) {
                return user.name;
            }
            return await this.fetchUserName(userId);
        } catch (error) {
            console.error(error);
            return '';
        }
    }

    async fetchUserName(userId) {
        try {
            const users = await this.fetchUsers();
            const user = users.find(({ id }) => id === userId);
            return user && user.name || '';
        } catch (error) {
            console.error(error);
            return '';
        }
    }

    async getChannelNameById(channelId) {
        try {
            const channelName = [...this.channels, ...this.groups].find(({ id }) => id === channelId);
            if (channelName) {
                return channelName;
            }
            return await this.fetchChannelNameById(channelId);
        } catch (error) {
            console.error(error);
            return;
        }
    }

    async fetchChannelNameById(channelId) {
        try {
            const [channels, groups] = await Promise.all([this.fetchChannels(), this.fetchGroups()]);
            return [...channels, ...groups].find(({ id }) => id === channelId);
        } catch (error) {
            console.error(error);
            return;
        }
    }

}