import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { ArrowLeft, CheckCircle2, XCircle, Star } from 'lucide-react';

interface SubmissionReviewProps {
  submission: {
    id: number;
    annotator: string;
    task: string;
    submittedAt: string;
    rating: number;
  };
  onBack: () => void;
  onAccept: () => void;
  onReject: () => void;
}

export function SubmissionReview({ submission, onBack, onAccept, onReject }: SubmissionReviewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к списку
        </Button>
      </div>

      {/* Submission Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{submission.task}</CardTitle>
              <CardDescription className="mt-2">
                Исполнитель: {submission.annotator} • Рейтинг: ⭐ {submission.rating}
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-yellow-50">
              На проверке
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 py-3 border-y border-gray-200">
            <div>
              <div className="text-sm text-gray-600">Дата отправки</div>
              <div>{submission.submittedAt}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">ID работы</div>
              <div>#{submission.id.toString().padStart(6, '0')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Result Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Результат разметки</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mock annotation result */}
          <div className="bg-gray-100 rounded-lg p-8 mb-4">
            <div className="text-center text-gray-500 mb-4">
              Пример результата разметки
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-gray-300">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                  <span>Область 1: Патология обнаружена</span>
                  <Badge variant="outline" className="bg-blue-100">Размечено</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                  <span>Область 2: Нормальная ткань</span>
                  <Badge variant="outline" className="bg-blue-100">Размечено</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                  <span>Область 3: Патология обнаружена</span>
                  <Badge variant="outline" className="bg-blue-100">Размечено</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                  <span>Всего размечено областей: 12</span>
                  <Badge variant="outline" className="bg-green-100">✓ Выполнено</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Annotator Notes */}
          <div className="space-y-2">
            <Label>Комментарии исполнителя</Label>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">
                Выполнена разметка всех видимых патологий. В областях 1 и 3 обнаружены признаки воспаления.
                Все границы выделены с максимальной точностью согласно инструкциям.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Оценка качества</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rating">Оценка работы</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="feedback">Комментарий (опционально)</Label>
              <Textarea
                id="feedback"
                placeholder="Оставьте отзыв о качестве выполненной работы..."
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onBack}>
              Отменить
            </Button>
            <Button 
              variant="outline" 
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={onReject}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Вернуть на доработку
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={onAccept}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Принять работу
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
