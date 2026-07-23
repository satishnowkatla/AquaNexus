import { theme } from './theme';

export interface ModuleConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  lightColor: string;
}

export const MODULES: ModuleConfig[] = [
  {
    id: 'aquadoc',
    title: 'AquaDoc',
    description: 'AI disease detection from photos & symptoms',
    icon: '📷',
    color: theme.colors.red,
    lightColor: theme.colors.lightRed,
  },
  {
    id: 'aquavoice',
    title: 'AquaVoice',
    description: 'Voice-based expense & income tracking',
    icon: '🎙️',
    color: theme.colors.purple,
    lightColor: theme.colors.lightPurple,
  },
  {
    id: 'aquaadvisor',
    title: 'AquaAdvisor',
    description: 'AI chatbot for farming advice',
    icon: '🤖',
    color: theme.colors.green,
    lightColor: theme.colors.lightGreen,
  },
  {
    id: 'aquafeed',
    title: 'AquaFeed',
    description: 'Feed calculator & cost tracker',
    icon: '📊',
    color: theme.colors.amber,
    lightColor: theme.colors.lightAmber,
  },
  {
    id: 'aquaconnect',
    title: 'AquaConnect',
    description: 'Farmer network & resource hub',
    icon: '🤝',
    color: theme.colors.blue,
    lightColor: theme.colors.lightBlue,
  },
];

export const MODULE_COLOR_MAP: Record<string, string> = {
  aquadoc: theme.colors.red,
  aquavoice: theme.colors.purple,
  aquafeed: theme.colors.amber,
  aquaconnect: theme.colors.blue,
  aquaadvisor: theme.colors.green,
};
