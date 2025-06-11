const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: String,
  guildId: String,
  channelId: String,
  message: String,
  time: Date,
});

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Set a reminder')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The reminder message')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('time')
        .setDescription('When to remind (e.g., 1h, 30m)')
        .setRequired(true)),
  async execute(interaction) {
    const message = interaction.options.getString('message');
    const time = interaction.options.getString('time');

    const msTime = parseDuration(time);
    if (!msTime) {
      return interaction.reply({ content: 'Invalid time format! Use 1h, 30m, etc.', ephemeral: true });
    }

    const remindTime = new Date(Date.now() + msTime);

    const reminder = new Reminder({
      userId: interaction.user.id,
      guildId: interaction.guild.id,
      channelId: interaction.channel.id,
      message,
      time: remindTime,
    });

    await reminder.save();

    const embed = new EmbedBuilder()
      .setTitle('Reminder Set')
      .setDescription(`I'll remind you about "${message}" at <t:${Math.floor(remindTime.getTime() / 1000)}:F>`)
      .setColor('#00ff00');

    await interaction.reply({ embeds: [embed], ephemeral: true });

    setTimeout(async () => {
      const user = await interaction.client.users.fetch(interaction.user.id);
      user.send(`Reminder: ${message}`);
      await Reminder.deleteOne({ _id: reminder._id });
    }, msTime);
  },
};

function parseDuration(duration) {
  const regex = /^(\d+)([smhd])$/;
  const match = duration.match(regex);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2];
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * units[unit];
}