import React from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../contexts/SettingsContext';
import { useSound } from '../hooks/useSound';
import ToggleSwitch from './ToggleSwitch';
import { Settings, AIPersonality } from '../types';

const personalityOptions: { id: AIPersonality, name: string, icon: string }[] = [
    { id: 'friendly', name: 'Friendly Coach', icon: '😄' },
    { id: 'superhero', name: 'Superhero', icon: '🦸' },
    { id: 'robot', name: 'Funny Robot', icon: '🤖' },
];

const SettingsScreen: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { playSound } = useSound();

  const handleSettingChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    playSound('click');
    updateSettings({ [key]: value });
  };

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in text-[var(--color-text-primary)]">
      <div className="pb-5 border-b border-[var(--color-border)]">
        <h2 className="text-4xl font-black text-[var(--color-text-strong)]">Settings</h2>
        <p className="text-[var(--color-text-secondary)] mt-2 text-lg">Customize your Dr. Sparkle experience.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--color-card-bg)] p-6 md:p-8 rounded-2xl shadow-lg border border-[var(--color-border)] space-y-8"
      >
        {/* AI Personality Section */}
        <section>
          <h3 className="text-2xl font-bold text-[var(--color-text-strong)] mb-4">AI Personality</h3>
          <p className="text-sm text-[var(--color-text-secondary)] -mt-3 mb-4">Choose how Dr. Sparkle talks to you!</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {personalityOptions.map(p => (
              <motion.button
                key={p.id}
                onClick={() => handleSettingChange('aiPersonality', p.id)}
                className={`p-4 rounded-xl text-center border-2 transition-all duration-200 ${
                  settings.aiPersonality === p.id
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-lg'
                    : 'bg-[var(--color-bg-base)] border-transparent hover:border-[var(--color-border-focus)]'
                }`}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-4xl mb-2">{p.icon}</div>
                <div className="font-bold text-md text-[var(--color-text-strong)]">{p.name}</div>
              </motion.button>
            ))}
          </div>
        </section>

        <div className="border-t border-[var(--color-border)]" />

        {/* Appearance Section */}
        <section>
          <h3 className="text-2xl font-bold text-[var(--color-text-strong)] mb-4">Appearance</h3>
          <div className="space-y-6">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 bg-[var(--color-bg-base)] rounded-xl">
              <label className="font-semibold">Dark Mode</label>
              <ToggleSwitch
                isOn={settings.theme === 'dark'}
                onToggle={() => handleSettingChange('theme', settings.theme === 'dark' ? 'light' : 'dark')}
                label="Toggle Dark Mode"
              />
            </div>
            {/* Font Size */}
            <div>
              <label className="block font-semibold mb-3">Font Size</label>
              <div className="flex items-center gap-2 rounded-xl bg-[var(--color-bg-base)] p-2">
                {(['sm', 'md', 'lg'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => handleSettingChange('fontSize', size)}
                    className={`flex-1 py-2 px-4 rounded-lg font-bold transition-colors duration-200 ${
                      settings.fontSize === size
                        ? 'bg-[var(--color-primary)] text-white shadow-md'
                        : 'hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {size === 'sm' && 'Small'}
                    {size === 'md' && 'Medium'}
                    {size === 'lg' && 'Large'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="border-t border-[var(--color-border)]" />

        {/* Preferences Section */}
        <section>
          <h3 className="text-2xl font-bold text-[var(--color-text-strong)] mb-4">Preferences</h3>
          <div className="space-y-6">
            {/* Language Selection */}
            <div>
              <label htmlFor="language" className="block font-semibold mb-2">Language</label>
              <select
                id="language"
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value as Settings['language'])}
                className="w-full max-w-xs p-3 bg-[var(--color-bg-base)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="en">English</option>
                <option value="es" disabled>Español (Coming Soon)</option>
                <option value="fr" disabled>Français (Coming Soon)</option>
              </select>
              <p className="text-xs text-[var(--color-text-secondary)] mt-2">More languages will be available in the future!</p>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default SettingsScreen;