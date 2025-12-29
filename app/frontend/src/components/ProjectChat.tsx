import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Textarea } from './ui/textarea';

interface ProjectChatProps {
  taskId: number;
  taskTitle?: string;
  currentUserId?: number;
  triggerLabel?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ProjectChat({
  taskId,
  taskTitle,
  currentUserId,
  triggerLabel = 'Чат по проекту',
  buttonVariant = 'outline',
  buttonSize = 'sm',
}: ProjectChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/tasks/${taskId}/messages`, {
        credentials: 'include',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Не удалось загрузить сообщения');
      }
      const data = await response.json();
      setMessages(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки сообщений');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchMessages();
    }
  }, [open, taskId]);

  const handleSend = async () => {
    const content = newMessage.trim();
    if (!content) return;
    setIsSending(true);
    try {
      const response = await fetch(`http://localhost:8000/tasks/${taskId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Не удалось отправить сообщение');
      }
      const message = await response.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
    } catch (err: any) {
      setError(err.message || 'Ошибка отправки сообщения');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{taskTitle ? `Чат: ${taskTitle}` : 'Чат по проекту'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Сообщения по заданию</span>
            <Button variant="ghost" size="sm" onClick={fetchMessages} disabled={isLoading}>
              Обновить
            </Button>
          </div>
          <ScrollArea className="h-64 rounded-lg border border-gray-200 bg-white p-3">
            {isLoading ? (
              <div className="text-sm text-gray-500 text-center py-6">Загрузка...</div>
            ) : messages.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-6">Сообщений пока нет</div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((message) => {
                  const isMine = currentUserId && message.sender_id === currentUserId;
                  return (
                    <div
                      key={message.id}
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        isMine ? 'ml-auto bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="text-xs opacity-75 mb-1">
                        {message.sender_name || `Пользователь #${message.sender_id}`}
                      </div>
                      <div className="whitespace-pre-wrap break-words">{message.content}</div>
                      <div className="text-[11px] opacity-70 mt-1">
                        {message.created_at ? new Date(message.created_at).toLocaleString() : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
          <div className="space-y-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Напишите сообщение..."
              rows={3}
            />
            {error && <div className="text-sm text-red-600">{error}</div>}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSend} disabled={isSending || !newMessage.trim()}>
            {isSending ? 'Отправка...' : 'Отправить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
