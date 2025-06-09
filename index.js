// index.js
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const express = require('express');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});

// Setup command collection
client.commands = new Collection();

const fs = require('fs');
const path = require('path');

const commandsPath = path.join(__dirname, 'commands');

fs.readdirSync(commandsPath).forEach(category => {
  const categoryPath = path.join(commandsPath, category);
  if (fs.lstatSync(categoryPath).isDirectory()) {
    const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(path.join(categoryPath, file));
      if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
      }
    }
  }
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
