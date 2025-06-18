
import React, { useState, useEffect } from 'react';
import { Scenario, CEFRLevel } from '../types';
import { SCENARIOS_BY_LEVEL, CEFR_LEVELS_ORDERED } from '../constants';

interface ScenarioSelectorProps {
  onScenarioSelect: (scenario: Scenario) => void;
}

const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const ChevronUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
  </svg>
);

type SectionKey = CEFRLevel; 
const ALL_SECTION_KEYS: SectionKey[] = [...CEFR_LEVELS_ORDERED];
const CUSTOM_TOPIC_SUFFIX = "-custom-topic";

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ onScenarioSelect }) => {
  const [activeFilter, setActiveFilter] = useState<SectionKey | 'all'>('all');
  
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>(() => 
    ALL_SECTION_KEYS.reduce((acc, key) => {
      acc[key] = false; // All sections start collapsed
      return acc;
    }, {} as Record<SectionKey, boolean>)
  );

  const [selectedScenarioIdPerSection, setSelectedScenarioIdPerSection] = useState<Record<SectionKey, string | undefined>>(() =>
    ALL_SECTION_KEYS.reduce((acc, key) => {
      acc[key] = undefined;
      return acc;
    }, {} as Record<SectionKey, string | undefined>)
  );
  
  const [customTopicInput, setCustomTopicInput] = useState('');

  // Removed useEffect that auto-expanded sections based on activeFilter.
  // Expansion is now purely manual via toggleSection.
  
  const toggleSection = (key: SectionKey) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDropdownChange = (sectionKey: SectionKey, scenarioId: string) => {
    setSelectedScenarioIdPerSection(prev => ({ ...prev, [sectionKey]: scenarioId }));
    if (!scenarioId.endsWith(CUSTOM_TOPIC_SUFFIX)) {
      setCustomTopicInput(''); 
    }
  };
  
  const handleStartConversation = (sectionKey: SectionKey) => {
    const scenarioId = selectedScenarioIdPerSection[sectionKey];
    if (!scenarioId) return;

    let scenarioToStart: Scenario | undefined;
    const scenariosForSection = SCENARIOS_BY_LEVEL[sectionKey];
    const selectedScenarioTemplate = scenariosForSection.find(s => s.id === scenarioId);

    if (selectedScenarioTemplate) {
      if (selectedScenarioTemplate.id.endsWith(CUSTOM_TOPIC_SUFFIX)) {
        if (!customTopicInput.trim()) {
          alert("Please enter your custom topic.");
          return;
        }
        scenarioToStart = {
          ...selectedScenarioTemplate, 
          id: `custom-${selectedScenarioTemplate.cefrLevel.split(" ")[0].toLowerCase()}-${Date.now()}`, 
          title: `Custom Topic (${selectedScenarioTemplate.cefrLevel}): ${customTopicInput.trim()}`,
          description: `A user-defined conversation about: ${customTopicInput.trim()} (Level: ${selectedScenarioTemplate.cefrLevel})`,
          initialSystemMessage: `You are a versatile AI chat partner. The user, an English learner at the ${selectedScenarioTemplate.cefrLevel} level, wants to discuss: "${customTopicInput.trim()}". Your first task is to start the conversation. Greet them, and make a general opening remark like "Hello! What shall we talk about regarding '${customTopicInput.trim()}'?" or "Hi there! I'm ready to discuss '${customTopicInput.trim()}' at a ${selectedScenarioTemplate.cefrLevel} level. How would you like to begin?". Adapt your language complexity to be appropriate for their ${selectedScenarioTemplate.cefrLevel} level. After your opening, wait for the user to respond.`,
          sampleUserMessage: `Let's talk about ${customTopicInput.trim()}.`
        };
      } else {
        scenarioToStart = selectedScenarioTemplate;
      }
    }

    if (scenarioToStart) {
      onScenarioSelect(scenarioToStart);
    }
  };

  const sectionsToRender = activeFilter === 'all' ? ALL_SECTION_KEYS : (ALL_SECTION_KEYS.includes(activeFilter as SectionKey) ? [activeFilter as SectionKey] : []);
  const noScenariosForFilter = activeFilter !== 'all' && (!SCENARIOS_BY_LEVEL[activeFilter as CEFRLevel] || SCENARIOS_BY_LEVEL[activeFilter as CEFRLevel]?.length === 0);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-100 mb-4">Let’s have a little chat</h2>
      <p className="text-center text-slate-300 mb-8">Select a CEFR level to find scenarios, then pick one from the dropdown to start practicing. You can also choose "Custom Topic" within each level.</p>
      
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <button 
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeFilter === 'all' ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          aria-pressed={activeFilter === 'all'}
        >
          All Levels
        </button>
        {ALL_SECTION_KEYS.map(levelKey => (
          <button 
            key={levelKey}
            onClick={() => setActiveFilter(levelKey)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeFilter === levelKey ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            aria-pressed={activeFilter === levelKey}
          >
            {levelKey}
          </button>
        ))}
      </div>

      {noScenariosForFilter && (
         <p className="text-center text-slate-400 py-10">No scenarios currently available for the selected level '{activeFilter}'. Please try another level or 'All Levels'.</p>
      )}

      <div className="space-y-4">
        {sectionsToRender.map(sectionKey => {
          const scenariosList = SCENARIOS_BY_LEVEL[sectionKey];
          if (!scenariosList || scenariosList.length === 0) return null;

          const currentSelectedScenarioId = selectedScenarioIdPerSection[sectionKey];
          const currentSelectedScenarioDetails = scenariosList.find(s => s.id === currentSelectedScenarioId);
          const isCustomTopicSelected = currentSelectedScenarioDetails?.id.endsWith(CUSTOM_TOPIC_SUFFIX);

          return (
            <div key={sectionKey} className="bg-slate-800 rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => toggleSection(sectionKey)}
                className="w-full p-4 text-left bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                aria-expanded={expandedSections[sectionKey]}
                aria-controls={`section-content-${sectionKey}`}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-sky-400">
                    {`${sectionKey} Scenarios`}
                  </h3>
                  {expandedSections[sectionKey] ? <ChevronUpIcon className="h-6 w-6 text-slate-300" /> : <ChevronDownIcon className="h-6 w-6 text-slate-300" />}
                </div>
              </button>
              
              {expandedSections[sectionKey] && (
                <div id={`section-content-${sectionKey}`} className="p-4 space-y-4">
                  <select
                    value={currentSelectedScenarioId || ''}
                    onChange={(e) => handleDropdownChange(sectionKey, e.target.value)}
                    className="w-full p-3 bg-slate-600 text-slate-100 border border-slate-500 rounded-md focus:ring-sky-500 focus:border-sky-500 text-sm"
                    aria-label={`Select a scenario for ${sectionKey}`}
                  >
                    <option value="" disabled>-- Select a Scenario --</option>
                    {scenariosList.map(scenario => (
                      <option key={scenario.id} value={scenario.id}>{scenario.title} {scenario.id.endsWith(CUSTOM_TOPIC_SUFFIX) ? `(${sectionKey})` : ''}</option>
                    ))}
                  </select>

                  {currentSelectedScenarioDetails && (
                    <div className="p-4 bg-slate-700 rounded-md space-y-3">
                      <h4 className="text-lg font-semibold text-sky-300">{currentSelectedScenarioDetails.title}</h4>
                      <p className="text-sm text-slate-300 leading-relaxed">{currentSelectedScenarioDetails.description}</p>
                      {currentSelectedScenarioDetails.sampleUserMessage && !isCustomTopicSelected && (
                        <p className="text-xs text-slate-400 italic">Example: "{currentSelectedScenarioDetails.sampleUserMessage}"</p>
                      )}
                      
                      {isCustomTopicSelected && (
                        <div className="mt-3">
                          <label htmlFor={`customTopicInput-${sectionKey}`} className="block text-sm font-medium text-slate-200 mb-1">Enter your custom topic for {sectionKey}:</label>
                          <input
                            type="text"
                            id={`customTopicInput-${sectionKey}`}
                            value={customTopicInput}
                            onChange={(e) => setCustomTopicInput(e.target.value)}
                            placeholder="e.g., The future of AI, My favorite holiday"
                            className="w-full p-2 bg-slate-600 text-slate-100 border border-slate-500 rounded-md focus:ring-sky-500 focus:border-sky-500 text-sm"
                          />
                           {currentSelectedScenarioDetails.sampleUserMessage && (
                            <p className="text-xs text-slate-400 italic mt-1">Example: "{currentSelectedScenarioDetails.sampleUserMessage.replace('[your topic here]', customTopicInput || 'your topic')}"</p>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => handleStartConversation(sectionKey)}
                        disabled={isCustomTopicSelected && !customTopicInput.trim()}
                        className="mt-3 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Start Conversation
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScenarioSelector;
