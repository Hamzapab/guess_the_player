import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, Mic, Send, ThumbsUp , ThumbsDown , Target} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { useUser } from "@clerk/clerk-react";
import { submitQuestion, submitAnswer } from '../store/gameActions';




// ==========================================
// INTERROGATION CHAT COMPONENT 
// ==========================================
export const InterrogationChat: React.FC = () => {
  const [questionText, setQuestionText] = useState('');
  const [isListening, setIsListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef('');

  // Browser support
  const SpeechRecognitionAPI =
    typeof window !== 'undefined'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : undefined;
  const isSpeechSupported = !!SpeechRecognitionAPI;

  const startListening = () => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-US';
    recognition.interimResults = true; // live text while the user is still talking
    recognition.continuous = false;    // stops by itself after a pause

    baseTextRef.current = questionText ? questionText.trimEnd() + ' ' : '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((result: any) => result[0].transcript)
        .join('');
      setQuestionText(baseTextRef.current + transcript);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => console.error('Speech error:', event.error);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => recognitionRef.current?.stop();

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

    recognitionRef.current?.abort(); // clean audio
    submitQuestion(questionText);
    setQuestionText(''); // Clear input after sending
  };

  // Fetch Players Profile image
  const players = useGameStore((state) => state.players);


  // Stop the mic on unmount, and when the form disappears ex :turn changed, question pending
  useEffect(() => () => recognitionRef.current?.abort(), []);
  useEffect(() => {
    if (!(isMyTurn && !isPending)) recognitionRef.current?.abort();
  }, [isMyTurn, isPending]);



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
              <div key={item.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} text-xs`}>

                <div className={`flex gap-1.5 items-end ${isMe ? 'flex-row-reverse' : ''}
                              ${!isMe && item.action === 'answer' ? 'hidden' : ''}
                              ${isMe && item.action === 'answer' ? 'hidden' : ''}
                              `}>
                  <span className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                    <img
                      src={playerInfo?.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <div
                    className={`max-w-[80%] px-3 py-2 text-xs rounded-2xl
                      ${item.action === 'question_timed'
                        ? isMe
                          ? 'bg-yellow-500/10 border border-yellow-500/3 text-yellow-300 rounded-br-sm'   // Player timed out
                          : 'bg-yellow-500/10 border border-yellow-500/3 text-yellow-300 rounded-br-sm'   // Opponent's turn
                        : isMe
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-gray-700 text-gray-200 rounded-bl-sm'
                      }
                      ${!isMe && item.action === 'answer' ? 'hidden' : ''}
                      ${isMe && item.action === 'answer' ? 'hidden' : ''}
                      ${item.action === 'question_timed' ? 'whitespace-nowrap' : ''}
                      `}
                  >
                    {item.action === 'question' && item.details.text}
                    {item.action === 'question_timed' && (
                      "Turn passed (timeout) "
                    )}
                    {item.action === 'final_guess' && (
                      <div className='flex items-center gap-2'>
                        <span className="font-bold text-yellow-300 block text-xs uppercase ">
                          <Target className="w-3 h-3 text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.9)]"  /> 
                        </span>
                        <span className="whitespace-nowrap text-yellow-300">{item.details.guessedPlayer}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Badge row  */}
                {(item.details.answer !== 'pending' && item.action !== "question_timed") && (
                  <div className={`flex gap-1.5 items-end ${isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                      <img
                        src={playerInfo?.imageUrl}
                        alt=""
                        className={`w-full h-full object-cover
                           ${(item.details.answer !== 'no' && item.details.answer !== 'yes') ? 'hidden' : ''}
                          `}
                      />
                    </span>
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
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Interaction Zone */}
      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700">

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
            {isSpeechSupported && (
              <button
                type="button" // without this it would submit the form
                onClick={isListening ? stopListening : startListening}
                aria-label={isListening ? 'Stop dictation' : 'Start dictation'}
                aria-pressed={isListening}
                className={`flex items-center justify-center px-3 rounded-lg border transition-colors ${isListening
                  ? 'bg-red-600 border-red-500 text-white animate-pulse'
                  : 'bg-gray-900 border-gray-700 text-gray-300 hover:text-white hover:border-blue-500'
                  }`}
              >
                <Mic size={18} />
              </button>
            )}

            <button
              type="submit"
              disabled={!questionText.trim()}
              aria-label="Send question"
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 rounded-lg transition-colors"
            >
              <Send size={18} />
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
            <p className="text-yellow-400 font-bold text-lg"> {lastHistoryItem?.details.text} ?</p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => submitAnswer('yes')}
                className="h-9 flex-1 flex items-center justify-center bg-green-900/20 border border-green-500 text-green-400 font-bold
                py-2 rounded-lg shadow-[0px_0_9px_rgba(34,197,94,0.6),0px_0_18px_rgba(34,197,94,0.3)]  transition-all duration-200 hover:bg-green-500/10 hover:text-green-300
                hover:shadow-[0_0_12px_rgba(34,197,94,0.8),0_0_24px_rgba(34,197,94,0.4)]
                active:scale-95 cursor-pointer"
              >
                <ThumbsUp size={20} />
              </button>
              <button
                onClick={() => submitAnswer('no')}
                className="h-9 flex-1 flex items-center justify-center bg-green-900/20 border border-red-500 text-red-400 font-bold
                py-3 rounded-lg shadow-[0px_0_9px_rgba(239,68,68,0.6),0px_0_18px_rgba(239,68,68,0.3)]  transition-all duration-200 hover:bg-green-500/10 hover:text-red-300
                hover:shadow-[0_0_12px_rgba(239,68,68,0.8),0_0_24px_rgba(239,68,68,0.4)]
                active:scale-95 cursor-pointer"
              >
                <ThumbsDown size={20}/>
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


