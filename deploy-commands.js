const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [];
const fs = require('fs');
const path = require('path');

const commandsPath = path.join(__dirname, 'commands');

fs.readdirSync(commandsPath).forEach(category => {
  const categoryPath = path.join(commandsPath, category);
  if (fs.lstatSync(categoryPath).isDirectory()) {
    const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(path.join(categoryPath, file));
      if (command.data) {
        commands.push(command.data.toJSON());
      }
    }
  }
});

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
