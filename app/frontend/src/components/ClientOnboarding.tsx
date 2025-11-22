import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Building2, Users, Target, CheckCircle2 } from 'lucide-react';

interface ClientOnboardingProps {
  userName: string;
  onComplete: () => void;
}

export function ClientOnboarding({ userName, onComplete }: ClientOnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    role: '',
    website: '',
    description: '',
    goals: '',
    dataTypes: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);

  const dataTypeOptions = [
    { id: 'images', label: 'Изображения' },
    { id: 'text', label: 'Текст' },
    { id: 'audio', label: 'Аудио' },
    { id: 'video', label: 'Видео' },
  ];

  const toggleDataType = (typeId: string) => {
    if (formData.dataTypes.includes(typeId)) {
      setFormData({
        ...formData,
        dataTypes: formData.dataTypes.filter((t) => t !== typeId),
      });
    } else {
      setFormData({
        ...formData,
        dataTypes: [...formData.dataTypes, typeId],
      });
    }
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
              <CardTitle>Анкета поставщика</CardTitle>
              <CardDescription>Привет, {userName}! Расскажите о вашей компании</CardDescription>
            </div>
            <Badge variant="outline">Шаг {step} из 2</Badge>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent>
          {/* Step 1: Company Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3>Информация о компании</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Название компании</Label>
                <Input
                  id="companyName"
                  placeholder="ООО 'Технологии ИИ'"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Отрасль</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value: string) => setFormData({ ...formData, industry: value })}
                >
                  <SelectTrigger id="industry">
                  <SelectValue placeholder="Выберите отрасль" />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="healthcare">Здравоохранение</SelectItem>
                  <SelectItem value="finance">Финансы</SelectItem>
                  <SelectItem value="retail">Розничная торговля</SelectItem>
                  <SelectItem value="tech">Технологии</SelectItem>
                  <SelectItem value="education">Образование</SelectItem>
                  <SelectItem value="legal">Юриспруденция</SelectItem>
                  <SelectItem value="research">Научные исследования</SelectItem>
                  <SelectItem value="other">Другое</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Ваша должность</Label>
                <Input
                  id="role"
                  placeholder="Например: Data Scientist, ML Engineer, CTO"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Веб-сайт (опционально)</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://your-company.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание компании</Label>
                <Textarea
                  id="description"
                  placeholder="Расскажите о вашей компании и сфере деятельности..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleNext}
                  disabled={!formData.companyName || !formData.industry}
                >
                  Далее
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Project Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-blue-600" />
                <h3>Цели и задачи</h3>
              </div>

              <div className="space-y-2">
                <Label>Типы данных для разметки</Label>
                <div className="grid md:grid-cols-2 gap-3">
                  {dataTypeOptions.map((type) => (
                    <div
                      key={type.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.dataTypes.includes(type.id)
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleDataType(type.id)}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.dataTypes.includes(type.id)}
                          onChange={() => {}}
                          className="cursor-pointer"
                        />
                        <Label className="cursor-pointer">{type.label}</Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">Цели использования платформы</Label>
                <Textarea
                  id="goals"
                  placeholder="Опишите, какие задачи вы планируете решать с помощью нашей платформы..."
                  rows={5}
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                />
                <p className="text-sm text-gray-500">
                  Это поможет нам подобрать наиболее подходящих исполнителей для ваших проектов
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="mb-1">Следующий шаг</h4>
                    <p className="text-sm text-gray-600">
                      После завершения регистрации вы сможете создать свой первый проект и начать работу с исполнителями.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Назад
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={formData.dataTypes.length === 0 || !formData.goals || isLoading}
                >
                  {isLoading ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2 animate-spin" />
                      Завершение...
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
