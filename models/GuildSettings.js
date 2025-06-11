const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GuildSettings = sequelize.define('GuildSettings', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  prefix: {
    type: DataTypes.STRING,
    defaultValue: '!',
  },
  welcomeEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  welcomeChannelId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  welcomeMessage: {
    type: DataTypes.TEXT,
  },
  welcomeImage: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  moderationEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  logChannelId: {
    type: DataTypes.STRING,
  },
  autoModEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  maxMentions: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  maxEmojis: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  maxCaps: {
    type: DataTypes.INTEGER,
    defaultValue: 70,
  },
  musicEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  defaultVolume: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
  },
  maxQueueSize: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  enabledCommands: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('enabledCommands');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('enabledCommands', JSON.stringify(value));
    }
  },
  disabledCommands: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('disabledCommands');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('disabledCommands', JSON.stringify(value));
    }
  }
}, {
  timestamps: true,
});

module.exports = GuildSettings; 