const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  userId: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  discriminator: {
    type: DataTypes.STRING,
  },
  avatar: {
    type: DataTypes.STRING,
  },
  guilds: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('guilds');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('guilds', JSON.stringify(value));
    }
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'en',
  },
  notifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  theme: {
    type: DataTypes.STRING,
    defaultValue: 'light',
  },
  commandsUsed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  messagesSent: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastActive: {
    type: DataTypes.DATE,
  }
}, {
  timestamps: true,
});

module.exports = User; 