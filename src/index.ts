import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import { config } from './config/config';
import { EventsService } from './services/events';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const eventsService = new EventsService(client);

client.once('ready', async () => {
  console.log(`🤖 Bot online como ${client.user?.tag}`);

  // Registra o comando slash
  const rest = new REST({ version: '10' }).setToken(config.discord.token);
  await rest.put(Routes.applicationGuildCommands(client.user!.id, config.discord.guildId), {
    body: [
      {
        name: 'update_events',
        description: 'Atualiza os eventos do Trove para o Discord',
      },
    ],
  });

  console.log('📦 Comando /update_events registrado');
});

// Escuta comandos
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'update_events') {
    await interaction.reply('🔄 Atualizando eventos...');
    try {
      await eventsService.updateEvents(interaction.guildId!);
      await interaction.editReply('✅ Eventos atualizados com sucesso!');
    } catch (err) {
      console.error(err);
      await interaction.editReply('❌ Ocorreu um erro ao atualizar os eventos.');
    }
  }
});

client.login(config.discord.token);
