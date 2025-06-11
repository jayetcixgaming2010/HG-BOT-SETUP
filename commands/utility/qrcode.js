const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const QRCode = require('qrcode');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('qrcode')
    .setDescription('Generate a QR code')
    .addStringOption(option =>
      option.setName('content')
        .setDescription('Text or URL for the QR code')
        .setRequired(true)),
  async execute(interaction) {
    const content = interaction.options.getString('content');

    try {
      const qrBuffer = await QRCode.toBuffer(content);
      const attachment = new AttachmentBuilder(qrBuffer, { name: 'qrcode.png' });

      const embed = new EmbedBuilder()
        .setTitle('QR Code')
        .setDescription(`QR code for: ${content}`)
        .setImage('attachment://qrcode.png')
        .setColor('#0099ff');

      await interaction.reply({ embeds: [embed], files: [attachment] });
    } catch (error) {
      await interaction.reply({ content: 'Error generating QR code!', ephemeral: true });
    }
  },
};