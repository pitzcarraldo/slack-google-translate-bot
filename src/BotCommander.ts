export default class BotCommander {
    suspendTimeOut = parseInt(process.env.SUSPEND_TIMEOUT) || 600000;
    suspendedChannels = new Set<string>();

    command(command: string, channelId: any): string {
        switch (command) {
            case 'pause': {
                this.suspend(channelId);
                return 'Translation Paused.'
            }
            case 'resume': {
                this.resume(channelId);
                return 'Translation Resumed.'
            }
        }
        return ''
    }

    getSuspended(): Set<string> {
        return this.suspendedChannels;
    }

    suspend(channel: string): void {
        this.suspendedChannels.add(channel);
        setTimeout(() => this.suspendedChannels.delete(channel), this.suspendTimeOut);
    }

    resume(channel: string): void {
        this.suspendedChannels.delete(channel)
    }
}