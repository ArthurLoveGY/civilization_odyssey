import { memo, useState } from 'react';
import { useGameLoop } from './hooks/useGameLoop';
import { ThemeProvider } from './contexts/ThemeContext';
import { GameUIProvider } from './contexts/GameUIContext';
import { SeasonDisplay } from './components/SeasonDisplay';
import { LogPanel } from './components/LogPanel';
import { GameControls } from './components/GameControls';
import { ThemeToggle } from './components/ThemeToggle';
import { ResourcePanel } from './components/ResourcePanel';
import { FoodStatusPanel } from './components/FoodStatusPanel';
import { BonfirePanel } from './components/BonfirePanel';
import { ActionPanel } from './components/ActionPanel';
import { BuildingsPanel } from './components/BuildingsPanel';
import { TechTreePanel } from './components/TechTreePanel';
import { TribalManagementPanel } from './components/TribalManagementPanel';
import { PopulationInfo } from './components/PopulationInfo';
import { MobileResourceBar } from './components/MobileResourceBar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/Tabs';
import { Home, Users, Hammer, Lightbulb } from 'lucide-react';

const AppContent = memo(() => {
  useGameLoop();
  const [activeTab, setActiveTab] = useState('camp');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1800px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  文明：奥德赛
                </h1>
                <p className="text-gray-600 dark:text-gray-500 text-xs">Era 1: 部落时代</p>
              </div>
              <SeasonDisplay />
            </div>
            <div className="flex items-center gap-3">
              <GameControls />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Resource Bar */}
      <MobileResourceBar />

      {/* Main Content - Holy Grail Layout */}
      <main className="max-w-[1800px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Resources (Desktop Sticky) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              <ResourcePanel />
              <FoodStatusPanel />
            </div>
          </aside>

          {/* Center Stage - Tab System */}
          <section className="lg:col-span-6">
            <Tabs defaultValue="camp" value={activeTab} onValueChange={setActiveTab}>
              {/* Desktop Tabs */}
              <div className="hidden lg:block">
                <TabsList>
                  <TabsTrigger value="camp" icon={<Home className="w-4 h-4" />}>
                    营地
                  </TabsTrigger>
                  <TabsTrigger value="tribe" icon={<Users className="w-4 h-4" />}>
                    部落
                  </TabsTrigger>
                  <TabsTrigger value="build" icon={<Hammer className="w-4 h-4" />}>
                    建设
                  </TabsTrigger>
                  <TabsTrigger value="science" icon={<Lightbulb className="w-4 h-4" />}>
                    知识
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Contents */}
              <div className="space-y-4">
                {/* Camp Tab */}
                <TabsContent value="camp">
                  <div className="space-y-4">
                    <BonfirePanel />
                    <ActionPanel />
                  </div>
                </TabsContent>

                {/* Tribe Tab */}
                <TabsContent value="tribe">
                  <div className="space-y-4">
                    <TribalManagementPanel />
                    <div className="lg:hidden">
                      <PopulationInfo />
                    </div>
                  </div>
                </TabsContent>

                {/* Build Tab */}
                <TabsContent value="build">
                  <BuildingsPanel />
                </TabsContent>

                {/* Science Tab */}
                <TabsContent value="science">
                  <TechTreePanel />
                </TabsContent>
              </div>
            </Tabs>
          </section>

          {/* Right Sidebar - Log & Population (Desktop Sticky) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              <PopulationInfo />
              <div className="max-h-[calc(100vh-200px)]">
                <LogPanel />
              </div>
            </div>
          </aside>

          {/* Mobile Log Panel (Below tabs) */}
          <div className="lg:hidden col-span-1">
            <div className="space-y-4">
              <PopulationInfo />
              <LogPanel />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 border-t border-neutral-800">
        <div className="grid grid-cols-4 gap-1 p-2">
          <button
            onClick={() => setActiveTab('camp')}
            className={cn(
              'flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all',
              activeTab === 'camp'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-neutral-800'
            )}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">营地</span>
          </button>

          <button
            onClick={() => setActiveTab('tribe')}
            className={cn(
              'flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all',
              activeTab === 'tribe'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-neutral-800'
            )}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">部落</span>
          </button>

          <button
            onClick={() => setActiveTab('build')}
            className={cn(
              'flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all',
              activeTab === 'build'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-neutral-800'
            )}
          >
            <Hammer className="w-5 h-5" />
            <span className="text-xs">建设</span>
          </button>

          <button
            onClick={() => setActiveTab('science')}
            className={cn(
              'flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all',
              activeTab === 'science'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-neutral-800'
            )}
          >
            <Lightbulb className="w-5 h-5" />
            <span className="text-xs">知识</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <footer className="max-w-[1800px] mx-auto mt-8 px-4 text-center text-gray-500 dark:text-gray-600 text-xs pb-20 lg:pb-0">
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

// Helper function for cn
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
