import React, { useState, useEffect } from "react";
import { Share2, Sparkles, Trophy, X, CheckCircle } from "lucide-react";

interface AchievementSharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
  achievementTitle: string;
}

const AchievementSharePopup: React.FC<AchievementSharePopupProps> = ({
  isOpen,
  onClose,
  onShare,
  achievementTitle,
}) => {
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) setShouldRender(true);
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-500 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onTransitionEnd={() => {
        if (!isOpen) setShouldRender(false);
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Popup Content */}
      <div
        className={`relative bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/20 transform transition-all duration-500 delay-75 ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-12 scale-95 opacity-0"
        }`}
      >
        {/* Top Decorative Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 h-32 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 shadow-lg">
              <Trophy className="w-10 h-10 text-white animate-bounce" />
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-10 pt-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 mb-6 px-4">
            <Sparkles size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">
              New Achievement Unlocked
            </span>
          </div>

          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight italic">
            {achievementTitle}
          </h2>

          <p className="text-gray-500 text-sm font-medium leading-relaxed mb-10 max-w-sm mx-auto">
            Your persistence has paid off! Share your moment to fellow learners
            in social feed.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={onClose}
              className="px-8 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all border border-gray-100"
            >
              Maybe Later
            </button>
            <button
              onClick={onShare}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 group"
            >
              <Share2
                size={16}
                className="group-hover:scale-110 transition-transform"
              />
              Post to Feed
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 opacity-40 grayscale">
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <CheckCircle size={14} />
              </div>
              <span className="text-[7px] font-bold">Earned</span>
            </div>
            <div className="w-12 h-px bg-gray-200" />
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Share2 size={14} />
              </div>
              <span className="text-[7px] font-bold">Share</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementSharePopup;
