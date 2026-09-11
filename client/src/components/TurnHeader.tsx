import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useUser } from "@clerk/clerk-react";
import { submitQuestion, submitAnswer } from '../store/gameActions';
import { CheckCircle, XCircle } from 'lucide-react';



// ==========================================
// INTERROGATION CHAT COMPONENT (BOX 1)
// ==========================================
export const InterrogationChat: React.FC = () => {
  const [questionText, setQuestionText] = useState('');

  const history = useGameStore((state) => state.history);
  const currentTurn = useGameStore((state) => state.currentTurn);
  const { user } = useUser();
  const localUserId = user?.id;


  const isMyTurn = currentTurn === localUserId;
  const lastHistoryItem = history[history.length - 1];
  const isPending = lastHistoryItem?.details.answer === 'pending';

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    submitQuestion(questionText);
    setQuestionText(''); // Clear input after sending
  };

  // Fetch Players Profile image
  const players = useGameStore((state) => state.players);



  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl flex flex-col h-125 overflow-hidden">

      {/* HISTORY FEED */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 scroll-y">
        {history.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 italic">
            The interrogation begins now. Ask the first question!
          </div>
        ) : (
          history.map((item) => {
            const isMe = item.playerId === localUserId;
            const playerInfo = isMe
              ? { imageUrl: user?.imageUrl, name: user?.username ?? 'You' }
              : players[item.playerId];

            return (
              <div key={item.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Row: avatar + bubble — reversed for "me" so avatar lands on the right */}
                <div className={`flex gap-1.5 items-end ${isMe ? 'flex-row-reverse' : ''}`}>
                  <span className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                    <img
                      src={playerInfo?.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </span>

                  <div
                    className={`max-w-[80%] px-3 py-2 text-sm rounded-2xl ${isMe
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-gray-700 text-gray-200 rounded-bl-sm'
                      } ${!isMe && item.action === 'answer' ? 'hidden' : ''}
                        ${ isMe && item.action === 'answer' ? 'hidden' : ''}
                      `}
                  >
                    {item.action === 'question' && item.details.text}
                    {item.action === 'final_guess' && (
                      <>
                        <span className="font-bold text-yellow-300 block text-xs uppercase mb-1">
                          Final Guess Attempt
                        </span>
                        {item.details.guessedPlayer}
                      </>
                    )}
                  </div>
                </div>

                {/* Badge row  */}
                {item.details.answer !== 'pending' && (
                  <span
                    className={`flex items-center gap-1 text-xs font-bold mt-1 px-2 py-1 rounded-full ${item.details.answer === 'yes'
                        ? 'text-green-400'
                        : item.details.answer === 'no'
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }`}
                  >
                    {item.details.answer === 'yes' ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : item.details.answer === 'no' ? (
                      <XCircle className="w-3.5 h-3.5" />
                    ) : null}
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