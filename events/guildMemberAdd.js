const welcome = require('../commands/welcome/welcome');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    await welcome.welcomeEvent(member, client);
  },
};
