import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { injectable, inject } from 'tsyringe';
import { ICommand } from './ICommand';
import { ProfileService } from '../../application/services/ProfileService';

@injectable()
export class StatsCommand implements ICommand {
  public data: any = new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View live statistics about Fynda.');

  constructor(
    @inject(ProfileService) private readonly profileService: ProfileService
  ) {}

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Total users across all servers the bot is in
    const totalServerMembers = interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    const serverCount = interaction.client.guilds.cache.size;

    const embed = new EmbedBuilder()
      .setTitle('📊 Fynda Statistics')
      .setColor(0x00aaff)
      .addFields(
        { name: 'Total Reach', value: `${totalServerMembers} users across ${serverCount} servers`, inline: false },
        { name: 'Bot Ping', value: `${interaction.client.ws.ping}ms`, inline: false }
      )
      .setFooter({ text: 'Growing bigger every day!' });

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
}
