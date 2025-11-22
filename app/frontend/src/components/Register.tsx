import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Eye, EyeOff, Lock, Mail, User, Briefcase, Users } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface RegisterProps {
  onRegister: (role: 'annotator' | 'client', email: string, name: string) => void;
  onNavigate: (view: 'login') => void;
}

export function Register({ onRegister, onNavigate }: RegisterProps) {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'annotator' | 'client'>('annotator');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSubmit = () => {
    setStep(2);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      onRegister(role, formData.email, formData.name);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">S</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Регистрация</CardTitle>
          <CardDescription className="text-center">
            {step === 1 ? 'Выберите тип аккаунта' : 'Заполните данные для регистрации'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <div className="space-y-6">
              <RadioGroup value={role} onValueChange={(value: string) => setRole(value as 'annotator' | 'client')}>
                <div
                  className={`relative flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                    role === 'annotator' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setRole('annotator')}
                >
                  <RadioGroupItem value="annotator" id="annotator" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="annotator" className="flex items-center gap-2 cursor-pointer">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span>Исполнитель</span>
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Выполняйте задания по разметке данных и зарабатывайте
                    </p>
                  </div>
                </div>

                <div
                  className={`relative flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                    role === 'client' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setRole('client')}
                >
                  <RadioGroupItem value="client" id="client" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="client" className="flex items-center gap-2 cursor-pointer">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      <span>Поставщик</span>
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Размещайте задания и получайте качественную разметку данных
                    </p>
                  </div>
                </div>
              </RadioGroup>

              <Button onClick={handleRoleSubmit} className="w-full">
                Продолжить
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Уже есть аккаунт?{' '}
                  <button
                    onClick={() => onNavigate('login')}
                    className="text-blue-600 hover:underline"
                  >
                    Войти
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Полное имя</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Иван Иванов"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-9 pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3">
                  Назад
                </Button>
                <Button type="submit" className="w-2/3" disabled={isLoading}>
                  {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
