const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a member from the server with detailed reason')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to ban')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member || !member.bannable) {
      return interaction.reply({ content: 'I cannot ban this user!', ephemeral: true });
    }

    // Create modal for ban reason
    const modal = new ModalBuilder()
      .setCustomId(`ban_modal_${user.id}`)
      .setTitle('Ban Reason');

    const reasonInput = new TextInputBuilder()
      .setCustomId('reason')
      .setLabel('Reason for ban')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const durationInput = new TextInputBuilder()
      .setCustomId('duration')
      .setLabel('Duration (e.g., 7d, 1h, permanent)')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const actionRow1 = new ActionRowBuilder().addComponents(reasonInput);
    const actionRow2 = new ActionRowBuilder().addComponents(durationInput);
    modal.addComponents(actionRow1, actionRow2);

    await interaction.showModal(modal);

    const filter = i => i.customId === `ban_modal_${user.id}` && i.user.id === interaction.user.id;
    const modalInteraction = await interaction.awaitModalSubmit({ filter, time: 60000 }).catch(() => null);

    if (!modalInteraction) return;

    const reason = modalInteraction.fields.getTextInputValue('reason');
    const duration = modalInteraction.fields.getTextInputValue('duration') || 'permanent';

    await member.ban({ reason });

    // Send log to webhook
    const logChannel = interaction.guild.channels.cache.find(ch => ch.name === 'mod-logs');
    if (logChannel) {
      const embed = new EmbedBuilder()
        .setTitle('Member Banned')
        .setColor('#ff0000')
        .addFields(
          { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
          { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
          { name: 'Reason', value: reason },
          { name: 'Duration', value: duration }
        )
        .setTimestamp();
      logChannel.send({ embeds: [embed] });
    }

    await modalInteraction.reply(`Successfully banned ${user.tag} for: ${reason} (Duration: ${duration})`);
  },
};
