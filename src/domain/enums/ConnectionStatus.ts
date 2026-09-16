export enum ConnectionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  SKIPPED = 'SKIPPED', // When a user skips a profile during discovery
  ENDED = 'ENDED', // When a private chat is ended by a user
  REVEALED = 'REVEALED', // When both users agree to reveal their identities
}
