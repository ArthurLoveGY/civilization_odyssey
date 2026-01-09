import { memo, useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from './ui/button';
import { SaveManagementPanel } from './SaveManagementPanel';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { HardResetButton } from './HardResetButton';

export const SaveControls = memo(() => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {/* 自动保存指示器 */}
      <AutoSaveIndicator />

      {/* 存档管理按钮 */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsPanelOpen(true)}
        aria-label="存档管理"
      >
        <Settings className="w-4 h-4" />
      </Button>

      {/* 硬重置按钮 */}
      <HardResetButton />

      {/* 存档管理面板 */}
      <SaveManagementPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
});

SaveControls.displayName = 'SaveControls';
