import { Events, Interaction, ChatInputCommandInteraction, ModalSubmitInteraction, ButtonInteraction, MessageFlags, ChannelType, PermissionFlagsBits, EmbedBuilder, OverwriteType } from 'discord.js';
import { container } from '../../core/di/container';
import { ConnectionStatus } from '../../domain/enums/ConnectionStatus';
import { injectable, inject } from 'tsyringe';
import { IEvent } from './IEvent';
import { DiscordManager } from '../../core/discord/DiscordManager';
import { ConnectionChannelCache } from '../../infrastructure/cache/ConnectionChannelCache';
import { logger } from '../../core/logger/logger';

@injectable()
export class InteractionCreateEvent implements IEvent<Events.InteractionCreate> {
  public readonly name = Events.InteractionCreate;

  constructor(
    // We use a getter or resolve dynamically to avoid circular dependency in constructor if not careful,
    // but here we can just inject DiscordManager to get commands
    @inject('DiscordManager') private readonly discordManager: DiscordManager
  ) {}

  public async execute(interaction: Interaction): Promise<void> {
    if (interaction.isChatInputCommand()) {
      await this.handleChatInput(interaction);
    } else if (interaction.isModalSubmit()) {
      await this.handleModalSubmit(interaction);
    } else if (interaction.isButton()) {
      await this.handleButtonSubmit(interaction);
    }
  }

