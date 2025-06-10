const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setbanner')
    .setDescription('Set server banner (requires Boost Level 2+)')
    .addAttachmentOption(option =>
      option.setName('image')
        .setDescription('Banner image')
        .setRequired(true))
    .setDefaultMemberPermissions('Administrator'),
  async execute(interaction) {
    const image = interaction.options.getAttachment('image');
    if (!['image/png', 'image/jpeg', 'image/gif'].includes(image.contentType)) {
      return interaction.reply({ content: 'Please upload a valid image (PNG/JPEG/GIF)!', ephemeral: true });
    }

    try {
      await interaction.guild.setBanner(image.url);
      const embed = new EmbedBuilder()
        .setTitle('Banner Updated')
        .setDescription('Server banner has been updated!')
        .setImage(image.url)
        .setColor('#00ff00');
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: 'Error setting banner! Ensure server has Boost Level 2+.', ephemeral: true });
    }
  },
};