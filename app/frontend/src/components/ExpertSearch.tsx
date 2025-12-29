import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Star } from 'lucide-react';
import { fetchWithRetry } from '../utils/api';

interface ExpertResult {
  user_id: number;
  name: string;
  main_domain_id: number | null;
  rate: number | null;
  rating: number;
  total_reviews: number;
  skill_ids: number[];
  skills?: Array<{ skill_id: number; level: number }>;
}

export function ExpertSearch() {
  const [domains, setDomains] = useState<any[]>([]);
  const [skillsCatalog, setSkillsCatalog] = useState<any[]>([]);
  const [experts, setExperts] = useState<ExpertResult[]>([]);
  const [query, setQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [minRating, setMinRating] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<ExpertResult | null>(null);
  const [expertProfile, setExpertProfile] = useState<any | null>(null);
  const [expertSkills, setExpertSkills] = useState<any[]>([]);
  const [expertReviews, setExpertReviews] = useState<any[]>([]);
  const [expertHistory, setExpertHistory] = useState<any[]>([]);

  const closeExpertProfile = () => {
    setSelectedExpert(null);
    setExpertProfile(null);
    setExpertSkills([]);
    setExpertReviews([]);
    setExpertHistory([]);
  };

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const [domainsRes, skillsRes] = await Promise.all([
          fetchWithRetry('http://localhost:8000/catalogs/domains'),
          fetchWithRetry('http://localhost:8000/catalogs/skills'),
        ]);
        if (domainsRes.ok) setDomains(await domainsRes.json());
        if (skillsRes.ok) setSkillsCatalog(await skillsRes.json());
      } catch (error) {
        console.error('Failed to fetch catalogs', error);
      }
    };
    fetchCatalogs();
  }, []);

  const getDomainName = (domainId: number | null) => {
    if (!domainId) return 'Не указано';
    return domains.find((domain) => domain.id === domainId)?.name || `Область #${domainId}`;
  };

  const getSkillName = (skillId: number) => {
    return skillsCatalog.find((skill) => skill.id === skillId)?.name || `Навык #${skillId}`;
  };

  const fetchExperts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (domainFilter !== 'all') params.set('domain_ids', domainFilter);
      if (skillFilter !== 'all') params.set('skill_ids', skillFilter);
      if (minRate) params.set('min_rate', minRate);
      if (maxRate) params.set('max_rate', maxRate);
      if (minRating) params.set('min_rating', minRating);
      params.set('limit', '100');

      const response = await fetchWithRetry(`http://localhost:8000/search/experts?${params.toString()}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setExperts(data);
      }
    } catch (error) {
      console.error('Failed to fetch experts', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  const openExpertProfile = async (expert: ExpertResult) => {
    setSelectedExpert(expert);
    try {
      const [profileRes, skillsRes, reviewsRes, historyRes] = await Promise.all([
        fetchWithRetry(`http://localhost:8000/experts/${expert.user_id}`, { credentials: 'include' }),
        fetchWithRetry(`http://localhost:8000/experts/${expert.user_id}/skills`, { credentials: 'include' }),
        fetchWithRetry(`http://localhost:8000/reviews/user/${expert.user_id}`, { credentials: 'include' }),
        fetchWithRetry(`http://localhost:8000/experts/${expert.user_id}/history`, { credentials: 'include' }),
      ]);
      if (profileRes.ok) setExpertProfile(await profileRes.json());
      if (skillsRes.ok) setExpertSkills(await skillsRes.json());
      if (reviewsRes.ok) setExpertReviews(await reviewsRes.json());
      if (historyRes.ok) setExpertHistory(await historyRes.json());
    } catch (error) {
      console.error('Failed to fetch expert profile', error);
    }
  };

  if (selectedExpert) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={closeExpertProfile}>
          ← Назад к поиску
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Профиль эксперта</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900">{selectedExpert.name}</h3>
              <p className="text-sm text-slate-500">{getDomainName(selectedExpert.main_domain_id)}</p>
            </div>
            {expertProfile?.bio && (
              <p className="text-sm text-slate-700">{expertProfile.bio}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {expertSkills.map((item: any) => (
                <Badge key={`expert-skill-${item.skill_id}`} variant="outline">
                  {getSkillName(item.skill_id)} · {item.level}
                </Badge>
              ))}
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900">История работ</h4>
              {expertHistory.length === 0 ? (
                <p className="text-sm text-slate-500">Нет завершенных работ</p>
              ) : (
                expertHistory.slice(0, 5).map((item: any) => (
                  <div key={`${item.task_id}-${item.completed_at}`} className="border rounded-lg p-3 text-sm text-slate-700">
                    <div className="font-medium">{item.task_title}</div>
                    <div className="text-xs text-slate-400">
                      {item.price} ₽ · {item.completed_at ? new Date(item.completed_at).toLocaleDateString() : '—'}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900">Отзывы</h4>
              {expertReviews.length === 0 ? (
                <p className="text-sm text-slate-500">Пока нет отзывов</p>
              ) : (
                expertReviews.slice(0, 3).map((review: any) => (
                  <div key={review.id} className="border rounded-lg p-3 text-sm text-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                      <span>Оценка: {review.rating}</span>
                      <span className="text-xs text-slate-400">Отзыв #{review.id}</span>
                    </div>
                    <p>{review.comment || 'Без комментария'}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Поиск экспертов</CardTitle>
          <CardDescription>Подберите исполнителя по навыкам, ставке и рейтингу</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <Input
              placeholder="Поиск по имени"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Select value={domainFilter} onValueChange={setDomainFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Область" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все области</SelectItem>
                {domains.map((domain) => (
                  <SelectItem key={domain.id} value={String(domain.id)}>
                    {domain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Навык" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все навыки</SelectItem>
                {skillsCatalog.map((skill) => (
                  <SelectItem key={skill.id} value={String(skill.id)}>
                    {skill.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchExperts}>
              Искать
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              placeholder="Мин. ставка"
              type="number"
              min="0"
              value={minRate}
              onChange={(e) => setMinRate(e.target.value)}
            />
            <Input
              placeholder="Макс. ставка"
              type="number"
              min="0"
              value={maxRate}
              onChange={(e) => setMaxRate(e.target.value)}
            />
            <Input
              placeholder="Мин. рейтинг"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-6">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Загрузка...</div>
          ) : experts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Эксперты не найдены</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {experts.map((expert) => (
                <Card key={expert.user_id} className="border-slate-200">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{expert.name}</h3>
                        <p className="text-sm text-slate-500">{getDomainName(expert.main_domain_id)}</p>
                      </div>
                      <Badge variant="outline">{expert.rate ? `${expert.rate} ₽` : 'Ставка не указана'}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.round(expert.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span>{expert.rating.toFixed(1)} · {expert.total_reviews} отзывов</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(expert.skills && expert.skills.length > 0
                        ? expert.skills
                        : expert.skill_ids.map((skillId) => ({ skill_id: skillId, level: null }))
                      ).slice(0, 4).map((skill) => (
                        <Badge key={`${expert.user_id}-${skill.skill_id}`} variant="secondary">
                          {getSkillName(skill.skill_id)}{skill.level ? ` · ${skill.level}` : ''}
                        </Badge>
                      ))}
                      {((expert.skills && expert.skills.length) || expert.skill_ids.length) > 4 && (
                        <Badge variant="secondary">
                          +{((expert.skills && expert.skills.length) || expert.skill_ids.length) - 4}
                        </Badge>
                      )}
                    </div>
                    <Button variant="outline" onClick={() => openExpertProfile(expert)}>
                      Профиль
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
