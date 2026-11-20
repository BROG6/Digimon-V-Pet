import React, { useState } from 'react';
import { PetState, DigimonSpecies } from '../types/digimon';
import { DigimonSprite } from './DigimonSprite';
import { DigimonChatTurn, fetchDigimonAiDialogue } from '../utils/digimonPersonality';
import { sound } from '../utils/audio';
import { MessageSquare, Heart, Send, X, Sparkles } from 'lucide-react';

interface DigiChatProps {
  pet: PetState;
  playerName?: string;
  species?: DigimonSpecies;
  isOpen: boolean;
  onClose: () => void;
}

interface CommunityPost {
  id: string;
  author: string;
  tamerTitle: string;
  digimonName: string;
  stage: string;
  avatarIcon: string;
  speciesId?: string;
  content: string;
  likes: number;
  liked: boolean;
  timeAgo: string;
}

export const DigiChat: React.FC<DigiChatProps> = ({
  pet,
  playerName,
  species,
  isOpen,
  onClose,
}) => {
  const activePlayerName = (playerName ?? pet.playerName ?? '').trim();

  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: 'post-1',
      author: 'Tai Kamiya',
      tamerTitle: 'Leader of Courage',
      digimonName: 'Agumon',
      stage: 'Rookie',
      avatarIcon: '🦖',
      content: 'Agumon just ate 5 Big Meats in a row and won 3 consecutive Colosseum battles! Anyone up for a sparring match later? 🔥',
      likes: 42,
      liked: false,
      timeAgo: '12m ago',
    },
    {
      id: 'post-2',
      author: 'Matt Ishida',
      tamerTitle: 'Wolf of Friendship',
      digimonName: 'Gabumon',
      stage: 'Champion',
      avatarIcon: '🐺',
      content: 'Garurumon evolved after our arctic training session! Decorated my room with the 1999 Digivice pedestal. Looks amazing in the dark!',
      likes: 38,
      liked: true,
      timeAgo: '45m ago',
    },
    {
      id: 'post-3',
      author: 'Kari Kamiya',
      tamerTitle: 'Guardian of Light',
      digimonName: 'Gatomon',
      stage: 'Champion',
      avatarIcon: '🐱',
      content: 'Sending Gatomon to visit friend screens today! Remember to give your pets plenty of vitamins when they look sick! ✨',
      likes: 67,
      liked: false,
      timeAgo: '2h ago',
    },
  ]);

  const [chatHistory, setChatHistory] = useState<DigimonChatTurn[]>([]);
  const [newPostText, setNewPostText] = useState<string>('');
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [guestbookNote, setGuestbookNote] = useState<string | null>(null);

  if (!isOpen) return null;

  const speciesName = species?.name || pet.nickname || 'Digimon';

  const buildAiContextHistory = (turns: DigimonChatTurn[]): DigimonChatTurn[] => {
    const trimmed = turns.slice(-8);
    if (!activePlayerName) return trimmed;
    const contextTurn: DigimonChatTurn = {
      role: 'user',
      text: `My name is ${activePlayerName}. Remember to address me directly as ${activePlayerName} in our conversation.`,
    };
    const ackTurn: DigimonChatTurn = {
      role: 'model',
      text: `Got it, ${activePlayerName}! I will always remember your name!`,
    };
    return [contextTurn, ackTurn, ...trimmed];
  };

  const handleLike = (id: string) => {
    sound.playButton();
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            likes: p.liked ? p.likes - 1 : p.likes + 1,
            liked: !p.liked,
          };
        }
        return p;
      })
    );
  };

  const handleSendPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = newPostText.trim();
    if (!cleanText || isReplying) return;

    sound.playAlert();
    const authorName =
      activePlayerName ||
      `${pet.nickname?.trim() || speciesName}'s Tamer`;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      author: authorName,
      tamerTitle: 'Active Tamer',
      digimonName: speciesName,
      stage: pet.stage.toUpperCase(),
      avatarIcon: '📟',
      content: cleanText,
      likes: 1,
      liked: true,
      timeAgo: 'Just now',
    };

    const contextualMessage = activePlayerName
      ? `[From ${activePlayerName}]: ${cleanText}`
      : cleanText;

    const updatedHistory: DigimonChatTurn[] = [
      ...chatHistory,
      { role: 'user', text: contextualMessage },
    ];

    setPosts((prev) => [newPost, ...prev]);
    setChatHistory(updatedHistory);
    setNewPostText('');
    setIsReplying(true);

    try {
      const result = await fetchDigimonAiDialogue({
        speciesName,
        speciesId: pet.currentSpeciesId,
        stage: pet.stage,
        attribute: species?.attribute,
        type: species?.type,
        description: species?.description,
        signatureMove: species?.signatureMove?.name,
        playerName: activePlayerName || undefined,
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
        actionContext: activePlayerName
          ? `Replying to ${activePlayerName}'s message in the Tamer Lounge Pet Chat.`
          : 'Replying in the Tamer Lounge Pet Chat.',
        userMessage: contextualMessage,
        history: buildAiContextHistory(chatHistory),
      });

      if (result.text) {
        const replyPost: CommunityPost = {
          id: `reply-${Date.now()}`,
          author: speciesName,
          tamerTitle: activePlayerName ? `${activePlayerName}'s Partner` : 'Partner Digimon',
          digimonName: `${species?.type || 'Digital'} Partner`,
          stage: pet.stage.toUpperCase(),
          avatarIcon: '✨',
          speciesId: species?.id || pet.currentSpeciesId,
          content: result.text,
          likes: 1,
          liked: false,
          timeAgo: 'Just now',
        };
        setPosts((prev) => [replyPost, ...prev]);
        setChatHistory((prev) => [...prev, { role: 'model', text: result.text }]);
      }
    } finally {
      setIsReplying(false);
    }
  };

  const handleSendVisit = () => {
    sound.playDigivolve();
    const who = activePlayerName ? `${activePlayerName}'s ${speciesName}` : speciesName;
    setGuestbookNote(`Sent ${who} to visit a friend's screen!`);
    setTimeout(() => setGuestbookNote(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md android-safe-modal">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-pink-500/50 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-pink-400" />
            <div>
              <h3 className="font-chakra font-bold text-white text-lg">
                TAMER LOUNGE & "PET CHAT"
              </h3>
              <p className="text-slate-400 text-xs">
                {activePlayerName
                  ? `Chatting as ${activePlayerName} · ${speciesName} replies live`
                  : 'Hellopet-inspired global community feed & screen visits'}
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

        {/* Visit Friend Screen Action */}
        <div className="my-3 p-3 bg-gradient-to-r from-pink-950/60 to-purple-950/60 border border-pink-500/30 rounded-2xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-xl shrink-0">
              ✈️
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white font-chakra">
                SEND PET ON A SCREEN VISIT!
              </div>
              <div className="text-[11px] text-pink-200 truncate">
                Let {speciesName} roam a friend's device and leave a friendly greeting!
              </div>
            </div>
          </div>
          <button
            onClick={handleSendVisit}
            className="bg-pink-500 hover:bg-pink-400 text-slate-950 font-pixel text-[10px] px-3 py-2 rounded-xl font-bold shadow-md shadow-pink-500/30 shrink-0 cursor-pointer"
          >
            SEND VISIT
          </button>
        </div>

        {guestbookNote && (
          <div className="p-2 mb-2 bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-pixel text-[10px] rounded-xl text-center">
            {guestbookNote}
          </div>
        )}

        {/* Create Post Input */}
        <form onSubmit={handleSendPost} className="flex gap-2 my-2">
          <input
            type="text"
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            placeholder={
              activePlayerName
                ? `Post as ${activePlayerName} or chat with ${speciesName}...`
                : 'Share an update or chat with your Digimon...'
            }
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
          <button
            type="submit"
            disabled={!newPostText.trim() || isReplying}
            className="bg-pink-500 hover:bg-pink-400 disabled:opacity-50 text-slate-950 font-pixel text-[10px] px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isReplying ? 'THINKING' : 'POST'}</span>
          </button>
        </form>

        {isReplying && (
          <div className="mb-2 px-3 py-2 rounded-xl bg-slate-950/80 border border-pink-500/30 text-pink-300 text-xs flex items-center gap-2 font-chakra">
            <Sparkles className="w-3.5 h-3.5 animate-spin shrink-0" />
            <span>{speciesName} is replying{activePlayerName ? ` to ${activePlayerName}` : ''}...</span>
          </div>
        )}

        {/* Community Feed Posts */}
        <div className="space-y-3 mt-2 overflow-y-auto max-h-[360px] pr-1">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {post.speciesId && species && post.speciesId === species.id ? (
                    <div className="w-10 h-10 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                      <DigimonSprite species={species} action="idle" scale={0.5} />
                    </div>
                  ) : (
                    <span className="text-2xl p-1.5 bg-slate-800 rounded-xl border border-slate-700">
                      {post.avatarIcon}
                    </span>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-chakra font-bold text-white text-sm">
                        {post.author}
                      </span>
                      <span className="text-[10px] font-pixel text-pink-400 px-2 py-0.5 rounded-full bg-pink-950/50 border border-pink-900">
                        {post.stage}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-chakra">
                      {post.tamerTitle} • {post.digimonName}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-pixel">
                  {post.timeAgo}
                </span>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm font-display pl-1">
                {post.content}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    post.liked ? 'text-rose-400 font-bold' : 'hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.liked ? 'fill-rose-400' : ''}`} />
                  <span>{post.likes} Hearts</span>
                </button>
                <div className="text-[10px] font-pixel text-slate-500">
                  {post.speciesId ? 'PARTNER AI' : 'VERIFIED TAMER'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
