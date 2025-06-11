const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
const mongoose = require('mongoose');

const helpConfigSchema = new mongoose.Schema({
  guildId: String,
  language: { type: String, default: 'en' },
});

const HelpConfig = mongoose.model('HelpConfig', helpConfigSchema);

const categories = {
  moderation: {
    name: 'Moderation',
    emoji: '🛠️',
    commands: [
      { name: 'ban', description: 'Ban a member with detailed reason', usage: '/ban <user> (via modal)', permissions: 'Ban Members' },
      { name: 'kick', description: 'Kick a member from the server', usage: '/kick <user>', permissions: 'Kick Members' },
      { name: 'mute', description: 'Mute a member for a duration', usage: '/mute <user> <duration>', permissions: 'Moderate Members' },
      { name: 'unmute', description: 'Unmute a member', usage: '/unmute <user>', permissions: 'Moderate Members' },
      { name: 'warn', description: 'Warn a member and log it', usage: '/warn <user> <reason>', permissions: 'Moderate Members' },
      { name: 'clear', description: 'Clear messages in a channel', usage: '/clear <amount> [filter]', permissions: 'Manage Messages' },
      { name: 'lock', description: 'Lock a channel', usage: '/lock <channel>', permissions: 'Manage Channels' },
      { name: 'unlock', description: 'Unlock a channel', usage: '/unlock <channel>', permissions: 'Manage Channels' },
      { name: 'slowmode', description: 'Set slowmode for a channel', usage: '/slowmode <channel> <seconds>', permissions: 'Manage Channels' },
      { name: 'purgebot', description: 'Purge bot messages', usage: '/purgebot <amount>', permissions: 'Manage Messages' },
      { name: 'antispam', description: 'Toggle anti-spam system', usage: '/antispam <on/off>', permissions: 'Manage Server' },
      { name: 'antilink', description: 'Toggle anti-link system', usage: '/antilink <on/off>', permissions: 'Manage Server' },
      { name: 'modlog', description: 'Set moderation log channel', usage: '/modlog <channel>', permissions: 'Manage Server' },
      { name: 'userinfo', description: 'Show user information', usage: '/userinfo <user>', permissions: 'None' },
      { name: 'serverinfo', description: 'Show server information', usage: '/serverinfo', permissions: 'None' },
    ],
  },
  welcome: {
    name: 'Welcome & Notifications',
    emoji: '👋',
    commands: [
      { name: 'welcome', description: 'Configure welcome message', usage: '/welcome <channel> <message> <image>', permissions: 'Manage Server' },
      { name: 'leave', description: 'Configure leave message', usage: '/leave <channel> <message>', permissions: 'Manage Server' },
      { name: 'setwelcomechannel', description: 'Set welcome channel', usage: '/setwelcomechannel <channel>', permissions: 'Manage Server' },
      { name: 'setwelcomemessage', description: 'Set custom welcome message', usage: '/setwelcomemessage <message>', permissions: 'Manage Server' },
      { name: 'autorole', description: 'Set auto-role for new members', usage: '/autorole <role>', permissions: 'Manage Roles' },
    ],
  },
  role: {
    name: 'Role Management',
    emoji: '🎭',
    commands: [
      { name: 'addrole', description: 'Add a role to a member', usage: '/addrole <user> <role>', permissions: 'Manage Roles' },
      { name: 'removerole', description: 'Remove a role from a member', usage: '/removerole <user> <role>', permissions: 'Manage Roles' },
      { name: 'reactionrole', description: 'Create reaction role', usage: '/reactionrole <message> <emoji> <role>', permissions: 'Manage Roles' },
      { name: 'rolemenu', description: 'Create role select menu', usage: '/rolemenu <roles>', permissions: 'Manage Roles' },
      { name: 'autoroleactivity', description: 'Auto-role based on activity', usage: '/autoroleactivity <role> <threshold>', permissions: 'Manage Roles' },
    ],
  },
  fun: {
    name: 'Fun',
    emoji: '🎉',
    commands: [
      { name: 'coinflip', description: 'Flip a coin', usage: '/coinflip', permissions: 'None' },
      { name: 'roll', description: 'Roll a dice', usage: '/roll [sides]', permissions: 'None' },
      { name: 'meme', description: 'Get a random meme', usage: '/meme', permissions: 'None' },
      { name: '8ball', description: 'Ask the magic 8-ball', usage: '/8ball <question>', permissions: 'None' },
      { name: 'trivia', description: 'Play a trivia game', usage: '/trivia [category]', permissions: 'None' },
      { name: 'poll', description: 'Create a poll', usage: '/poll <question> <options>', permissions: 'None' },
      { name: 'quote', description: 'Get a random quote', usage: '/quote', permissions: 'None' },
      { name: 'joke', description: 'Get a random joke', usage: '/joke', permissions: 'None' },
      { name: 'rps', description: 'Play rock-paper-scissors', usage: '/rps <choice>', permissions: 'None' },
      { name: 'random', description: 'Generate a random number', usage: '/random <min> <max>', permissions: 'None' },
    ],
  },
  music: {
    name: 'Music',
    emoji: '🎵',
    commands: [
      { name: 'play', description: 'Play music from YouTube/Spotify', usage: '/play <url/query>', permissions: 'None' },
      { name: 'skip', description: 'Skip current song', usage: '/skip', permissions: 'None' },
      { name: 'stop', description: 'Stop music playback', usage: '/stop', permissions: 'None' },
      { name: 'queue', description: 'Show music queue', usage: '/queue', permissions: 'None' },
      { name: 'volume', description: 'Adjust volume', usage: '/volume <percentage>', permissions: 'None' },
    ],
  },
  economy: {
    name: 'Economy',
    emoji: '💰',
    commands: [
      { name: 'balance', description: 'Check your balance', usage: '/balance [user]', permissions: 'None' },
      { name: 'daily', description: 'Claim daily reward', usage: '/daily', permissions: 'None' },
      { name: 'shop', description: 'View/buy items from shop', usage: '/shop', permissions: 'None' },
      { name: 'leaderboard', description: 'Show economy leaderboard', usage: '/leaderboard', permissions: 'None' },
      { name: 'transfer', description: 'Transfer currency to another user', usage: '/transfer <user> <amount>', permissions: 'None' },
    ],
  },
  advanced: {
    name: 'Advanced',
    emoji: '⚙️',
    commands: [
      { name: 'ticket', description: 'Create a support ticket', usage: '/ticket', permissions: 'None' },
      { name: 'automod', description: 'Configure auto-moderation', usage: '/automod <settings>', permissions: 'Manage Server' },
      { name: 'customcommand', description: 'Create custom command', usage: '/customcommand <name> <response>', permissions: 'Manage Server' },
      { name: 'level', description: 'Check your level', usage: '/level [user]', permissions: 'None' },
      { name: 'schedule', description: 'Schedule an event', usage: '/schedule <event> <time>', permissions: 'Manage Events' },
      { name: 'appeal', description: 'Submit ban appeal', usage: '/appeal <reason>', permissions: 'None' },
      { name: 'levelprestige', description: 'Prestige your level', usage: '/levelprestige', permissions: 'None' },
      { name: 'customscript', description: 'Create advanced custom command', usage: '/customscript <name> <script>', permissions: 'Manage Server' },
      { name: 'ticketarchive', description: 'Archive closed tickets', usage: '/ticketarchive', permissions: 'Manage Server' },
      { name: 'xpconfig', description: 'Configure XP system', usage: '/xpconfig <settings>', permissions: 'Manage Server' },
    ],
  },
  server: {
    name: 'Server Management',
    emoji: '🏰',
    commands: [
      { name: 'autoclean', description: 'Auto-clean inactive channels', usage: '/autoclean <settings>', permissions: 'Manage Channels' },
      { name: 'channelstats', description: 'Show channel activity stats', usage: '/channelstats <channel>', permissions: 'View Audit Log' },
      { name: 'massrole', description: 'Assign/remove roles in bulk', usage: '/massrole <action> <role> <users>', permissions: 'Manage Roles' },
      { name: 'backup', description: 'Backup server configuration', usage: '/backup', permissions: 'Administrator' },
      { name: 'verify', description: 'Set up member verification', usage: '/verify <settings>', permissions: 'Manage Server' },
      { name: 'clonechannel', description: 'Clone a channel', usage: '/clonechannel <channel>', permissions: 'Manage Channels' },
      { name: 'rolesync', description: 'Sync roles across servers', usage: '/rolesync <server>', permissions: 'Administrator' },
      { name: 'lockdown', description: 'Lockdown the server', usage: '/lockdown', permissions: 'Administrator' },
      { name: 'setstatus', description: 'Set bot status', usage: '/setstatus <status>', permissions: 'Administrator' },
      { name: 'memberanalytics', description: 'Analyze member activity', usage: '/memberanalytics', permissions: 'View Audit Log' },
      { name: 'dynamicvc', description: 'Create dynamic voice channels', usage: '/dynamicvc <settings>', permissions: 'Manage Channels' },
      { name: 'category', description: 'Manage channel categories', usage: '/category <action> <name>', permissions: 'Manage Channels' },
      { name: 'template', description: 'Create server template', usage: '/template <name>', permissions: 'Administrator' },
      { name: 'cmdstats', description: 'Show command usage stats', usage: '/cmdstats', permissions: 'View Audit Log' },
    ],
  },
  community: {
    name: 'Community Engagement',
    emoji: '🤝',
    commands: [
      { name: 'giveaway', description: 'Create a giveaway', usage: '/giveaway <prize> <winners> <duration>', permissions: 'Manage Server' },
      { name: 'suggest', description: 'Submit a suggestion', usage: '/suggest <suggestion>', permissions: 'None' },
      { name: 'starboard', description: 'Configure starboard', usage: '/starboard <channel> <threshold>', permissions: 'Manage Server' },
      { name: 'eventpoints', description: 'Award event points', usage: '/eventpoints <user> <points>', permissions: 'Manage Events' },
      { name: 'confess', description: 'Send anonymous confession', usage: '/confess <message>', permissions: 'None' },
      { name: 'eventleaderboard', description: 'Show event leaderboard', usage: '/eventleaderboard', permissions: 'None' },
      { name: 'pollreact', description: 'Create poll with reactions', usage: '/pollreact <question> <options>', permissions: 'None' },
      { name: 'quiz', description: 'Create a quiz', usage: '/quiz <question> <options> <correct> <duration>', permissions: 'Manage Events' },
      { name: 'birthday', description: 'Set your birthday', usage: '/birthday <date>', permissions: 'None' },
      { name: 'reactcontest', description: 'Create reaction contest', usage: '/reactcontest <message> <prize>', permissions: 'Manage Events' },
      { name: 'profile', description: 'Customize your profile', usage: '/profile <settings>', permissions: 'None' },
      { name: 'voicerewards', description: 'Reward voice activity', usage: '/voicerewards <settings>', permissions: 'Manage Server' },
      { name: 'goal', description: 'Set community goal', usage: '/goal <target> <reward>', permissions: 'Manage Server' },
    ],
  },
  utilities: {
    name: 'Utilities',
    emoji: '🛠️',
    commands: [
      { name: 'remind', description: 'Set a reminder', usage: '/remind <message> <time>', permissions: 'None' },
      { name: 'translate', description: 'Translate text', usage: '/translate <text> <language>', permissions: 'None' },
      { name: 'weather', description: 'Check weather', usage: '/weather <location>', permissions: 'None' },
      { name: 'calc', description: 'Perform calculations', usage: '/calc <expression>', permissions: 'None' },
      { name: 'embed', description: 'Create custom embed', usage: '/embed <title> <description>', permissions: 'Manage Messages' },
      { name: 'timezone', description: 'Convert time zones', usage: '/timezone <from> <to>', permissions: 'None' },
      { name: 'convert', description: 'Convert file formats', usage: '/convert <file> <format>', permissions: 'None' },
      { name: 'qrcode', description: 'Generate QR code', usage: '/qrcode <content>', permissions: 'None' },
      { name: 'password', description: 'Generate random password', usage: '/password <length>', permissions: 'None' },
      { name: 'format', description: 'Format text', usage: '/format <text> <style>', permissions: 'None' },
      { name: 'define', description: 'Look up word definition', usage: '/define <word>', permissions: 'None' },
      { name: 'note', description: 'Save a note', usage: '/note <content>', permissions: 'None' },
      { name: 'msgschedule', description: 'Schedule recurring messages', usage: '/msgschedule <channel> <message> <interval>', permissions: 'Manage Channels' },
    ],
  },
  security: {
    name: 'Security & Automation',
    emoji: '🔒',
    commands: [
      { name: 'autoban', description: 'Auto-ban based on keywords', usage: '/autoban <keywords>', permissions: 'Manage Server' },
      { name: 'webhook', description: 'Manage webhooks', usage: '/webhook <action> <name>', permissions: 'Manage Webhooks' },
      { name: 'update', description: 'Auto-update bot', usage: '/update', permissions: 'Administrator' },
      { name: 'autopin', description: 'Auto-pin important messages', usage: '/autopin <settings>', permissions: 'Manage Messages' },
      { name: 'rolelock', description: 'Lock role permissions', usage: '/rolelock <role>', permissions: 'Manage Roles' },
      { name: 'health', description: 'Check server health', usage: '/health', permissions: 'View Audit Log' },
      { name: 'chat', description: 'Talk to AI chatbot', usage: '/chat <message>', permissions: 'None' },
      { name: 'antiraid', description: 'Enable anti-raid protection', usage: '/antiraid <settings>', permissions: 'Administrator' },
      { name: 'botcheck', description: 'Detect fake bots', usage: '/botcheck', permissions: 'Manage Server' },
      { name: 'iplogger', description: 'Block IP logger links', usage: '/iplogger <on/off>', permissions: 'Manage Server' },
      { name: 'agefilter', description: 'Filter new accounts', usage: '/agefilter <days>', permissions: 'Manage Server' },
      { name: 'auditlog', description: 'View audit logs', usage: '/auditlog [filter]', permissions: 'View Audit Log' },
      { name: 'setbanner', description: 'Set server banner', usage: '/setbanner <image>', permissions: 'Administrator' },
      { name: 'rolecolor', description: 'Change role color', usage: '/rolecolor <role> <color>', permissions: 'Manage Roles' },
      { name: 'vclog', description: 'Log voice channel activity', usage: '/vclog <channel>', permissions: 'Manage Server' },
    ],
  },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show command list or details for a specific command')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('Get details for a specific command')
        .setRequired(false)),
  cooldown: 3,
  async execute(interaction) {
    const commandName = interaction.options.getString('command');

    if (commandName) {
      let found = false;
      for (const category of Object.values(categories)) {
        const command = category.commands.find(cmd => cmd.name === commandName.toLowerCase());
        if (command) {
          found = true;
          const embed = new EmbedBuilder()
            .setTitle(`${category.emoji} ${command.name}`)
            .setDescription(command.description)
            .addFields(
              { name: 'Usage', value: `\`${command.usage}\`` },
              { name: 'Permissions', value: command.permissions }
            )
            .setColor('#0099ff')
            .setFooter({ text: `Category: ${category.name}` });
          return interaction.reply({ embeds: [embed], ephemeral: true });
        }
      }
      if (!found) {
        return interaction.reply({ content: `Command \`${commandName}\` not found!`, ephemeral: true });
      }
    }

    const config = await HelpConfig.findOne({ guildId: interaction.guild.id }) || { language: 'en' };

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_category')
      .setPlaceholder('Select a category')
      .addOptions(
        Object.entries(categories).map(([key, cat]) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(cat.name)
            .setValue(key)
            .setEmoji(cat.emoji)
        )
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = new EmbedBuilder()
      .setTitle('📚 Bot Command Help')
      .setDescription('Select a category to view commands or use `/help <command>` for details.')
      .setColor('#0099ff')
      .setFooter({ text: `Language: ${config.language.toUpperCase()} | Total Commands: ${Object.values(categories).reduce((sum, cat) => sum + cat.commands.length, 0)}` });

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },

  async displayCategory(interaction, categoryKey) {
    const category = categories[categoryKey];
    if (!category) return interaction.update({ content: 'Invalid category!', components: [], ephemeral: true });

    const commandsPerPage = 10;
    const pages = Math.ceil(category.commands.length / commandsPerPage);
    let page = 1;

    const embed = new EmbedBuilder()
      .setTitle(`${category.emoji} ${category.name} Commands`)
      .setColor('#0099ff')
      .setFooter({ text: `Page ${page}/${pages} | Total: ${category.commands.length} commands` });

    const updateEmbed = () => {
      const start = (page - 1) * commandsPerPage;
      const end = start + commandsPerPage;
      const commandsToShow = category.commands.slice(start, end);

      embed.setDescription(commandsToShow.map(cmd => `**${cmd.name}**\n${cmd.description}\n\`${cmd.usage}\`\nPermissions: ${cmd.permissions}`).join('\n\n'));
    };

    updateEmbed();

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_category')
      .setPlaceholder('Select a category')
      .addOptions(
        Object.entries(categories).map(([key, cat]) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(cat.name)
            .setValue(key)
            .setEmoji(cat.emoji)
            .setDefault(key === categoryKey)
        )
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.update({ embeds: [embed], components: [row], ephemeral: true });
  },
};
