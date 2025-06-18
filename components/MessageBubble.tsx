
import React from 'react';
import { Message, FeedbackItem } from '../types';
import LoadingSpinner from './LoadingSpinner'; // Import LoadingSpinner

interface MessageBubbleProps {
  message: Message;
  showFeedbackSetting?: boolean; // Added prop
}

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438Z" clipRule="evenodd" />
  </svg>
);

const AiIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
  <path d="M12 .998c-1.488 0-2.882.342-4.145.964C6.59 2.585 5.373 3.518 4.365 4.675A10.455 10.455 0 002.05 9.188 10.22 10.22 0 001 12.001c0 1.487.344 2.882.968 4.144.624 1.263 1.558 2.378 2.716 3.385a10.493 10.493 0 004.512 2.317c.009.002.016.004.025.004h.001A10.247 10.247 0 0012 23.002a10.247 10.247 0 002.724-.363h.001c.008 0 .016-.002.024-.004a10.493 10.493 0 004.512-2.317c1.158-1.007 2.092-2.122 2.716-3.385.624-1.262.968-2.657.968-4.144a10.22 10.22 0 00-1.05-4.513 10.455 10.455 0 00-2.315-4.513c-1.008-1.157-2.225-2.09-3.488-2.713A10.264 10.264 0 0012 .998zM7.5 10.498a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm9 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM12 14.248c-2.33 0-4.322 1.297-5.303 3.12.23.18.475.345.732.492A5.96 5.96 0 0112 16.497c1.643 0 3.14-.663 4.228-1.748a.75.75 0 011.06 1.06A7.476 7.476 0 0012 17.997a7.433 7.433 0 00-4.697-1.63c-.257-.147-.502-.313-.732-.492C7.587 14.508 9.61 12.748 12 12.748c2.392 0 4.413 1.76 5.303 3.37.23-.18.475-.345.732-.492A5.96 5.96 0 0112 14.248z" />
 </svg>
);

const LightBulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);


const MessageBubble: React.FC<MessageBubbleProps> = ({ message, showFeedbackSetting }) => {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  const bubbleAlignment = isUser ? 'justify-end' : 'justify-start';
  const bubbleColor = isUser ? 'bg-sky-600 text-white' : (isSystem ? 'bg-slate-600 text-slate-200' : 'bg-slate-700 text-slate-100');
  const textAlign = isUser ? 'text-right' : 'text-left';
  const borderRadius = isUser ? 'rounded-l-xl rounded-tr-xl' : 'rounded-r-xl rounded-tl-xl';

  const shouldShowFeedbackArea = isUser && showFeedbackSetting && (message.isLoadingFeedback || (message.feedback && message.feedback.length > 0));

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className={`p-2 px-3 text-xs ${bubbleColor} rounded-full shadow-md`}>
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} my-1`}>
      <div className={`flex items-end max-w-xs md:max-w-md lg:max-w-lg ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`p-1 ${isUser ? 'ml-2' : 'mr-2'}`}>
          {isUser ? 
            <UserIcon className="h-6 w-6 text-sky-400" /> :
            <AiIcon className="h-6 w-6 text-teal-400" />
          }
        </div>
        <div className={`p-3 ${bubbleColor} ${borderRadius} shadow-md`}>
          <p className="text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
          <p className={`text-xs mt-1 ${isUser ? 'text-sky-200' : 'text-slate-400'} ${textAlign}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
      
      {shouldShowFeedbackArea && (
        <div className={`mt-1.5 ${isUser ? 'mr-8' : 'ml-8'} max-w-xs md:max-w-md lg:max-w-lg w-full`}>
          <div className="p-2.5 bg-slate-700 rounded-lg shadow">
            {message.isLoadingFeedback && (
              <div className="flex items-center text-xs text-slate-400">
                <LoadingSpinner size="sm" color="text-sky-400" />
                <span className="ml-2">Getting feedback...</span>
              </div>
            )}
            {!message.isLoadingFeedback && message.feedback && message.feedback.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-sky-400 mb-1 flex items-center">
                  <LightBulbIcon className="h-4 w-4 mr-1 text-yellow-400" />
                  AI Feedback:
                </h4>
                <ul className="space-y-1.5">
                  {message.feedback.map((item, index) => (
                    <li key={index} className="p-1.5 bg-slate-600 rounded">
                      <p className="text-xs text-slate-200">{item.message}</p>
                      {item.suggestion && (
                        <p className="text-xs text-green-300 mt-0.5">
                          <span className="font-semibold">Suggestion:</span> {item.suggestion}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
             {!message.isLoadingFeedback && message.feedback && message.feedback.length === 0 && (
                 <p className="text-xs text-slate-400">No specific feedback points for this message.</p>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
