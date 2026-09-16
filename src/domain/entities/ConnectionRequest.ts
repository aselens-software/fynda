import { ConnectionStatus } from '../enums/ConnectionStatus';

export class ConnectionRequest {
  constructor(
    public readonly id: string,
    public readonly senderDiscordId: string,
    public readonly receiverDiscordId: string,
    public status: ConnectionStatus,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public senderGuildId?: string,
    public senderChannelId?: string,
    public receiverChannelId?: string,
    public revealedUsers: string[] = []
  ) {}

  public accept(senderChannel: string, receiverChannel: string): void {
    this.status = ConnectionStatus.ACCEPTED;
    this.senderChannelId = senderChannel;
    this.receiverChannelId = receiverChannel;
    this.updatedAt = new Date();
  }

  public reject(): void {
    this.status = ConnectionStatus.REJECTED;
    this.updatedAt = new Date();
  }

  public end(): void {
    this.status = ConnectionStatus.ENDED;
    this.updatedAt = new Date();
  }

  public reveal(discordId: string): boolean {
    if (!this.revealedUsers.includes(discordId)) {
      this.revealedUsers.push(discordId);
      this.updatedAt = new Date();
    }
    
    if (this.revealedUsers.length >= 2) {
      this.status = ConnectionStatus.REVEALED;
      return true; // Both revealed
    }
    return false; // Only one revealed
  }
}
