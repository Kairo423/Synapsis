import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

interface ForgotPasswordProps {
  onNavigate: (view: 'login') => void;
}

export function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (email) {
        setIsSubmitted(true);
      } else {
        setError('Пожалуйста, введите email');
      }
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
          <CardTitle className="text-2xl text-center">Восстановление пароля</CardTitle>
          <CardDescription className="text-center">
            {isSubmitted
              ? 'Проверьте вашу почту'
              : 'Введите email для восстановления доступа'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitted ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <Alert>
                <AlertDescription className="text-center">
                  Мы отправили инструкции по восстановлению пароля на адрес{' '}
                  <strong>{email}</strong>
                </AlertDescription>
              </Alert>
              <p className="text-sm text-gray-600 text-center">
                Письмо может занять несколько минут. Проверьте также папку "Спам".
              </p>
              <Button onClick={() => onNavigate('login')} className="w-full">
                Вернуться к входу
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Отправка...' : 'Отправить инструкции'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => onNavigate('login')}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад к входу
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
