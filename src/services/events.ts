import axios from 'axios';
import * as cheerio from 'cheerio';
import { Client, GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel, ForumChannel } from 'discord.js';
import { config } from '../config/config';
import { parseDate, formatDate } from '../utils/date';

export class EventsService {
  constructor(private client: Client) {}

  async updateEvents(guildId: string) {
    const guild = await this.client.guilds.fetch(guildId);
    const forum = await guild.channels.fetch(config.discord.forumChannelId);

    if (!forum?.isThreadOnly() || forum.type !== 15) {
      throw new Error('Canal de fórum inválido.');
    }

    const res = await axios.get(config.trove.eventsUrl);
    const $ = cheerio.load(res.data);

    const events = $('.row .col-xl-6').toArray();
    const today = new Date();

    for (const element of events) {
      const eventBox = $(element);
      const name = eventBox.find('div[style*="font-size: 19px"]').text().trim();
      const dateText = eventBox.find('div[style*="color: gold"]').text().trim();
      const [startRaw, endRaw] = dateText.split(' - ');
      if (!startRaw || !endRaw) continue;
      
      const start = parseDate(startRaw.trim());
      const end = parseDate(endRaw.trim());
      if (!start || !end) continue;

      const year = start.getFullYear();
      const fullName = `${name} ${year}`;

      if (today >= start && today <= end) {
        const description = eventBox.find('div[style*="font-size:13px"]').text().trim();
        const href = eventBox.find('a.nav-link').attr('href') || '';
        const fullLink = `https://trovesaurus.com${href}`;

        const bgStyle = eventBox.find('div[style*="background-image"]').attr('style');
        const bgImageMatch = bgStyle?.match(/url\(['"]?(.*?)['"]?\)/);
        const bgImage = bgImageMatch ? bgImageMatch[1] : null;

        const existing = await guild.scheduledEvents.fetch();
        const alreadyExists = existing.find(e => e.name === fullName);
        if (alreadyExists) {
          console.log(`⏩ Evento "${fullName}" já existe`);
          continue;
        }

        const scheduledStartTime = start < today ? new Date(Date.now() + 5 * 60 * 1000) : start;

        console.log(`📅 Criando evento: ${fullName} (${start.toDateString()} - ${end.toDateString()})`);

        const scheduledEvent = await guild.scheduledEvents.create({
          name: fullName,
          scheduledStartTime: scheduledStartTime.toISOString(),
          scheduledEndTime: end.toISOString(),
          privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
          entityType: GuildScheduledEventEntityType.External,
          description: `${description}\n\nMais detalhes: ${fullLink}`,
          entityMetadata: {
            location: 'https://trovesaurus.com',
          },
        });

        if (forum instanceof ForumChannel) {
          await forum.threads.create({
            name: fullName,
            message: {
              content: `📢 **${fullName}**\n${description}

🗓 **Data:** ${formatDate(start)} até ${formatDate(end)}

🔗 [Ver evento no site](${fullLink})${
                scheduledEvent.url ? `\n📆 [Ver evento no Discord](${scheduledEvent.url})` : ''
              }${bgImage ? `\n\n![imagem](${bgImage})` : ''}`,
            },
          });

          console.log(`📬 Post criado no canal de fórum: ${fullName}`);
        }
      }
    }
  }
} 