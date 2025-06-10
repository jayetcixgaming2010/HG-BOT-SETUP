const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const cron = require('node-cron');

const birthdaySchema = new mongoose.Schema({
  userId: String,
  guildId: String,
  date: String, // Format: MM-DD
});

const Birthday = mongoose.model('Birthday', birthdaySchema);

// Schedule daily birthday check
cron.schedule('0 8 * * *', async () => {
  const today = new Date().toISOString().slice(5, 10); // MM-DD
  const birthdays = await Birthday.find({ date: today });
  for (const bday of birthdays) {
    const guild = await client.guilds.fetch(bday.guildId);
    const channel = guild.channels.cache.find(ch => ch.name.includes('general') || ch.name.includes('announce'));
    if (channel) {
      const embed = new EmbedBuilder()
        .setTitle('🎉 Happy Birthday!')
        .setDescription(`Wish <@${bday.userId}> a happy birthday today!`)
        .setColor('#ffcc00');
      channel.send({ embeds: [embed] });
    }
  }
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('birthday')
    .setDescription('Set your birthday')
    .addStringOption(option =>
      option.setName('date')
        .setDescription('Your birthday (MM-DD)')
        .setRequired(true)),
  async execute(interaction) {
    const date = interaction.options.getString('date');
    if (!/^\d{2}-\d{2}$/.test(date)) {
      return interaction.reply({ content: 'Invalid date format! Use MM-DD (e.g., 06-10).', ephemeral: true });
    }

    await Birthday.findOneAndUpdate(
      { userId: interaction.user.id, guildId: interaction.guild.id },
      { date },
      { upsert: true }
    );

    const embed = new EmbedBuilder()
      .setTitle('Birthday Set')
      .setDescription(`Your birthday is set to ${date}. We'll announce it in the server!`)
      .setColor('#ffcc00');

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
