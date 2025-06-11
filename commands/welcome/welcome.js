const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const mongoose = require('mongoose');
const Canvas = require('canvas');

const welcomeSchema = new mongoose.Schema({
  guildId: String,
  channelId: String,
  message: String,
  image: Boolean,
});

const Welcome = mongoose.model('Welcome', welcomeSchema);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Configure welcome message')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel for welcome messages')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Custom welcome message')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('image')
        .setDescription('Enable welcome image')
        .setRequired(true)),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');
    const image = interaction.options.getBoolean('image');

    await Welcome.findOneAndUpdate(
      { guildId: interaction.guild.id },
      { channelId: channel.id, message, image },
      { upsert: true }
    );

    const embed = new EmbedBuilder()
      .setTitle('Welcome Config Updated')
      .setDescription(`Welcome messages will be sent to ${channel} with message: "${message}"\nImage enabled: ${image}`)
      .setColor('#00ff00');

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

// Handle welcome event
module.exports.welcomeEvent = async (member, client) => {
  const config = await Welcome.findOne({ guildId: member.guild.id });
  if (!config) return;

  const channel = member.guild.channels.cache.get(config.channelId);
  if (!channel) return;

  let attachment = null;
  if (config.image) {
    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#36393f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Text
    ctx.font = '30px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Welcome ${member.user.tag}!`, 20, 50);
    ctx.fillText(config.message, 20, 100);

    // Avatar
    const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'jpg' }));
    ctx.beginPath();
    ctx.arc(600, 125, 80, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, 520, 45, 160, 160);

    attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome.png' });
  }

  const embed = new EmbedBuilder()
    .setTitle('Welcome!')
    .setDescription(config.message.replace('{user}', `<@${member.id}>`))
    .setColor('#00ff00')
    .setImage(attachment ? 'attachment://welcome.png' : null);

  channel.send({ embeds: [embed], files: attachment ? [attachment] : [] });
};
