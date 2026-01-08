import { memo, useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { getLogTypeColor, formatLogTimestamp } from '../utils/formatters';
import { cn } from '../utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

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
  const [logs, setLogs] = useState<Array<{ id: string; timestamp: Date; message: string; type: string }>>([]);
  const lastLogIdRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isMountedRef.current) return;

      const state = useGameStore.getState();
      const newLogs = state.logs.slice(-20); // Only keep last 20 logs

      // Only update if logs actually changed
      const newLastLogId = newLogs.length > 0 ? newLogs[newLogs.length - 1].id : null;
      if (newLastLogId !== lastLogIdRef.current) {
        lastLogIdRef.current = newLastLogId;
        setLogs(newLogs);
      }
    }, 200);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>日志</CardTitle>
          <span className="text-xs text-gray-600 dark:text-gray-500">{logs.length} 条记录</span>
        </div>
      </CardHeader>

      <CardContent className="p-0 h-full">
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {logs.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-600 text-sm text-center py-8">
              游戏开始后，这里将显示事件记录...
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => <LogEntry key={log.id} log={log} />)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

LogPanel.displayName = 'LogPanel';