  private async handleChatInput(interaction: ChatInputCommandInteraction): Promise<void> {
    const command = this.discordManager.getCommand(interaction.commandName);

    if (!command) {
      logger.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      logger.error({ err: error, command: interaction.commandName }, `Error executing command`);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
      }
    }
  }

  private async handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
    if (interaction.customId === 'edit_profile_modal') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      try {
        const languages = interaction.fields.getTextInputValue('languages').split(',').map(s => s.trim()).filter(Boolean);
        const interests = interaction.fields.getTextInputValue('interests').split(',').map(s => s.trim()).filter(Boolean);
        const bio = interaction.fields.getTextInputValue('bio').trim();
        
        // This expects enum values like FRIENDSHIP, GAMING
        const lookingForRaw = interaction.fields.getTextInputValue('lookingFor').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
        
        const { ProfileService } = await import('../../application/services/ProfileService');
        const profileService = container.resolve(ProfileService);

        await profileService.updateProfile(interaction.user.id, {
          languages,
          interests,
          bio,
          lookingFor: lookingForRaw as any[], // Casting for now, normally validate against enum
        });

        await interaction.editReply('Your profile has been updated successfully!');
      } catch (error: any) {
        logger.error({ err: error, userId: interaction.user.id }, 'Failed to update profile via modal');
        await interaction.editReply('Failed to update profile: ' + (error.message || 'Unknown error'));
      }
    }
  }

  private async handleButtonSubmit(interaction: ButtonInteraction): Promise<void> {
    const customId = interaction.customId;
    const { ConnectionService } = await import('../../application/services/ConnectionService');
    const connectionService = container.resolve(ConnectionService);

    if (customId.startsWith('connect_')) {
      const targetId = customId.substring('connect_'.length);
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      try {
        if (!interaction.guildId) throw new Error('Must be used in a server.');
        await connectionService.sendRequest(interaction.user.id, targetId, interaction.guildId);
        await interaction.editReply('Connection request sent! 📨');
        
        // Attempt to send DM
        try {
          const targetUser = await interaction.client.users.fetch(targetId);
          const dmEmbed = new EmbedBuilder()
            .setTitle('📬 New Connection Request!')
            .setColor(0x00ff00)
            .setDescription('Someone on the server wants to connect with you anonymously on Fynda!')
            .addFields({ name: 'Action Required', value: 'Head over to the server and type `/requests` to view their profile and accept or reject the request.' })
            .setFooter({ text: 'Fynda Matchmaking' });
            
          await targetUser.send({ embeds: [dmEmbed] });
        } catch (dmError) {
          logger.warn({ err: dmError, targetId }, 'Could not send DM to user (DMs may be disabled)');
        }
      } catch (error: any) {
        await interaction.editReply(error.message || 'Failed to send request.');
      }
    } else if (customId.startsWith('skip_')) {
      const targetId = customId.substring('skip_'.length);
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      try {
        await connectionService.skipUser(interaction.user.id, targetId);
        await interaction.editReply('Profile skipped.');
      } catch (error: any) {
        await interaction.editReply(error.message || 'Error skipping profile.');
      }
    } else if (customId.startsWith('accept_')) {
      const requestId = customId.substring('accept_'.length);
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      try {
        if (!interaction.guild) throw new Error('Must be used in a server.');
        
        // Check if request is valid and pending
        const existingRequest = await connectionService.getRequestById(requestId);
        if (!existingRequest) throw new Error('Connection request not found.');
        if (existingRequest.status !== ConnectionStatus.PENDING) throw new Error('This request has already been processed.');

        // Validate senderGuildId exists before proceeding
        if (!existingRequest.senderGuildId) {
          throw new Error('Cannot accept this request: the sender\'s server information is missing.');
        }

        // Find or create category
        let category = interaction.guild.channels.cache.find(c => c.name === 'Fynda Chats' && c.type === ChannelType.GuildCategory);
        if (!category) {
          category = await interaction.guild.channels.create({
            name: 'Fynda Chats',
            type: ChannelType.GuildCategory,
            permissionOverwrites: [
              { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] }
            ]
          });
        }

        // Create a private text channel for receiver
        const receiverChannel = await interaction.guild.channels.create({
          name: `fynda-chat-${requestId.substring(0, 5)}`,
          type: ChannelType.GuildText,
          parent: category.id,
          permissionOverwrites: [
            { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
            { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages], type: OverwriteType.Member }
          ]
        });

        // Find or create category in sender's guild
        const senderGuild = await interaction.client.guilds.fetch(existingRequest.senderGuildId);
        let senderCategory = senderGuild.channels.cache.find(c => c.name === 'Fynda Chats' && c.type === ChannelType.GuildCategory);
        if (!senderCategory) {
          senderCategory = await senderGuild.channels.create({
            name: 'Fynda Chats',
            type: ChannelType.GuildCategory,
            permissionOverwrites: [
              { id: senderGuild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] }
            ]
          });
        }

        // Create a private text channel for sender
        const senderChannel = await senderGuild.channels.create({
          name: `fynda-chat-${requestId.substring(0, 5)}`,
          type: ChannelType.GuildText,
          parent: senderCategory.id,
          permissionOverwrites: [
            { id: senderGuild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
            { id: existingRequest.senderDiscordId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages], type: OverwriteType.Member }
          ]
        });

        // Now respond to request (update status to accepted)
        const request = await connectionService.respondToRequest(requestId, true, senderChannel.id, receiverChannel.id);

        // Invalidate channel cache for newly created channels
        const channelCache = container.resolve(ConnectionChannelCache);
        channelCache.invalidateChannel(senderChannel.id);
        channelCache.invalidateChannel(receiverChannel.id);
        
        const welcomeMessage = `🎉 You are now connected! This channel is completely private. You can chat anonymously here.\n\n**⚠️ IMPORTANT REMINDER:**\n\`/reveal\` - Vote to reveal your true Discord identities to each other.\n\`/endchat\` - End the conversation and close this channel permanently.`;
        await receiverChannel.send(welcomeMessage);
        await senderChannel.send(welcomeMessage);
        
        await interaction.editReply(`Request accepted! Check out <#${receiverChannel.id}>`);

        // Send DM to the sender to notify them
        try {
          const senderUser = await interaction.client.users.fetch(request.senderDiscordId);
          const acceptedEmbed = new EmbedBuilder()
            .setTitle('✅ Request Accepted!')
            .setColor(0x00ff00)
            .setDescription(`Your connection request was accepted! A new private room has been created for you.`)
            .addFields({ name: 'Go to Chat', value: `<#${senderChannel.id}>` })
            .setFooter({ text: 'Enjoy your chat!' });
          await senderUser.send({ embeds: [acceptedEmbed] });
        } catch (dmError) {
          logger.warn({ err: dmError, senderId: existingRequest.senderDiscordId }, 'Could not send acceptance DM to sender');
        }

      } catch (error: any) {
        logger.error({ err: error, requestId }, 'Error accepting connection request');
        await interaction.editReply(error.message || 'Error accepting request.');
      }
    } else if (customId.startsWith('reject_')) {
      const requestId = customId.substring('reject_'.length);
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      try {
        await connectionService.respondToRequest(requestId, false);
        await interaction.editReply('Request rejected.');
      } catch (error: any) {
        await interaction.editReply(error.message || 'Error rejecting request.');
      }
    }
  }
}
