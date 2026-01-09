import { memo, useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Badge } from './ui/badge';
import { gameActions } from '../store/useGameStore';

export const AutoSaveIndicator = memo(() => {
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [saveExists, setSaveExists] = useState<boolean>(false);

  useEffect(() => {
    // 初始检查
    checkSave();

    // 每 5 秒检查一次
    const interval = setInterval(checkSave, 5000);

    return () => clearInterval(interval);
  }, []);

  const checkSave = () => {
    const metadata = gameActions.getSaveMetadata();
    if (metadata?.exists) {
      setSaveExists(true);
      // 使用当前时间作为近似值（无法获取真实保存时间）
      setLastSaveTime(new Date());
    } else {
      setSaveExists(false);
      setLastSaveTime(null);
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return '刚刚';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟前`;
    return `${Math.floor(seconds / 3600)} 小时前`;
  };

  if (!saveExists) {
    return (
      <Badge variant="outline" className="text-xs">
        <Save className="w-3 h-3 mr-1" />
        未保存
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="text-xs">
      <Save className="w-3 h-3 mr-1" />
      {lastSaveTime ? formatTimeAgo(lastSaveTime) : '已保存'}
    </Badge>
  );
});

AutoSaveIndicator.displayName = 'AutoSaveIndicator';
