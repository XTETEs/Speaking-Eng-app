
import React from 'react';
import { UserSettings } from '../types';
import IconButton from './IconButton';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSettingsChange: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  availableVoices: SpeechSynthesisVoice[];
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange, availableVoices }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-sky-400">Settings</h2>
          <IconButton 
            icon={<XMarkIcon className="h-6 w-6" />}
            onClick={onClose}
            label="Close settings"
            variant="ghost"
            size="md"
          />
        </div>

        <div className="space-y-6">
          {/* AI Voice Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-700 rounded-md">
            <label htmlFor="aiVoiceEnabled" className="text-slate-200 text-sm">Enable AI Voice Output</label>
            <button
              id="aiVoiceEnabled"
              role="switch"
              aria-checked={settings.aiVoiceEnabled}
              onClick={() => onSettingsChange('aiVoiceEnabled', !settings.aiVoiceEnabled)}
              className={`${settings.aiVoiceEnabled ? 'bg-sky-500' : 'bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
            >
              <span className={`${settings.aiVoiceEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
            </button>
          </div>

          {/* Voice Selection Dropdown */}
          {settings.aiVoiceEnabled && availableVoices.length > 0 && (
            <div className="p-3 bg-slate-700 rounded-md">
              <label htmlFor="voiceSelect" className="block text-sm font-medium text-slate-200 mb-1">Select AI Voice</label>
              <select
                id="voiceSelect"
                value={settings.selectedVoiceURI || ''}
                onChange={(e) => onSettingsChange('selectedVoiceURI', e.target.value || null)}
                className="w-full p-2 bg-slate-600 text-slate-100 border border-slate-500 rounded-md focus:ring-sky-500 focus:border-sky-500 text-sm"
              >
                <option value="">Browser Default</option>
                {availableVoices.filter(v => v.lang.startsWith('en')).map(voice => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
          )}
           {settings.aiVoiceEnabled && availableVoices.length === 0 && (
             <p className="text-xs text-slate-400 p-3 bg-slate-700 rounded-md">No specific AI voices found in your browser. Default voice will be used.</p>
           )}


          {/* Show Feedback Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-700 rounded-md">
            <label htmlFor="showFeedback" className="text-slate-200 text-sm">Show AI Feedback</label>
            <button
              id="showFeedback"
              role="switch"
              aria-checked={settings.showFeedback}
              onClick={() => onSettingsChange('showFeedback', !settings.showFeedback)}
              className={`${settings.showFeedback ? 'bg-sky-500' : 'bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
            >
              <span className={`${settings.showFeedback ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
            <button
                onClick={onClose}
                className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-sm font-medium transition-colors"
            >
                Done
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
