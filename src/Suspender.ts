export default class Suspeneder {
    suspendedChannels = new Set<string>();

    getSuspended(): Set<string> {
        return this.suspendedChannels;
    }

    suspend(channel: string, timeout: number): void {
        this.suspendedChannels.add(channel);
        setTimeout(() => this.suspendedChannels.delete(channel), timeout);
    }

    resume(channel: string): void {
        this.suspendedChannels.delete(channel)
    }
}