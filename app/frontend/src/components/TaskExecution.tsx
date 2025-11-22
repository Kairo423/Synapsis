import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { ArrowLeft, Clock, Upload, Save, Send, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface TaskExecutionProps {
  task: any;
  onBack: () => void;
}

export function TaskExecution({ task, onBack }: TaskExecutionProps) {
  const [selectedAreas, setSelectedAreas] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [progress, setProgress] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDrawing) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setSelectedAreas(prev => prev + 1);
      setProgress(Math.min((selectedAreas + 1) * 10, 100));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к ленте
        </Button>
      </div>

      {/* Task Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{task.title}</CardTitle>
              <CardDescription className="mt-2">{task.description}</CardDescription>
            </div>
            <Badge className="bg-blue-600">В работе</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 py-3 border-y border-gray-200">
            <div>
              <div className="text-sm text-gray-600">Вознаграждение</div>
              <div>{task.reward}₽</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Срок сдачи</div>
              <div>{task.deadline}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Оценочное время</div>
              <div>{task.estimatedTime}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Прогресс</div>
              <div>{progress}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Инструкции по выполнению</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Важные требования</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Отметьте все видимые патологии на снимке</li>
                <li>Используйте точные границы для выделения областей</li>
                <li>Добавьте комментарии для неоднозначных случаев</li>
                <li>Проверьте все области перед отправкой</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Annotation Tool */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Инструмент разметки</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={isDrawing ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsDrawing(!isDrawing)}
              >
                {isDrawing ? 'Режим разметки активен' : 'Включить разметку'}
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Загрузить снимок
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mock Image Canvas */}
          <div
            className="relative bg-gray-100 rounded-lg overflow-hidden cursor-crosshair border-2 border-dashed border-gray-300"
            style={{ height: '400px' }}
            onClick={handleImageClick}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="mb-2">Рентгеновский снимок грудной клетки</div>
                <div className="text-sm">
                  {isDrawing ? 'Кликните для добавления меток' : 'Включите режим разметки'}
                </div>
                {selectedAreas > 0 && (
                  <div className="mt-4">
                    <Badge variant="outline">Отмечено областей: {selectedAreas}</Badge>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mock annotation markers */}
            {Array.from({ length: selectedAreas }).map((_, i) => (
              <div
                key={i}
                className="absolute w-16 h-16 border-2 border-red-500 rounded-full bg-red-500/10"
                style={{
                  top: `${20 + (i * 15)}%`,
                  left: `${30 + (i * 10)}%`,
                }}
              >
                <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Область {i + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Прогресс выполнения</span>
              <span className="text-sm">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Комментарии и заметки</CardTitle>
          <CardDescription>
            Добавьте дополнительные пояснения к вашей разметке
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Опишите обнаруженные патологии, сложности или уточнения..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onBack}>
              Отменить
            </Button>
            <Button variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Сохранить черновик
            </Button>
            <Button disabled={progress < 100}>
              <Send className="w-4 h-4 mr-2" />
              Отправить на проверку
            </Button>
          </div>
          {progress < 100 && (
            <p className="text-sm text-gray-500 text-right mt-2">
              Завершите разметку для отправки (минимум 10 областей)
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
