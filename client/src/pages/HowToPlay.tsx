import { 
  Trophy, 
  HelpCircle, 
  MessageCircle, 
  UserCheck, 
  AlertTriangle, 
  ArrowLeft 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/Header';

export const HowToPlay = () => {
  const { t } = useTranslation();

  return (
    <>
    <Header />
    <div className="min-h-screen bg-slate-950 text-slate-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tight uppercase italic">
            {t("howToPlay.title")}
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            {t("howToPlay.intro")}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Step 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full -z-10 group-hover:bg-emerald-500/10 transition-colors"></div>
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-emerald-400 mb-4 border border-slate-700">
              <UserCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t("howToPlay.secretPlayer")}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t("howToPlay.secretCard")}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full -z-10 group-hover:bg-cyan-500/10 transition-colors"></div>
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-cyan-400 mb-4 border border-slate-700">
              <HelpCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t("howToPlay.askQuestions")}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t("howToPlay.askTurn")}
              <span className="block mt-2 text-cyan-200/80 italic">"{t("howToPlay.example1")}"</span>
              <span className="block text-cyan-200/80 italic">"{t("howToPlay.example2")}"</span>
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full -z-10 group-hover:bg-amber-500/10 transition-colors"></div>
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-amber-400 mb-4 border border-slate-700">
              <MessageCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t("howToPlay.answerTruthfully")}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t("howToPlay.answerTurn")}
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full -z-10 group-hover:bg-purple-500/10 transition-colors"></div>
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-purple-400 mb-4 border border-slate-700">
              <Trophy size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t("howToPlay.finalGuess")}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t("howToPlay.finalGuessDesc")}
            </p>
          </div>

        </div>

        {/* Rules & Abandonment Warning */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 md:p-8 flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <AlertTriangle className="text-amber-500" size={28} />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-2">{t("howToPlay.connectionRules")}</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t("howToPlay.connectionDesc")}
            </p>
          </div>
        </div>

  
        <div className="flex justify-center pt-8">
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center gap-2 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold transition-all border border-slate-700 hover:border-slate-500 hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.2)]"
          >
            <ArrowLeft size={20} />
            {t("howToPlay.backLobby")}
          </button>
        </div>

      </div>
    </div>
    </>
  );
};