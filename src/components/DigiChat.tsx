import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PetState, DigimonSpecies } from '../types/digimon';
import { sound } from '../utils/audio';
import { MessageSquare, Heart, Send, X, Share2, Sparkles, UserCheck } from 'lucide-react';

interface DigiChatProps {
  pet: PetState;
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
  content: string;
  likes: number;
  liked: boolean;
  timeAgo: string;
}

export const DigiChat: React.FC<DigiChatProps> = ({
  pet,
  species,
  isOpen,
  onClose,
}) => {
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

  const [newPostText, setNewPostText] = useState<string>('');
  const [guestbookNote, setGuestbookNote] = useState<string | null>(null);

  if (!isOpen) return null;

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

  const handleSendPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    sound.playAlert();
    const authorName =
      pet.playerName?.trim() ||
      (pet.nickname ? `${pet.nickname}'s Tamer` : 'DigiDestined Tamer');
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      author: authorName,
      tamerTitle: 'Active Tamer',
      digimonName: species?.name || 'Digimon',
      stage: pet.stage.toUpperCase(),
      avatarIcon: '📟',
      content: newPostText.trim(),
      likes: 1,
      liked: true,
      timeAgo: 'Just now',
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  const handleSendVisit = () => {
    sound.playDigivolve();
    setGuestbookNote(`Sent ${species?.name || 'your Digimon'} to visit a friend's screen!`);
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
              <p className="text-slate-400 text-xs">Hellopet-inspired global community feed & screen visits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visit Friend Screen Action */}
        <div className="my-3 p-3 bg-gradient-to-r from-pink-950/60 to-purple-950/60 border border-pink-500/30 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-xl">
              ✈️
            </div>
            <div>
              <div className="text-xs font-bold text-white font-chakra">
                SEND PET ON A SCREEN VISIT!
              </div>
              <div className="text-[11px] text-pink-200">
                Let your Digimon roam a friend's device and leave a friendly greeting!
              </div>
            </div>
          </div>
          <button
            onClick={handleSendVisit}
            className="bg-pink-500 hover:bg-pink-400 text-slate-950 font-pixel text-[10px] px-3 py-2 rounded-xl font-bold shadow-md shadow-pink-500/30"
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
            placeholder="Share an update or ask other Tamers for tips..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
          <button
            type="submit"
            className="bg-pink-500 hover:bg-pink-400 text-slate-950 font-pixel text-[10px] px-4 py-2 rounded-xl font-bold flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>POST</span>
          </button>
        </form>

        {/* Community Feed Posts */}
        <div className="space-y-3 mt-2 overflow-y-auto max-h-[360px] pr-1">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl p-1.5 bg-slate-800 rounded-xl border border-slate-700">
                    {post.avatarIcon}
                  </span>
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
                  className={`flex items-center gap-1.5 transition-colors ${
                    post.liked ? 'text-rose-400 font-bold' : 'hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.liked ? 'fill-rose-400' : ''}`} />
                  <span>{post.likes} Hearts</span>
                </button>
                <div className="text-[10px] font-pixel text-slate-500">
                  VERIFIED TAMER
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
