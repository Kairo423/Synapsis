import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, CheckCircle2, XCircle, FileText, ExternalLink } from 'lucide-react';

interface SubmissionReviewProps {
  submission: any;
  contractId?: number;
  revieweeId?: number;
  onBack: () => void;
  onAccept: () => void;
  onReject: () => void;
}

export function SubmissionReview({ submission, contractId, revieweeId, onBack, onAccept, onReject }: SubmissionReviewProps) {
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeliverables = async () => {
      if (!submission?.id) return;
      try {
        const response = await fetch(`http://localhost:8000/files/responses/${submission.id}/deliverables`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setDeliverables(data);
        }
      } catch (error) {
        console.error('Failed to fetch deliverables', error);
      }
    };
    fetchDeliverables();
  }, [submission?.id]);

  const handleSubmitReview = async () => {
    if (!contractId || !revieweeId) return;
    setIsSubmittingReview(true);
    setReviewSuccess(null);
    try {
      const response = await fetch('http://localhost:8000/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          contract_id: contractId,
          reviewee_id: revieweeId,
          rating: parseInt(reviewRating, 10),
          comment: reviewComment,
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Не удалось оставить отзыв');
      }
      setReviewSuccess('Спасибо! Отзыв сохранен.');
      setReviewComment('');
    } catch (error: any) {
      alert(error.message || 'Ошибка при отправке отзыва');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header with Back button */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к списку
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Header Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{submission.task?.title || 'Без названия'}</h2>

            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-600 hover:bg-green-700 text-white border-0 px-3 py-1">
                {formatPrice(submission.task?.price || 0)}
              </Badge>
              {submission.task?.category && (
                <Badge variant="outline" className="px-3 py-1 bg-gray-50 text-gray-700 border-gray-200">
                  {submission.task.category}
                </Badge>
              )}
              {submission.task?.difficulty && (
                <Badge
                  className={`px-3 py-1 border-0 ${submission.task.difficulty === 'low' || submission.task.difficulty === 'beginner'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white' // Using green for now as per ref
                    }`}
                >
                  {submission.task.difficulty === 'low' ? 'Начальный' :
                    submission.task.difficulty === 'min' ? 'Минимальный' :
                      submission.task.difficulty === 'pro' ? 'Продвинутый' :
                        submission.task.difficulty === 'expert' ? 'Эксперт' :
                          submission.task.difficulty}
                </Badge>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 my-6"></div>

          {/* Description / Comment */}
          <div className="text-base leading-relaxed text-gray-800 whitespace-pre-wrap">
            {submission.comment || 'Исполнитель не оставил комментарий к выполнению.'}
          </div>

          {/* Attachment Link */}
          {submission.attachment_url && (
            <a
              href={submission.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-8 group"
            >
              <div className="border rounded-xl p-4 flex items-center gap-4 hover:border-blue-500 hover:bg-blue-50/10 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate group-hover:text-blue-600 transition-colors">
                    {submission.attachment_url.replace(/^https?:\/\//, '')}
                  </div>
                  <div className="text-sm text-gray-500">
                    Нажмите для перехода
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
              </div>
            </a>
          )}

          {deliverables.length > 0 && (
            <div className="mt-8 space-y-3">
              <h3 className="font-semibold text-slate-900">Файлы результата</h3>
              {deliverables.map((item: any) => (
                <a
                  key={item.id}
                  href={`http://localhost:8000/files/deliverables/${item.id}/download`}
                  className="block border rounded-xl p-4 flex items-center gap-4 hover:border-blue-500 hover:bg-blue-50/10 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 text-blue-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.filename}</div>
                    <div className="text-sm text-gray-500">Скачать файл</div>
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* Actions Footer */}
          <div className="flex gap-3 justify-end pt-6 mt-6 border-t border-gray-100">
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={onReject}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Отклонить
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white border-0"
              onClick={onAccept}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Принять работу
            </Button>
          </div>

          {contractId && revieweeId && (
            <div className="pt-6 border-t border-gray-100">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Оставить отзыв
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[460px]">
                  <DialogHeader>
                    <DialogTitle>Отзыв об исполнителе</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Оценка</label>
                      <Select value={reviewRating} onValueChange={setReviewRating}>
                        <SelectTrigger>
                          <SelectValue placeholder="5" />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 4, 3, 2, 1].map((value) => (
                            <SelectItem key={value} value={String(value)}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Комментарий</label>
                      <Textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Опишите качество работы"
                        rows={4}
                      />
                    </div>
                    {reviewSuccess && (
                      <div className="text-sm text-green-600">{reviewSuccess}</div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSubmitReview} disabled={isSubmittingReview}>
                      {isSubmittingReview ? 'Отправка...' : 'Отправить отзыв'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
