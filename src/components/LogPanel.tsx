import { memo } from 'react';
import { useGameStore } from '../store/useGameStore';
import { getLogTypeColor, formatLogTimestamp } from '../utils/formatters';
import { cn } from '../utils/cn';

const LogEntry = memo(({ log }: { log: { id: string; timestamp: Date; message: string; type: string } }) => (
  <div
    className={cn(
      'text-sm p-2 rounded',
      'bg-gray-100 dark:bg-gray-800/50',
      'border-l-2',
      log.type === 'danger' && 'border-red-500',
      log.type === 'warning' && 'border-yellow-500',
      log.type === 'success' && 'border-green-500',
      log.type === 'info' && 'border-blue-500'
    )}
  >
    <div className="flex items-start gap-2">
      <span className="text-xs text-gray-500 flex-shrink-0">{formatLogTimestamp(log.timestamp)}</span>
      <span className={cn('flex-1', getLogTypeColor(log.type))}>{log.message}</span>
    </div>
  </div>
));

LogEntry.displayName = 'LogEntry';

export const LogPanel = memo(() => {
  const logs = useGameStore((state) => state.logs);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 h-full flex flex-col shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">日志</h2>
        <span className="text-xs text-gray-600 dark:text-gray-500">{logs.length} 条记录</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-2 pr-2">
        {logs.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-600 text-sm text-center py-8">
            游戏开始后，这里将显示事件记录...
          </div>
        ) : (
          <div className="space-y-2">
            {logs.slice(-20).map((log) => <LogEntry key={log.id} log={log} />)}
          </div>
        )}
      </div>
    </div>
  );
});

LogPanel.displayName = 'LogPanel';
