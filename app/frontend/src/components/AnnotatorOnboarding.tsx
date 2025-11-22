import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Upload, X, CheckCircle2, GraduationCap, Briefcase, Award } from 'lucide-react';

interface AnnotatorOnboardingProps {
  userName: string;
  onComplete: () => void;
}

export function AnnotatorOnboarding({ userName, onComplete }: AnnotatorOnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    education: '',
    experience: '',
    expertise: [] as string[],
    portfolio: '',
    bio: '',
  });
  const [selectedExpertise, setSelectedExpertise] = useState('');
  const [testAnswers, setTestAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const expertiseOptions = [
    'Медицинская визуализация',
    'Медицинская терминология',
    'КТ диагностика',
    'Юриспруденция',
    'Лингвистика',
    'Обработка естественного языка',
    'Компьютерное зрение',
    'Аудио разметка',
    'Финансовая аналитика',
  ];

  const testQuestions = [
    {
      id: 1,
      question: 'Что означает термин "сегментация" в контексте разметки изображений?',
      options: [
        'Разделение изображения на части',
        'Выделение границ объектов на изображении',
        'Классификация изображений по категориям',
        'Изменение размера изображения',
      ],
      correct: 1,
    },
    {
      id: 2,
      question: 'Для чего используется bounding box при разметке данных?',
      options: [
        'Для выделения прямоугольной области вокруг объекта',
        'Для изменения цвета объекта',
        'Для удаления фона',
        'Для масштабирования изображения',
      ],
      correct: 0,
    },
    {
      id: 3,
      question: 'Что такое кросс-валидация в контексте разметки данных?',
      options: [
        'Удаление дубликатов',
        'Проверка данных несколькими специалистами',
        'Автоматическая разметка',
        'Сжатие данных',
      ],
      correct: 1,
    },
  ];

  const addExpertise = () => {
    if (selectedExpertise && !formData.expertise.includes(selectedExpertise)) {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, selectedExpertise],
      });
      setSelectedExpertise('');
    }
  };

  const removeExpertise = (item: string) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter((e) => e !== item),
    });
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const progress = (step / 2) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div>
              <CardTitle>Анкета исполнителя</CardTitle>
              <CardDescription>Привет, {userName}! Расскажите о себе</CardDescription>
            </div>
            <Badge variant="outline">Шаг {step} из 2</Badge>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent>
          {/* Step 1: Education & Experience */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h3>Образование и опыт</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Образование</Label>
                <Input
                  id="education"
                  placeholder="Например: МГУ, Факультет биологии, Магистр"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Опыт работы (лет)</Label>
                <Select
                  value={formData.experience}
                  onValueChange={(value: string) => setFormData({ ...formData, experience: value })}
                >
                  <SelectTrigger id="experience">
                  <SelectValue placeholder="Выберите опыт" />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="0">Без опыта</SelectItem>
                  <SelectItem value="1">Менее 1 года</SelectItem>
                  <SelectItem value="2">1-2 года</SelectItem>
                  <SelectItem value="3">3-5 лет</SelectItem>
                  <SelectItem value="5">Более 5 лет</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">О себе</Label>
                <Textarea
                  id="bio"
                  placeholder="Расскажите о вашем опыте и навыках..."
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNext} disabled={!formData.education || !formData.experience}>
                  Далее
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Expertise */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-blue-600" />
                <h3>Области экспертизы</h3>
              </div>

              <div className="space-y-2">
                <Label>Выберите ваши специализации</Label>
                <div className="flex gap-2">
                  <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Выберите специализацию" />
                    </SelectTrigger>
                    <SelectContent>
                      {expertiseOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addExpertise} disabled={!selectedExpertise}>
                    Добавить
                  </Button>
                </div>
              </div>

              {formData.expertise.length > 0 && (
                <div className="space-y-2">
                  <Label>Выбранные специализации:</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.expertise.map((item) => (
                      <Badge key={item} variant="secondary" className="flex items-center gap-1">
                        {item}
                        <button
                          onClick={() => removeExpertise(item)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="portfolio">Портфолио (опционально)</Label>
                <Input
                  id="portfolio"
                  type="url"
                  placeholder="https://your-portfolio.com"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                />
                <p className="text-sm text-gray-500">
                  Ссылка на ваше портфолио или резюме
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Загрузите документы, подтверждающие квалификацию
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Дипломы, сертификаты, рекомендательные письма (опционально)
                </p>
                <Button variant="outline" size="sm">
                  Выбрать файлы
                </Button>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Назад
                </Button>
                <Button onClick={handleSubmit} className="flex-1" disabled={formData.expertise.length === 0 || isLoading}>
                  {isLoading ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    'Завершить регистрацию'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Removed Step 3: Knowledge Test */}
          {step === 3 && step > 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h3>Тест на знания</h3>
              </div>

              <Alert>
                <AlertDescription>
                  Ответьте на несколько вопросов, чтобы подтвердить базовые знания в области разметки данных
                </AlertDescription>
              </Alert>

              <div className="space-y-6">
                {testQuestions.map((q, index) => (
                  <Card key={q.id}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Вопрос {index + 1}. {q.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {q.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              testAnswers[q.id] === option
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setTestAnswers({ ...testAnswers, [q.id]: option })}
                          >
                            <Label className="cursor-pointer flex items-center gap-2">
                              <input
                                type="radio"
                                name={`question-${q.id}`}
                                checked={testAnswers[q.id] === option}
                                onChange={() => {}}
                                className="cursor-pointer"
                              />
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Назад
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={Object.keys(testAnswers).length !== testQuestions.length || isLoading}
                >
                  {isLoading ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    'Завершить регистрацию'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
