import { memo } from 'react';
import { useGameStore, gameActions } from '../store/useGameStore';
import { Crown } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-amber-400 dark:border-amber-500">
        {/* Glow background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 via-yellow-500/20 to-orange-500/30 animate-pulse -z-10" />

        <DialogHeader>
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-amber-500" />
            <DialogTitle className="text-4xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 bg-clip-text text-transparent drop-shadow-lg">
              文明的黎明
            </DialogTitle>
          </div>
          <DialogDescription className="text-lg text-gray-700 dark:text-gray-300">
            经过漫长的岁月，你的族人战胜了严寒、饥饿与野兽。篝火变成了炉火，帐篷变成了房屋。部落已成为历史，王国即将诞生。
          </DialogDescription>
        </DialogHeader>

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

        <DialogFooter className="flex gap-4">
          <Button variant="secondary" onClick={handleContinue}>
            继续留在部落
          </Button>
          <Button
            className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-600 hover:via-yellow-600 hover:to-amber-600"
            onClick={handleNextEra}
          >
            进入王国时代
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

VictoryModal.displayName = 'VictoryModal';
