import { useState } from 'react';
import { Home } from './components/Home';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ForgotPassword } from './components/ForgotPassword';
import { AnnotatorOnboarding } from './components/AnnotatorOnboarding';
import { ClientOnboarding } from './components/ClientOnboarding';
import { AnnotatorDashboard } from './components/AnnotatorDashboard';
import { ClientDashboard } from './components/ClientDashboard';
import { TaskFeed } from './components/TaskFeed';
import { TaskExecution } from './components/TaskExecution';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { LogOut } from 'lucide-react';

type AuthView = 'login' | 'register' | 'forgot-password';
type View = 'home' | 'annotator' | 'client';
type OnboardingStatus = 'not-started' | 'in-progress' | 'completed';

interface UserData {
  name: string;
  email: string;
  role: 'annotator' | 'client' | null;
  onboardingStatus: OnboardingStatus;
}

export default function App() {
  const [authView, setAuthView] = useState<AuthView>('login');
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    role: null,
    onboardingStatus: 'not-started',
  });

  const handleLogin = (role: 'annotator' | 'client') => {
    setIsAuthenticated(true);
    setUserData({
      name: 'Демо пользователь',
      email: 'demo@example.com',
      role,
      onboardingStatus: 'completed', // Skip onboarding for demo
    });
    setCurrentView(role);
  };

  const handleRegister = (role: 'annotator' | 'client', email: string, name: string) => {
    setUserData({
      name,
      email,
      role,
      onboardingStatus: 'in-progress',
    });
  };

  const handleOnboardingComplete = () => {
    setUserData({
      ...userData,
      onboardingStatus: 'completed',
    });
    setIsAuthenticated(true);
    setCurrentView(userData.role!);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData({
      name: '',
      email: '',
      role: null,
      onboardingStatus: 'not-started',
    });
    setCurrentView('home');
    setAuthView('login');
    setSelectedTask(null);
  };

  const handleTaskSelect = (task: any) => {
    setSelectedTask(task);
  };

  const handleBackToFeed = () => {
    setSelectedTask(null);
  };

  // Show onboarding if user registered but hasn't completed onboarding
  if (userData.onboardingStatus === 'in-progress') {
    if (userData.role === 'annotator') {
      return <AnnotatorOnboarding userName={userData.name} onComplete={handleOnboardingComplete} />;
    }
    if (userData.role === 'client') {
      return <ClientOnboarding userName={userData.name} onComplete={handleOnboardingComplete} />;
    }
  }

  // Show home screen first if not authenticated
  if (!isAuthenticated && !showAuth) {
    return <Home onViewChange={(view) => {
      setShowAuth(true);
      setAuthView('login');
    }} />;
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated && showAuth) {
    if (authView === 'login') {
      return <Login onLogin={handleLogin} onNavigate={setAuthView} />;
    }
    if (authView === 'register') {
      return <Register onRegister={handleRegister} onNavigate={setAuthView} />;
    }
    if (authView === 'forgot-password') {
      return <ForgotPassword onNavigate={setAuthView} />;
    }
  }

  // Main authenticated app
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white">S</span>
              </div>
              <span className="text-xl">Synapsis</span>
            </div>
            <div className="flex items-center gap-2">
              {userData.role === 'annotator' && (
                <Button
                  variant={currentView === 'annotator' ? 'default' : 'outline'}
                  onClick={() => {
                    setCurrentView('annotator');
                    setSelectedTask(null);
                  }}
                >
                  Мои задания
                </Button>
              )}
              {userData.role === 'client' && (
                <Button
                  variant={currentView === 'client' ? 'default' : 'outline'}
                  onClick={() => {
                    setCurrentView('client');
                    setSelectedTask(null);
                  }}
                >
                  Мои проекты
                </Button>
              )}
              <div className="h-6 w-px bg-gray-300 mx-2" />
              <div className="text-sm text-gray-600 px-2">
                {userData.name}
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {currentView === 'home' && <Home onViewChange={setCurrentView} />}
        
        {currentView === 'annotator' && userData.role === 'annotator' && (
          <div className="container mx-auto px-4 py-8">
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="dashboard">Личный кабинет</TabsTrigger>
                <TabsTrigger value="tasks">Лента заданий</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dashboard">
                <AnnotatorDashboard />
              </TabsContent>
              
              <TabsContent value="tasks">
                {selectedTask ? (
                  <TaskExecution task={selectedTask} onBack={handleBackToFeed} />
                ) : (
                  <TaskFeed onTaskSelect={handleTaskSelect} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {currentView === 'client' && userData.role === 'client' && (
          <ClientDashboard />
        )}
      </main>
    </div>
  );
}