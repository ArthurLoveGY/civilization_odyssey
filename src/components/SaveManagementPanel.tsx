import { memo, useState } from 'react';
import { Download, Upload, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { gameActions } from '../store/useGameStore';

export interface SaveManagementPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SaveManagementPanel = memo(({ isOpen, onClose }: SaveManagementPanelProps) => {
  const [exportedSave, setExportedSave] = useState<string>('');
  const [importString, setImportString] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // 导出存档
  const handleExport = () => {
    try {
      setError('');
      setSuccess(false);
      const saveString = gameActions.exportSave();
      setExportedSave(saveString);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出失败');
    }
  };

  // 复制到剪贴板
  const handleCopy = () => {
    navigator.clipboard.writeText(exportedSave);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 导入存档
  const handleImport = () => {
    if (!importString.trim()) {
      setError('请输入存档字符串');
      return;
    }

    try {
      setError('');
      gameActions.importSave(importString);
      // 页面会重新加载，不会执行到这里
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败');
    }
  };

  // 重置状态
  const handleClose = () => {
    setExportedSave('');
    setImportString('');
    setError('');
    setSuccess(false);
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>存档管理</DialogTitle>
          <DialogDescription>
            导出存档以备份，或导入已有存档
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 导出部分 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">导出存档</h3>
              <Button onClick={handleExport} size="sm">
                <Download className="w-4 h-4 mr-2" />
                导出
              </Button>
            </div>

            {exportedSave && (
              <div className="space-y-2">
                <Alert className="max-h-32 overflow-y-auto">
                  <AlertDescription className="text-xs break-all font-mono">
                    {exportedSave}
                  </AlertDescription>
                </Alert>
                <Button onClick={handleCopy} variant="outline" size="sm" className="w-full">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      复制到剪贴板
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* 分隔线 */}
          <div className="border-t border-gray-200 dark:border-gray-800" />

          {/* 导入部分 */}
          <div className="space-y-2">
            <h3 className="font-semibold">导入存档</h3>
            <textarea
              className="w-full h-32 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md resize-none bg-white dark:bg-gray-900"
              placeholder="粘贴存档字符串..."
              value={importString}
              onChange={(e) => setImportString(e.target.value)}
            />
            <Button onClick={handleImport} className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              导入存档
            </Button>
          </div>

          {/* 错误提示 */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 成功提示 */}
          {success && (
            <Alert>
              <AlertDescription className="text-green-600 dark:text-green-400">
                存档导出成功！请妥善保管。
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

SaveManagementPanel.displayName = 'SaveManagementPanel';
