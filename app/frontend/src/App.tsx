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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { LogOut, Plus, DollarSign } from 'lucide-react';

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
  balance?: number;
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
    balance: 0,
  });
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Update URL based on auth state
  useEffect(() => {
    if (isAuthenticated && (currentView === 'executor' || currentView === 'provider')) {
      window.history.pushState(null, '', '/dashboard');
    } else if (!isAuthenticated && !isCheckingAuth) {
      window.history.pushState(null, '', '/');
    }
  }, [isAuthenticated, currentView, isCheckingAuth]);

  const refreshBalance = async () => {
    try {
      const response = await fetch('http://localhost:8000/users/balance', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUserData(prev => ({ ...prev, balance: data.balance }));
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

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
            balance: data.balance,
          };

          setIsAuthenticated(true);
          setUserData(user);
          refreshBalance(); // Fetch specifically from balance endpoint as requested

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

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsToppingUp(true);
    try {
      const response = await fetch('http://localhost:8000/users/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(prev => ({ ...prev, balance: data.new_balance }));
        setShowTopUpDialog(false);
        setTopUpAmount('');
      } else {
        const err = await response.json();
        alert(err.detail || 'Ошибка при пополнении');
      }
    } catch (error) {
      console.error('Top up failed:', error);
    } finally {
      setIsToppingUp(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) return;
    if (amount > (userData.balance || 0)) {
      alert('Недостаточно средств на балансе');
      return;
    }

    setIsWithdrawing(true);
    try {
      const response = await fetch('http://localhost:8000/users/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(prev => ({ ...prev, balance: data.new_balance }));
        setShowWithdrawDialog(false);
        setWithdrawAmount('');
      } else {
        const err = await response.json();
        alert(err.detail || 'Ошибка при выводе средств');
      }
    } catch (error) {
      console.error('Withdrawal failed:', error);
    } finally {
      setIsWithdrawing(false);
    }
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
                <div className="flex items-center gap-4 mr-4">
                  <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <span>{userData.balance?.toLocaleString() || '0'}₽</span>
                  </div>
                  <Dialog open={showTopUpDialog} onOpenChange={setShowTopUpDialog}>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Пополнить баланс
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[380px]">
                      <DialogHeader className="text-center">
                        <DialogTitle className="text-xl">Пополнение баланса</DialogTitle>
                        <DialogDescription className="text-gray-500">
                          Введите сумму для зачисления на счет
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col gap-4 py-4 text-center">
                        <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                          Сумма пополнения
                        </Label>
                        <Input
                          id="amount"
                          type="number"
                          value={topUpAmount}
                          onChange={(e) => setTopUpAmount(e.target.value)}
                          className="text-center text-lg h-12"
                          placeholder="0.00 ₽"
                        />
                      </div>
                      <DialogFooter className="sm:justify-center">
                        <Button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700 w-full h-11 text-lg"
                          onClick={handleTopUp}
                          disabled={isToppingUp || !topUpAmount}
                        >
                          {isToppingUp ? 'Зачисление...' : 'Зачислить'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
              {userData.role === 'executor' && (
                <div className="flex items-center gap-4 mr-4">
                  <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <span>{userData.balance?.toLocaleString() || '0'}₽</span>
                  </div>
                  <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
                    <DialogTrigger asChild>
                      <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Вывести деньги
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[380px]">
                      <DialogHeader className="text-center">
                        <DialogTitle className="text-xl">Вывод средств</DialogTitle>
                        <DialogDescription className="text-gray-500">
                          Введите сумму для вывода на ваш счет
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex flex-col gap-4 py-4 text-center">
                        <Label htmlFor="withdraw-amount" className="text-sm font-medium text-gray-700">
                          Сумма вывода
                        </Label>
                        <Input
                          id="withdraw-amount"
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="text-center text-lg h-12"
                          placeholder="0.00 ₽"
                        />
                        <p className="text-xs text-gray-500">Доступно: {userData.balance?.toLocaleString()} ₽</p>
                      </div>
                      <DialogFooter className="sm:justify-center">
                        <Button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700 w-full h-11 text-lg"
                          onClick={handleWithdraw}
                          disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) > (userData.balance || 0)}
                        >
                          {isWithdrawing ? 'Обработка...' : 'Вывести'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
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
                <AnnotatorDashboard userName={userData.name} userId={userData.id} refreshBalance={refreshBalance} />
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
          <ClientDashboard userName={userData.name} userId={userData.id} refreshBalance={refreshBalance} />
        )}
      </main>
    </div>
  );
}