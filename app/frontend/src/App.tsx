import { useState, useEffect } from 'react';
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
type View = 'home' | 'executor' | 'provider';
type OnboardingStatus = 'not-started' | 'in-progress' | 'completed';

export interface UserData {
  id?: number;
  name: string;
  email: string;
  role: 'executor' | 'provider' | 'admin' | null;
  onboardingStatus: OnboardingStatus;
  access_token?: string;
}

export default function App() {
  const [authView, setAuthView] = useState<AuthView>('login');
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    role: null,
    onboardingStatus: 'not-started',
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:8000/auth/me', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          const user: UserData = {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            onboardingStatus: 'completed',
          };

          setIsAuthenticated(true);
          setUserData(user);

          if (data.role === 'executor') {
            setCurrentView('executor');
          } else if (data.role === 'provider') {
            setCurrentView('provider');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (data: UserData) => {
    setIsAuthenticated(true);
    setUserData({
      ...data,
      onboardingStatus: 'completed', // Assuming API returns active users
    });
    if (data.role === 'executor') {
      setCurrentView('executor');
    } else if (data.role === 'provider') {
      setCurrentView('provider');
    } else {
      setCurrentView('home');
    }
  };

  const handleRegisterSuccess = () => {
    setAuthView('login');
  };

  const handleOnboardingComplete = () => {
    setUserData({
      ...userData,
      onboardingStatus: 'completed',
    });
    setIsAuthenticated(true);
    if (userData.role === 'executor') setCurrentView('executor');
    if (userData.role === 'provider') setCurrentView('provider');
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/users/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }

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

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show onboarding if user registered but hasn't completed onboarding, though this logic might need backend support later
  if (userData.onboardingStatus === 'in-progress') {
    if (userData.role === 'executor') {
      return <AnnotatorOnboarding userName={userData.name} onComplete={handleOnboardingComplete} />;
    }
    if (userData.role === 'provider') {
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
      return <Register onRegisterSuccess={handleRegisterSuccess} onNavigate={setAuthView} />;
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

              {userData.role === 'provider' && (
                <Button
                  variant={currentView === 'provider' ? 'default' : 'outline'}
                  onClick={() => {
                    setCurrentView('provider');
                    setSelectedTask(null);
                  }}
                >
                  Мои проекты
                </Button>
              )}

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
        {currentView === 'home' && <Home onViewChange={setCurrentView as any} />}

        {currentView === 'executor' && userData.role === 'executor' && (
          <div className="container mx-auto px-4 py-8">
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="dashboard">Личный кабинет</TabsTrigger>
                <TabsTrigger value="tasks">Лента заданий</TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <AnnotatorDashboard userName={userData.name} userId={userData.id} />
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

        {currentView === 'provider' && userData.role === 'provider' && (
          <ClientDashboard />
        )}
      </main>
    </div>
  );
}