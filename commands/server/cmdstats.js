const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');

const commandStatsSchema = new mongoose.Schema({
  guildId: String,
  commandName: String,
  usageCount: { type: Number, default: 0 },
});

const CommandStats = mongoose.model('CommandStats', commandStatsSchema);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cmdstats')
    .setDescription('Show command usage statistics')
    .setDefaultMemberPermissions('ViewAuditLog'),
  async execute(interaction) {
    const stats = await CommandStats.find({ guildId: interaction.guild.id }).sort({ usageCount: -1 }).limit(10);

    const embed = new EmbedBuilder()
      .setTitle('📊 Command Usage Stats')
      .setDescription(stats.length ? stats.map(s => `\`${s.commandName}\`: ${s.usageCount} times`).join('\n') : 'No commands used yet!')
      .setColor('#0099ff')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

// Track command usage
module.exports.trackUsage = async (guildId, commandName) => {
  await CommandStats.findOneAndUpdate(
    { guildId, commandName },
    { $inc: { usageCount: 1 } },
    { upsert: true }
  );
};
