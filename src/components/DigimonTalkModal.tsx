import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { PetState, DigimonSpecies, DigiEggInfo } from '../types/digimon';
import { DigimonSprite } from './DigimonSprite';
import { fetchDigimonAiDialogue, DigimonChatTurn } from '../utils/digimonPersonality';
import { sound } from '../utils/audio';
import { Sparkles, Send, X, MessageSquare } from 'lucide-react';

interface DigimonTalkModalProps {
  pet: PetState;
  species?: DigimonSpecies;
  egg?: DigiEggInfo;
  isOpen: boolean;
  onClose: () => void;
}

export const DigimonTalkModal: React.FC<DigimonTalkModalProps> = ({
  pet,
  species,
  egg,
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<DigimonChatTurn[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [moodAction, setMoodAction] = useState<'idle' | 'happy'>('idle');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  if (!isOpen) return null;

  const speciesName = species?.name || pet.nickname || 'Digimon';

  const handleSend = async (rawText: string) => {
    const clean = rawText.trim();
    if (!clean || isThinking) return;

    sound.playButton();
    const userTurn: DigimonChatTurn = { role: 'user', text: clean };
    const nextHistory = [...messages, userTurn];
    setMessages(nextHistory);
    setInputText('');
    setIsThinking(true);

    try {
      const result = await fetchDigimonAiDialogue({
        speciesName,
        speciesId: pet.currentSpeciesId,
        stage: pet.stage,
        attribute: species?.attribute,
        type: species?.type,
        description: species?.description,
        signatureMove: species?.signatureMove?.name,
        crestName: egg?.crestName,
        tamerName: egg?.tamerName,
        hunger: pet.hunger,
        happiness: pet.happiness,
        energy: pet.energy,
        strength: pet.strength,
        weight: pet.weight,
        isSick: pet.isSick,
        poopCount: pet.poopCount,
        battlesWon: pet.battlesWon,
        battlesTotal: pet.battlesTotal,
        careMistakes: pet.careMistakes,
        userMessage: clean,
        history: messages.slice(-8),
      });

      setMessages((prev) => [...prev, { role: 'model', text: result.text }]);
      if (result.source === 'ai') {
        sound.playAlert();
        setMoodAction('happy');
        setTimeout(() => setMoodAction('idle'), 1400);
      }
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md android-safe-modal">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md bg-slate-900 border-2 border-cyan-500/60 rounded-3xl p-4 shadow-2xl flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-chakra font-bold text-white text-base flex items-center gap-1.5">
                <span>TALK TO {speciesName.toUpperCase()}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-[11px] text-slate-400">
                {pet.stage.toUpperCase()} • {species?.type || 'Digital Monster'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Partner Preview */}
        <div className="my-3 py-2.5 px-3 bg-gradient-to-b from-sky-950/50 to-slate-950 border border-slate-800 rounded-2xl flex items-center gap-3">
          <div className="shrink-0 flex items-center justify-center min-w-[64px]">
            <DigimonSprite
              species={species}
              egg={pet.stage === 'egg' ? egg : undefined}
              action={pet.isSick ? 'sick' : moodAction}
              scale={0.85}
            />
          </div>
          <div className="flex-1 min-w-0 text-xs text-slate-300">
            <div className="font-chakra font-bold text-cyan-300 text-xs mb-0.5">
              {speciesName} is listening!
            </div>
            <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
              {species?.description || `Your ${pet.stage} companion is ready to chat about adventures, training, or anything on your mind.`}
            </p>
          </div>
        </div>

        {/* Conversation Thread */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-[180px] max-h-[320px] overflow-y-auto space-y-2.5 pr-1 mb-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3"
        >
          {messages.length === 0 && !isThinking && (
            <div className="text-center text-slate-500 text-xs py-8 px-2">
              Say hello to <span className="text-cyan-300 font-bold">{speciesName}</span> or tap a quick prompt below!
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[84%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-br-sm'
                    : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-slate-800/90 border border-cyan-500/30 text-cyan-300 rounded-2xl rounded-bl-sm px-3 py-2 text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>{speciesName} is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {[
            'How are you feeling today?',
            'Tell me about your special attack!',
            'Got any training advice?',
            'Are you hungry for meat?',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              disabled={isThinking}
              className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputText);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask ${speciesName} anything...`}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold rounded-xl cursor-pointer disabled:opacity-40 transition-all active:scale-95 flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="text-xs font-pixel">SEND</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};
