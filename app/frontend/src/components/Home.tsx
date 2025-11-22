import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Users, Briefcase, Shield, TrendingUp, Clock, Award } from 'lucide-react';

interface HomeProps {
  onViewChange: (view: 'annotator' | 'client') => void;
}

export function Home({ onViewChange }: HomeProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Logo and Brand */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-2xl">S</span>
        </div>
        <h1 className="text-blue-600">Synapsis</h1>
      </div>
      
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="mb-4 text-blue-600">
          Платформа для разметки данных и обучения ИИ
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Соединяем поставщиков данных с профессиональными разметчиками для создания качественных датасетов для машинного обучения
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Button size="lg" onClick={() => onViewChange('annotator')}>
            Стать исполнителем
          </Button>
          <Button size="lg" onClick={() => onViewChange('client')}>
            Разместить задание
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <Card>
          <CardHeader>
            <Users className="w-12 h-12 text-blue-600 mb-4" />
            <CardTitle>Для исполнителей</CardTitle>
            <CardDescription>
              Зарабатывайте на разметке данных, работая удаленно с гибким графиком
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li>• Верификация экспертизы</li>
              <li>• Система рейтингов</li>
              <li>• Прозрачные выплаты</li>
              <li>• Разнообразие заданий</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Briefcase className="w-12 h-12 text-blue-600 mb-4" />
            <CardTitle>Для поставщиков</CardTitle>
            <CardDescription>
              Получите качественную разметку данных от проверенных специалистов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li>• Контроль качества</li>
              <li>• Кросс-валидация</li>
              <li>• Гибкая настройка ТЗ</li>
              <li>• Аналитика в реальном времени</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="w-12 h-12 text-blue-600 mb-4" />
            <CardTitle>Безопасность</CardTitle>
            <CardDescription>
              Защита данных и конфиденциальности на всех уровнях
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li>• Шифрование данных</li>
              <li>• NDA для исполнителей</li>
              <li>• Защищенные транзакции</li>
              <li>• Модерация контента</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="bg-blue-50 rounded-2xl p-8 mb-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-8 h-8 text-blue-600 mr-2" />
              <span className="text-4xl text-blue-600">10,000+</span>
            </div>
            <p className="text-gray-600">Выполненных заданий</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-2">
              <Users className="w-8 h-8 text-blue-600 mr-2" />
              <span className="text-4xl text-blue-600">1,500+</span>
            </div>
            <p className="text-gray-600">Верифицированных исполнителей</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-2">
              <Award className="w-8 h-8 text-blue-600 mr-2" />
              <span className="text-4xl text-blue-600">98%</span>
            </div>
            <p className="text-gray-600">Качество разметки</p>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="mb-16">
        <h2 className="text-center mb-12">Как это работает</h2>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* For Annotators */}
          <div>
            <h3 className="mb-6 text-blue-600">Для исполнителей</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  1
                </div>
                <div>
                  <h4 className="mb-1">Регистрация и верификация</h4>
                  <p className="text-gray-600">Заполните анкету, пройдите тест по вашей специализации</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  2
                </div>
                <div>
                  <h4 className="mb-1">Выберите задание</h4>
                  <p className="text-gray-600">Найдите подходящее задание в ленте с фильтрами</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  3
                </div>
                <div>
                  <h4 className="mb-1">Выполните разметку</h4>
                  <p className="text-gray-600">Используйте встроенные инструменты для разметки</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  4
                </div>
                <div>
                  <h4 className="mb-1">Получите оплату</h4>
                  <p className="text-gray-600">После проверки деньги поступят на ваш счет</p>
                </div>
              </div>
            </div>
          </div>

          {/* For Clients */}
          <div>
            <h3 className="mb-6 text-blue-600">Для поставщиков</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  1
                </div>
                <div>
                  <h4 className="mb-1">Создайте проект</h4>
                  <p className="text-gray-600">Опишите задачу, загрузите данные и инструкции</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  2
                </div>
                <div>
                  <h4 className="mb-1">Настройте требования</h4>
                  <p className="text-gray-600">Укажите специализацию, уровень экспертизы, контроль качества</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  3
                </div>
                <div>
                  <h4 className="mb-1">Отслеживайте прогресс</h4>
                  <p className="text-gray-600">Мониторинг в реальном времени через дашборд</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  4
                </div>
                <div>
                  <h4 className="mb-1">Проверьте результаты</h4>
                  <p className="text-gray-600">Автоматическая или ручная проверка качества</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-blue-600 text-white rounded-2xl p-12 text-center">
        <h2 className="mb-4 text-white">Готовы начать?</h2>
        <p className="text-xl mb-8 opacity-90">
          Присоединяйтесь к нашей платформе уже сегодня
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" variant="secondary" onClick={() => onViewChange('annotator')}>
            Демо: Исполнитель
          </Button>
          <Button size="lg" variant="secondary" onClick={() => onViewChange('client')}>
            Демо: Поставщик
          </Button>
        </div>
      </div>
    </div>
  );
}