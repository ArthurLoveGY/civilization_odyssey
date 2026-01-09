import { memo, useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { gameActions } from '../store/useGameStore';

export const HardResetButton = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);

  const handleReset = () => {
    if (!isConfirm) {
      setIsConfirm(true);
      return;
    }

    gameActions.resetSave();
    // 页面会重新加载
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsConfirm(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950"
        aria-label="清空存档"
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              确认清空存档？
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!isConfirm ? (
              <Alert variant="destructive">
                <AlertDescription>
                  此操作将<strong>永久删除</strong>当前游戏进度，无法恢复！
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>最后确认：</strong>真的要删除所有进度吗？此操作不可撤销！
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-sm">
              <p>清空后，你需要从部落时代重新开始。</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleReset}
            >
              {isConfirm ? '确认删除' : '清空存档'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

HardResetButton.displayName = 'HardResetButton';
