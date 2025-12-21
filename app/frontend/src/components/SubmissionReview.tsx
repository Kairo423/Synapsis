import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, CheckCircle2, XCircle, FileText, ExternalLink } from 'lucide-react';

interface SubmissionReviewProps {
  submission: any;
  onBack: () => void;
  onAccept: () => void;
  onReject: () => void;
}

export function SubmissionReview({ submission, onBack, onAccept, onReject }: SubmissionReviewProps) {
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
        </CardContent>
      </Card>
    </div>
  );
}
