import { memo } from 'react';
import { useGameStore, gameActions } from '../store/useGameStore';
import { Crown, X } from 'lucide-react';

export interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VictoryModal = memo(({ isOpen, onClose }: VictoryModalProps) => {
  if (!isOpen) return null;

  const handleContinue = () => {
    onClose();
    gameActions.toggleGame();
  };

  const handleNextEra = () => {
    alert('Phase 2: Kingdom Age - Coming Soon / 开发中');
    onClose();
    gameActions.toggleGame();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in-0">
        {/* Glow background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 via-yellow-500/20 to-orange-500/30 animate-pulse" />

        {/* Modal container */}
        <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-4 border-amber-400 dark:border-amber-500 rounded-2xl shadow-[0_0_100px_rgba(245,158,11,0.5)] max-w-2xl mx-4 p-8 animate-in zoom-in-95 duration-500">
          {/* Inner glow ring */}
          <div className="absolute inset-0 rounded-2xl ring-4 ring-amber-200/50 dark:ring-amber-700/50 pointer-events-none" />

          {/* Golden border accent */}
          <div className="absolute -inset-[2px] bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 rounded-2xl -z-10 opacity-75" />

          {/* Content */}
          <div className="relative">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              title="关闭"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <Crown className="w-8 h-8 text-amber-500 dark:text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
              <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 bg-clip-text text-transparent drop-shadow-lg">
                文明的黎明
              </h2>
            </div>

            {/* Historical text */}
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              经过漫长的岁月，你的族人战胜了严寒、饥饿与野兽。篝火变成了炉火，帐篷变成了房屋。部落已成为历史，王国即将诞生。
            </p>

            {/* Stats display */}
            <div className="bg-gradient-to-br from-amber-50 dark:from-amber-900/20 to-yellow-50 dark:to-yellow-900/20 rounded-xl p-6 mb-6 border border-amber-200 dark:border-amber-800">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {useGameStore().totalDays}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    生存天数
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {useGameStore().resources.settlers.toNumber()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    总人口
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {useGameStore().researched.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    研究科技
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleContinue}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-4 px-6 rounded-xl font-semibold transition-all shadow-lg active:scale-95"
              >
                继续留在部落
              </button>
              <button
                onClick={handleNextEra}
                className="flex-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-600 hover:via-yellow-600 text-white py-4 px-6 rounded-xl font-semibold transition-all shadow-lg active:scale-95"
              >
                进入王国时代
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

VictoryModal.displayName = 'VictoryModal';
