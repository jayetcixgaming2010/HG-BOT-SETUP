const { StringSelectMenuInteraction } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      // Cooldown check
      const now = Date.now();
      const cooldownAmount = (command.cooldown || 3) * 1000;
      const userCooldown = client.cooldowns.get(`${interaction.user.id}_${interaction.commandName}`) || 0;
      if (userCooldown && now < userCooldown) {
        const timeLeft = (userCooldown - now) / 1000;
        return interaction.reply({ content: `Please wait ${timeLeft.toFixed(1)} seconds before using this command again.`, ephemeral: true });
      }
      client.cooldowns.set(`${interaction.user.id}_${interaction.commandName}`, now + cooldownAmount);

      // Track command usage
      if (command.trackUsage) {
        await command.trackUsage(interaction.guild.id, interaction.commandName);
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Error executing command!', ephemeral: true });
      }
    } else if (interaction.isButton()) {
      if (interaction.customId.startsWith('quiz_')) {
        const quizId = interaction.message.id;
        const answer = parseInt(interaction.customId.split('_')[1]);
        const Quiz = require('mongoose').model('Quiz');
        const quiz = await Quiz.findOne({ messageId: quizId });

        if (!quiz) {
          return interaction.reply({ content: 'Quiz no longer active!', ephemeral: true });
        }

        if (quiz.participants.find(p => p.userId === interaction.user.id)) {
          return interaction.reply({ content: 'You already answered!', ephemeral: true });
        }

        quiz.participants.push({ userId: interaction.user.id, answer });
        await quiz.save();

        await interaction.reply({ content: 'Answer submitted!', ephemeral: true });
      }
    } else if (interaction instanceof StringSelectMenuInteraction) {
      if (interaction.customId === 'help_category') {
        const category = interaction.values[0];
        const helpCommand = client.commands.get('help');
        await helpCommand.displayCategory(interaction, category);
      }
    }
  },
};