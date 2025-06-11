const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Command = sequelize.define('Command', {
  name: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  usage: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  aliases: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('aliases');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('aliases', JSON.stringify(value));
    }
  },
  userPermissions: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('userPermissions');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('userPermissions', JSON.stringify(value));
    }
  },
  botPermissions: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('botPermissions');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('botPermissions', JSON.stringify(value));
    }
  },
  cooldown: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  uses: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastUsed: {
    type: DataTypes.DATE,
  }
}, {
  timestamps: true,
});

module.exports = Command; 
