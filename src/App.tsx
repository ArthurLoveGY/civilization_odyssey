import { memo } from 'react';
import { useGameLoop } from './hooks/useGameLoop';
import { ThemeProvider } from './contexts/ThemeContext';
import { GameUIProvider } from './contexts/GameUIContext';
import { SeasonDisplay } from './components/SeasonDisplay';
import { LogPanel } from './components/LogPanel';
import { GameControls } from './components/GameControls';
import { ThemeToggle } from './components/ThemeToggle';
import { CompactDashboard } from './components/CompactDashboard';
import { CompactActions } from './components/CompactActions';
import { TechTreePanel } from './components/TechTreePanel';
import { FoodStatusPanel } from './components/FoodStatusPanel';
import { BonfirePanel } from './components/BonfirePanel';

const AppContent = memo(() => {
  useGameLoop();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-4 transition-colors duration-300">
      {/* Header */}
      <header className="max-w-[1800px] mx-auto mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              文明：奥德赛
            </h1>
            <p className="text-gray-600 dark:text-gray-500 text-xs mt-1">Era 1: 部落时代</p>
          </div>
          <div className="flex items-center gap-3">
            <GameControls />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Season Display */}
      <div className="max-w-[1800px] mx-auto mb-4">
        <SeasonDisplay />
      </div>

      {/* Main Content - Single Screen Layout */}
      <main className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Quick Status (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <FoodStatusPanel />
            <BonfirePanel />
          </div>

          {/* Center Column: Dashboard & Actions (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Compact Dashboard - Resources, Workers, Bonfire */}
            <CompactDashboard />

            {/* Manual Actions & Quick Buildings */}
            <CompactActions />
          </div>

          {/* Right Column: Tech & Logs (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <TechTreePanel />
            <LogPanel />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-[1800px] mx-auto mt-6 text-center text-gray-500 dark:text-gray-600 text-xs">
        <p>10 TPS | Fixed Time Step | Decimal.js Precision | Sprint 1: 进阶生存</p>
      </footer>
    </div>
  );
});

AppContent.displayName = 'AppContent';

const App = () => {
  return (
    <ThemeProvider>
      <GameUIProvider updateInterval={100}>
        <AppContent />
      </GameUIProvider>
    </ThemeProvider>
  );
};

export default App;
