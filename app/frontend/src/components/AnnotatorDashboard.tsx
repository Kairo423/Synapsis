import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Clock, DollarSign, Star, Pencil, Check } from 'lucide-react';
import { ProjectChat } from './ProjectChat';

export function AnnotatorDashboard({ userName, userId, refreshBalance }: { userName: string; userId?: number; refreshBalance?: () => void }) {
  const [description, setDescription] = useState('Загрузка...');
  const [isEditing, setIsEditing] = useState(false);
  const [tempDescription, setTempDescription] = useState('');
  const [balance, setBalance] = useState(0);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [skillsCatalog, setSkillsCatalog] = useState<any[]>([]);
  const [profileDraft, setProfileDraft] = useState({
    main_domain_id: null as number | null,
    rate: '',
    bio: '',
  });
  const [skillSelections, setSkillSelections] = useState<Array<{ skill_id: number; level: number }>>([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('3');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const [ratingSummary, setRatingSummary] = useState({ average_rating: 0, total_reviews: 0 });
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewTarget, setReviewTarget] = useState<{ contractId: number; revieweeId: number; taskTitle: string } | null>(null);
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const [reviewedContracts, setReviewedContracts] = useState<number[]>([]);

  useEffect(() => {
    if (userId) {
      const fetchCatalogs = async () => {
        try {
          const [domainsRes, skillsRes] = await Promise.all([
            fetch('http://localhost:8000/catalogs/domains'),
            fetch('http://localhost:8000/catalogs/skills'),
          ]);
          if (domainsRes.ok) setDomains(await domainsRes.json());
          if (skillsRes.ok) setSkillsCatalog(await skillsRes.json());
        } catch (error) {
          console.error('Failed to fetch catalogs', error);
        }
      };

      const fetchProfile = async () => {
        try {
          const response = await fetch('http://localhost:8000/experts/me', {
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            setProfileDraft({
              main_domain_id: data.main_domain_id ?? null,
              rate: data.rate !== null && data.rate !== undefined ? String(data.rate) : '',
              bio: data.bio || '',
            });
          }
        } catch (error) {
          console.error('Failed to fetch profile', error);
        }
      };

      const fetchSkills = async () => {
        try {
          const response = await fetch(`http://localhost:8000/experts/${userId}/skills`, {
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            setSkillSelections(
              data.map((item: any) => ({
                skill_id: item.skill_id,
                level: item.level,
              }))
            );
          }
        } catch (error) {
          console.error('Failed to fetch expert skills', error);
        }
      };

      const fetchRating = async () => {
        try {
          const response = await fetch(`http://localhost:8000/reviews/user/${userId}/rating`, {
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            setRatingSummary({
              average_rating: data.average_rating || 0,
              total_reviews: data.total_reviews || 0,
            });
          }
        } catch (error) {
          console.error('Failed to fetch rating', error);
        }
      };

      const fetchReviews = async () => {
        try {
          const response = await fetch(`http://localhost:8000/reviews/user/${userId}`, {
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            setReviews(data);
          }
        } catch (error) {
          console.error('Failed to fetch reviews', error);
        }
      };

      fetch(`http://localhost:8000/users/${userId}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          setDescription(data.description || 'Нет описания');
          setBalance(data.balance || 0);
          if (refreshBalance) refreshBalance();
        })
        .catch((err) => {
          console.error(err);
          setDescription('Ошибка загрузки');
        });

      fetchCatalogs();
      fetchProfile();
      fetchSkills();
      fetchRating();
      fetchReviews();

      // Fetch tasks and responses
      const fetchTasksData = async () => {
        try {
          const [tasksRes, responsesRes, contractsRes] = await Promise.all([
            fetch('http://localhost:8000/tasks/'),
            fetch('http://localhost:8000/task_responses/', { credentials: 'include' }),
            fetch('http://localhost:8000/contracts', { credentials: 'include' })
          ]);

          if (tasksRes.ok && responsesRes.ok) {
            const tasks = await tasksRes.json();
            const responses = await responsesRes.json();
            const contractsData = contractsRes.ok ? await contractsRes.json() : [];
            const taskMap = new Map(tasks.map((item: any) => [item.id, item]));
            const contractByResponse = new Map(
              contractsData
                .filter((contract: any) => contract.task_response_id)
                .map((contract: any) => [contract.task_response_id, contract])
            );
            const contractByTask = new Map(
              contractsData.map((contract: any) => [contract.task_id, contract])
            );

            const combined = responses.map((r: any) => {
              const t = taskMap.get(r.task_id);
              const contract = contractByResponse.get(r.id) || contractByTask.get(r.task_id);
              return {
                id: r.id,
                task_id: r.task_id,
                title: t?.title || 'Неизвестная задача',
                status: r.status,
                reward: t?.price || 0,
                date: r.submitted_at ? new Date(r.submitted_at).toLocaleDateString() : 'Недавно',
                rating: null, // Placeholder as backend doesn't return rating yet
                contract_id: contract?.id,
                customer_id: contract?.customer_id ?? t?.customer_id ?? null,
              };
            });
            // Sort by ID descending (newest first) as a proxy for time if checks are needed
            setRecentTasks(combined.sort((a: any, b: any) => b.id - a.id));
          }
        } catch (e) {
          console.error("Error loading recent tasks", e);
        }
      };
      fetchTasksData();
    }
  }, [userId]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const response = await fetch('http://localhost:8000/experts/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          main_domain_id: profileDraft.main_domain_id,
          rate: profileDraft.rate ? parseFloat(profileDraft.rate) : null,
          bio: profileDraft.bio,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Не удалось обновить профиль');
      }
    } catch (error) {
      console.error(error);
      alert('Ошибка при сохранении профиля');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddSkill = () => {
    if (!selectedSkillId) return;
    const skillId = parseInt(selectedSkillId, 10);
    if (!skillId) return;
    const level = parseInt(selectedSkillLevel, 10) || 3;
    setSkillSelections((prev) => {
      const existing = prev.find((item) => item.skill_id === skillId);
      if (existing) {
        return prev.map((item) => (item.skill_id === skillId ? { ...item, level } : item));
      }
      return [...prev, { skill_id: skillId, level }];
    });
  };

  const handleRemoveSkill = (skillId: number) => {
    setSkillSelections((prev) => prev.filter((item) => item.skill_id !== skillId));
  };

  const handleSaveSkills = async () => {
    setIsSavingSkills(true);
    try {
      const response = await fetch('http://localhost:8000/experts/me/skills', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ skills: skillSelections }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Не удалось сохранить навыки');
      }
    } catch (error) {
      console.error(error);
      alert('Ошибка при сохранении навыков');
    } finally {
      setIsSavingSkills(false);
    }
  };

  const handleSaveDescription = async () => {
    try {
      const res = await fetch('http://localhost:8000/users/description', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ description: tempDescription }),
      });
      if (res.ok) {
        // Reload description to verify
        const userRes = await fetch(`http://localhost:8000/users/${userId}`, { credentials: 'include' });
        const userData = await userRes.json();
        setDescription(userData.description || 'Нет описания');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update description:', error);
    }
  };

  const openCustomerReview = (task: any) => {
    if (!task.contract_id || !task.customer_id) return;
    setReviewTarget({
      contractId: task.contract_id,
      revieweeId: task.customer_id,
      taskTitle: task.title,
    });
    setReviewRating('5');
    setReviewComment('');
    setReviewSuccess(null);
  };

  const handleSubmitCustomerReview = async () => {
    if (!reviewTarget) return;
    setIsSubmittingReview(true);
    setReviewSuccess(null);
    try {
      const response = await fetch('http://localhost:8000/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          contract_id: reviewTarget.contractId,
          reviewee_id: reviewTarget.revieweeId,
          rating: parseInt(reviewRating, 10),
          comment: reviewComment,
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Не удалось оставить отзыв');
      }
      setReviewSuccess('Спасибо! Отзыв сохранен.');
      setReviewedContracts((prev) => [...prev, reviewTarget.contractId]);
    } catch (error: any) {
      alert(error.message || 'Ошибка при отправке отзыва');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const completedTasksCount = recentTasks.filter(t => t.status === 'accepted').length;
  const totalEarned = recentTasks
    .filter(t => t.status === 'accepted')
    .reduce((acc, t) => acc + (t.reward || 0), 0);

  const successRate = recentTasks.length > 0
    ? Math.round((completedTasksCount / recentTasks.length) * 100)
    : 100;

  return (
    <div className="flex flex-col">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardHeader className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-blue-600 text-white text-2xl">{userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex flex-col h-20 justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="leading-none">{userName}</CardTitle>
              </div>

              <div className="flex items-center gap-4 w-full max-w-xl">
                {isEditing ? (
                  <div className="flex-1 flex gap-2 items-start animate-in fade-in zoom-in-95 duration-200">
                    <Textarea
                      value={tempDescription}
                      onChange={(e) => setTempDescription(e.target.value)}
                      className="min-h-[60px] text-sm resize-none"
                      placeholder="Введите описание..."
                    />
                    <Button
                      onClick={handleSaveDescription}
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700 shrink-0"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <CardDescription className="leading-none truncate max-w-[400px]" title={description}>
                      {description}
                    </CardDescription>
                    <Button
                      variant="outline"
                      className="rounded-full h-6 px-3 text-xs gap-1.5 border-gray-300 hover:bg-gray-50 bg-white ml-2"
                      onClick={() => {
                        setTempDescription(description === 'Нет описания' ? '' : description);
                        setIsEditing(true);
                      }}
                    >
                      <Pencil className="w-3 h-3" />
                      Изменить
                    </Button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-4 leading-none">
                <span>{completedTasksCount} выполненных заданий</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Всего заработано</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-2xl">{totalEarned.toLocaleString()}₽</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>В процессе</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-2xl">{recentTasks.filter(t => t.status === 'in_progress').length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Профиль эксперта</CardTitle>
          <CardDescription>Обновите основную специализацию и ставку</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Основная область</Label>
              <Select
                value={profileDraft.main_domain_id ? String(profileDraft.main_domain_id) : 'none'}
                onValueChange={(value) =>
                  setProfileDraft((prev) => ({
                    ...prev,
                    main_domain_id: value === 'none' ? null : parseInt(value, 10),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите область" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не выбрано</SelectItem>
                  {domains.map((domain) => (
                    <SelectItem key={domain.id} value={String(domain.id)}>
                      {domain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ставка (₽/задача)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={profileDraft.rate}
                onChange={(e) => setProfileDraft((prev) => ({ ...prev, rate: e.target.value }))}
                placeholder="Например: 1500"
              />
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <Label>Био</Label>
            <Textarea
              value={profileDraft.bio}
              onChange={(e) => setProfileDraft((prev) => ({ ...prev, bio: e.target.value }))}
              rows={3}
              placeholder="Коротко о вашей экспертизе"
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
              {isSavingProfile ? 'Сохранение...' : 'Сохранить профиль'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Навыки и уровни</CardTitle>
          <CardDescription>Добавьте навыки и уровень владения (1–5)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="min-w-[220px] flex-1 space-y-2">
              <Label>Навык</Label>
              <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите навык" />
                </SelectTrigger>
                <SelectContent>
                  {skillsCatalog.map((skill) => (
                    <SelectItem key={skill.id} value={String(skill.id)}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[140px] space-y-2">
              <Label>Уровень</Label>
              <Select value={selectedSkillLevel} onValueChange={setSelectedSkillLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="3" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <SelectItem key={level} value={String(level)}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={handleAddSkill}>
              Добавить
            </Button>
          </div>

          <div className="mt-4 space-y-2">
            {skillSelections.length === 0 ? (
              <p className="text-sm text-gray-500">Навыки пока не добавлены</p>
            ) : (
              skillSelections.map((item) => {
                const skillName = skillsCatalog.find((skill) => skill.id === item.skill_id)?.name || `Навык #${item.skill_id}`;
                return (
                  <div key={item.skill_id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{skillName}</span>
                      <Badge variant="outline">Уровень: {item.level}</Badge>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleRemoveSkill(item.skill_id)}>
                      Удалить
                    </Button>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={handleSaveSkills} disabled={isSavingSkills}>
              {isSavingSkills ? 'Сохранение...' : 'Сохранить навыки'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Рейтинг и отзывы</CardTitle>
          <CardDescription>Оценка по выполненным работам</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.round(ratingSummary.average_rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {ratingSummary.average_rating.toFixed(1)} · {ratingSummary.total_reviews} отзывов
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-500">Пока нет отзывов</p>
            ) : (
              reviews.slice(0, 5).map((review: any) => (
                <div key={review.id} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-600">Пользователь #{review.reviewer_id}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{review.comment || 'Без комментария'}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Недавние задания</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Нет недавних заданий</p>
            ) : (
              recentTasks.map((task) => {
                const canReview = task.status === 'accepted' && task.contract_id && task.customer_id;
                const alreadyReviewed = task.contract_id ? reviewedContracts.includes(task.contract_id) : false;
                return (
                  <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-slate-900">{task.title}</h4>
                        {task.status === 'completed' && (
                          <Badge variant="default" className="bg-green-600 hover:bg-green-700">Завершено</Badge>
                        )}
                        {task.status === 'accepted' && (
                          <Badge variant="default" className="bg-green-600 hover:bg-green-700">Принято</Badge>
                        )}
                        {task.status === 'in_progress' && (
                          <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">В работе</Badge>
                        )}
                        {(task.status === 'on_check' || task.status === 'submitted') && (
                          <Badge
                            variant="secondary"
                            className="text-white border-0"
                            style={{ backgroundColor: '#f97316', color: 'white' }}
                          >
                            На проверке
                          </Badge>
                        )}
                        {task.status === 'rejected' && (
                          <Badge variant="default" className="bg-red-600 hover:bg-red-700">Отклонено</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{task.date}</span>
                        <span>•</span>
                        <span className="font-bold text-slate-900">{task.reward}₽</span>
                        {task.rating && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              {[...Array(task.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <ProjectChat
                          taskId={task.task_id}
                          taskTitle={task.title}
                          currentUserId={userId}
                          triggerLabel="Чат"
                          buttonVariant="outline"
                          buttonSize="sm"
                        />
                        {canReview && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCustomerReview(task)}
                            disabled={alreadyReviewed}
                          >
                            {alreadyReviewed ? 'Отзыв оставлен' : 'Оценить заказчика'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills & Badges */}
      <Dialog
        open={Boolean(reviewTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setReviewTarget(null);
            setReviewSuccess(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>
              {reviewTarget ? `Отзыв о заказчике: ${reviewTarget.taskTitle}` : 'Отзыв о заказчике'}
            </DialogTitle>
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
                placeholder="Опишите взаимодействие с заказчиком"
                rows={4}
              />
            </div>
            {reviewSuccess && <div className="text-sm text-green-600">{reviewSuccess}</div>}
          </div>
          <DialogFooter>
            <Button onClick={handleSubmitCustomerReview} disabled={isSubmittingReview}>
              {isSubmittingReview ? 'Отправка...' : 'Отправить отзыв'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
