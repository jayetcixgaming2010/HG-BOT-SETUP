const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  guildId: String,
  channelId: String,
  messageId: String,
  question: String,
  options: [String],
  correct: Number,
  participants: [{ userId: String, answer: Number }],
  endTime: Date,
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('Create a quiz')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('The quiz question')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('options')
        .setDescription('Options (comma-separated, up to 4)')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('correct')
        .setDescription('Index of correct option (1-4)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g., 1m, 30s)')
        .setRequired(true)),
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const options = interaction.options.getString('options').split(',').map(o => o.trim()).slice(0, 4);
    const correct = interaction.options.getInteger('correct') - 1;
    const duration = interaction.options.getString('duration');

    if (options.length < 2 || correct < 0 || correct >= options.length) {
      return interaction.reply({ content: 'Invalid options or correct answer!', ephemeral: true });
    }

    const msDuration = parseDuration(duration);
    if (!msDuration) {
      return interaction.reply({ content: 'Invalid duration format! Use 1m, 30s, etc.', ephemeral: true });
    }

    const endTime = new Date(Date.now() + msDuration);

    const embed = new EmbedBuilder()
      .setTitle('📝 Quiz Time!')
      .setDescription(`**Question**: ${question}\n\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`)
      .setFooter({ text: `Ends at ${endTime.toLocaleString()}` })
      .setColor('#0099ff');

    const buttons = options.map((_, i) =>
      new ButtonBuilder()
        .setCustomId(`quiz_${i}`)
        .setLabel(`${i + 1}`)
        .setStyle(ButtonStyle.Primary)
    );

    const row = new ActionRowBuilder().addComponents(buttons);

    const message = await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: 'Quiz created!', ephemeral: true });

    const quiz = new Quiz({
      guildId: interaction.guild.id,
      channelId: interaction.channel.id,
      messageId: message.id,
      question,
      options,
      correct,
      participants: [],
      endTime,
    });

    await quiz.save();

    setTimeout(async () => {
      const updatedQuiz = await Quiz.findOne({ messageId: message.id });
      const correctAnswers = updatedQuiz.participants.filter(p => p.answer === updatedQuiz.correct);
      const resultEmbed = new EmbedBuilder()
        .setTitle('Quiz Results')
        .setDescription(`**Question**: ${question}\n**Correct Answer**: ${options[updatedQuiz.correct]}\n**Winners**: ${correctAnswers.length ? correctAnswers.map(p => `<@${p.userId}>`).join(', ') : 'None'}`)
        .setColor('#00ff00');

      message.edit({ embeds: [resultEmbed], components: [] });
      await Quiz.deleteOne({ messageId: message.id });
    }, msDuration);
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