import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DISCORD_TOKEN', 'GUILD_ID', 'FORUM_CHANNEL_ID'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  discord: {
    token: process.env.DISCORD_TOKEN!,
    guildId: process.env.GUILD_ID!,
    forumChannelId: process.env.FORUM_CHANNEL_ID!,
  },
  trove: {
    eventsUrl: 'https://trovesaurus.com/events/2025',
  },
}; 