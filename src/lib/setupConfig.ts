// Setup configuration management
const SETUP_CONFIG_KEY = 'hookdrop_supabase_config';
const SETUP_COMPLETE_KEY = 'hookdrop_setup_complete';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const saveSupabaseConfig = (config: SupabaseConfig): void => {
  localStorage.setItem(SETUP_CONFIG_KEY, JSON.stringify(config));
  localStorage.setItem(SETUP_COMPLETE_KEY, 'true');
};

export const getSupabaseConfig = (): SupabaseConfig | null => {
  const stored = localStorage.getItem(SETUP_CONFIG_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const isSetupComplete = (): boolean => {
  return localStorage.getItem(SETUP_COMPLETE_KEY) === 'true';
};

export const clearSetupConfig = (): void => {
  localStorage.removeItem(SETUP_CONFIG_KEY);
  localStorage.removeItem(SETUP_COMPLETE_KEY);
};
