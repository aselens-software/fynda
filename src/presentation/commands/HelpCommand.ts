import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, MessageFlags } from 'discord.js';
import { injectable } from 'tsyringe';
import { ICommand } from './ICommand';

@injectable()
export class HelpCommand implements ICommand {
  public data: any = new SlashCommandBuilder()
    .setName('help')
    .setDescription('List all available Fynda commands and how to use them.');

  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle('Fynda Help & Commands')
      .setColor(0x00ff00)
      .setDescription('Welcome to Fynda! Here is how you can use the bot:')
      .addFields(
        { name: '📝 Profile Management', value: '`/editprofile` - Setup or edit your profile (bio, languages, interests)\n`/visibility` - Turn your discoverability ON or OFF' },
        { name: '🔍 Matching & Discovery', value: '`/discover` - Find new potential friends anonymously\n`/requests` - View and accept/reject your pending connection requests' },
        { name: '💬 Private Chats', value: '`/reveal` - Vote to reveal your true identity in a private chat\n`/endchat` - End a private chat and close the channel' },
        { name: '🛠️ Other', value: '`/feedback` - Send feedback or report an issue directly to the developers' },
        { name: 'How it works', value: '1. Setup profile\n2. Turn on visibility\n3. Use /discover to send requests\n4. Accept requests in /requests to open a private, anonymous chat channel!' }
      )
      .setFooter({ text: 'Enjoy meeting new people on Fynda!' });

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
}
