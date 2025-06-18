
import React from 'react';

interface ProgressDisplayProps {
  scenariosCompleted: number;
  messagesSent: number;
  currentStreak?: number; // Optional
}

const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 0 1 9.75 19.875V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

const FireIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468A3.75 3.75 0 0 0 12 18Z" />
    </svg>
);


const ProgressDisplay: React.FC<ProgressDisplayProps> = ({ scenariosCompleted, messagesSent, currentStreak }) => {
  return (
    <div className="p-4 bg-slate-700 rounded-lg shadow-md mt-4">
      <h3 className="text-lg font-semibold text-sky-400 mb-3 flex items-center">
        <ChartBarIcon className="h-6 w-6 mr-2 text-green-400" />
        Your Progress
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center p-2 bg-slate-600 rounded">
          <span className="text-slate-300">Scenarios Completed:</span>
          <span className="font-semibold text-sky-300">{scenariosCompleted}</span>
        </div>
        <div className="flex justify-between items-center p-2 bg-slate-600 rounded">
          <span className="text-slate-300">Messages Sent:</span>
          <span className="font-semibold text-sky-300">{messagesSent}</span>
        </div>
        {typeof currentStreak === 'number' && (
           <div className="flex justify-between items-center p-2 bg-slate-600 rounded">
            <div className="flex items-center text-slate-300">
                <FireIcon className="h-5 w-5 mr-1 text-orange-400" />
                Current Streak:
            </div>
            <span className="font-semibold text-orange-300">{currentStreak} Day{currentStreak === 1 ? '' : 's'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressDisplay;
