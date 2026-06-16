import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useAuthStore } from '../store/authStore';
import { submitQuestion, submitAnswer } from '../store/gameActions';

// ==========================================
// 1. TURN HEADER COMPONENT
// ==========================================
export const TurnHeader: React.FC = () => {
  const currentTurn = useGameStore((state) => state.currentTurn);
  const lives = useGameStore((state) => state.lives);
  
  // Grab the local user's ID to check if it's their turn
  const localUserId = useAuthStore((state) => state.user?.userId);

  const isMyTurn = currentTurn === localUserId;
  const myLives = lives[localUserId || ''] ?? 3;

  return (
    <div className={`p-4 rounded-xl mb-6 flex justify-between items-center transition-colors ${isMyTurn ? 'bg-green-600 text-white shadow-lg shadow-green-500/30' : 'bg-gray-800 text-gray-300'}`}>
      <div>
        <h2 className="text-2xl font-bold">
          {isMyTurn ? '👉 YOUR TURN' : '⏳ OPPONENT\'S TURN'}
        </h2>
        <p className="text-sm opacity-80">
          {isMyTurn ? 'Ask a question or make a final guess.' : 'Waiting for opponent to act...'}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold uppercase tracking-wider opacity-80">Your Lives</p>
          <div className="flex gap-1 text-xl">
            {/* Display Hearts based on remaining lives */}
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={i < myLives ? 'text-red-400' : 'text-gray-500 opacity-30'}>
                ❤️
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. INTERROGATION CHAT COMPONENT (BOX 1)
// ==========================================
export const InterrogationChat: React.FC = () => {
  const [questionText, setQuestionText] = useState('');
  
  const history = useGameStore((state) => state.history);
  const currentTurn = useGameStore((state) => state.currentTurn);
  const localUserId = useAuthStore((state) => state.user?.userId);

  const isMyTurn = currentTurn === localUserId;
  const lastHistoryItem = history[history.length - 1];
  const isPending = lastHistoryItem?.details.answer === 'pending';

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    
    submitQuestion(questionText);
    setQuestionText(''); // Clear input after sending
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl flex flex-col h-125 overflow-hidden">
      
      {/* HISTORY FEED */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
        {history.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 italic">
            The interrogation begins now. Ask the first question!
          </div>
        ) : (
          history.map((item, index) => {
            const isMe = item.playerId === localUserId;
            return (
              <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Chat Bubble */}
                <div className={`max-w-[80%] p-3 rounded-2xl ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-700 text-gray-200 rounded-bl-sm'}`}>
                  {item.action === 'final_guess' && <span className="font-bold text-yellow-300 block text-xs uppercase mb-1">Final Guess Attempt</span>}
                  {item.details.text}
                </div>
                
                {/* Answer Badge */}
                {item.details.answer !== 'pending' && (
                  <span className={`text-xs font-bold mt-1 px-2 py-1 rounded-full ${
                    item.details.answer === 'yes' ? 'bg-green-500/20 text-green-400' : 
                    item.details.answer === 'no' ?  'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    Answer: {item.details?.answer?.toUpperCase()}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Interaction Zone */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        
        {/* Scenario A: My turn & no response yet */}
        {isMyTurn && !isPending && (
          <form onSubmit={handleAskQuestion} className="flex gap-2">
            <input
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g., Does he play in the Premier League?"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button 
              type="submit"
              disabled={!questionText.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold transition-colors"
            >
              Ask
            </button>
          </form>
        )}

        {/* Scenario B: I asked & waiting for response */}
        {isMyTurn && isPending && (
          <div className="text-center text-gray-400 py-2 animate-pulse">
            Waiting for opponent to answer...
          </div>
        )}

        {/* Scenario C: Opponent Ask & wait my response*/}
        {!isMyTurn && isPending && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-yellow-400 font-bold text-sm">Opponent is waiting for your answer!</p>
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => submitAnswer('yes')}
                className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold transition-transform active:scale-95"
              >
                YES
              </button>
              <button 
                onClick={() => submitAnswer('no')}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-bold transition-transform active:scale-95"
              >
                NO
              </button>
            </div>
          </div>
        )}

        {/* Scenario D: Opponent's turn*/}
        {!isMyTurn && !isPending && (
          <div className="text-center text-gray-500 py-2">
            Opponent is thinking...
          </div>
        )}

      </div>
    </div>
  );
};