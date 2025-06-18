
import React from 'react';
import { APP_NAME } from '../constants';
import IconButton from './IconButton';

interface HeaderProps {
  onSettingsClick?: () => void;
  onNewConversationClick?: () => void;
  isInChatView: boolean;
  isSidePanelVisible?: boolean; // Optional for non-chat views
  onToggleSidePanel?: () => void; // Optional for non-chat views
}

const CogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.057-1.229a11.952 11.952 0 0 1 7.273 0c.496.222.966.687 1.057 1.229.09.542.048 1.135-.12 1.664A10.53 10.53 0 0 1 16.03 7.77a10.53 10.53 0 0 1 3.403 3.402c.168.53.21.1129.12 1.664s-.561 1.007-1.057 1.229A11.952 11.952 0 0 1 12 15.544a11.952 11.952 0 0 1-7.273 0c-.496-.222-.966-.687-1.057-1.229s-.048-1.135.12-1.664A10.53 10.53 0 0 1 7.97 7.77a10.53 10.53 0 0 1-3.4-3.402c-.168-.53-.21-1.129-.12-1.664Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const PlusCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const ChevronDoubleRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
  </svg>
);

const ChevronDoubleLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
  </svg>
);


const Header: React.FC<HeaderProps> = ({ 
  onSettingsClick, 
  onNewConversationClick, 
  isInChatView,
  isSidePanelVisible,
  onToggleSidePanel
}) => {
  return (
    <header className="bg-slate-800 shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center space-x-2">
        <img src="https://picsum.photos/seed/belailogo/40/40" alt="BelAI Logo" className="h-10 w-10 rounded-full" />
        <h1 className="text-2xl font-bold text-sky-400">{APP_NAME}</h1>
      </div>
      <div className="flex items-center space-x-3">
        {isInChatView && onNewConversationClick && (
          <IconButton 
            icon={<PlusCircleIcon className="h-6 w-6" />} 
            onClick={onNewConversationClick} 
            label="New Conversation"
            variant="ghost"
            size="md"
            title="Start New Conversation / Select Scenario"
          />
        )}
        {isInChatView && typeof isSidePanelVisible === 'boolean' && onToggleSidePanel && (
           <IconButton
            icon={isSidePanelVisible ? <ChevronDoubleRightIcon className="h-6 w-6" /> : <ChevronDoubleLeftIcon className="h-6 w-6" />}
            onClick={onToggleSidePanel}
            label={isSidePanelVisible ? "Hide Details Panel" : "Show Details Panel"}
            variant="ghost"
            size="md"
            title={isSidePanelVisible ? "Hide Details Panel" : "Show Details Panel"}
           />
        )}
        {onSettingsClick && (
          <IconButton 
            icon={<CogIcon className="h-6 w-6" />} 
            onClick={onSettingsClick} 
            label="Settings"
            variant="ghost"
            size="md"
            title="Settings"
          />
        )}
      </div>
    </header>
  );
};

export default Header;
