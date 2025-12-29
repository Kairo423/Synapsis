import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

type CatalogType = 'domain' | 'skill' | 'taskType' | 'taskStatus' | 'contractStatus';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);

  const [domains, setDomains] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [taskTypes, setTaskTypes] = useState<any[]>([]);
  const [taskStatuses, setTaskStatuses] = useState<any[]>([]);
  const [contractStatuses, setContractStatuses] = useState<any[]>([]);

  const [statusFilter, setStatusFilter] = useState('all');
  const [taskStatusDrafts, setTaskStatusDrafts] = useState<Record<number, string>>({});

  const [newDomain, setNewDomain] = useState({ name: '', description: '' });
  const [newSkill, setNewSkill] = useState({ name: '', description: '', domain_id: 'none' });
  const [newTaskType, setNewTaskType] = useState({ name: '', description: '' });
  const [newTaskStatus, setNewTaskStatus] = useState({ code: '', name: '', description: '' });
  const [newContractStatus, setNewContractStatus] = useState({ code: '', name: '', description: '' });

  const [editCatalog, setEditCatalog] = useState<{ type: CatalogType; item: any } | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [profileDialog, setProfileDialog] = useState<{ user: any; profile?: any; skills?: any[] } | null>(null);
  const [reportData, setReportData] = useState<any | null>(null);

  const statusOptions = useMemo(
    () => ['new', 'published', 'in_progress', 'review', 'completed', 'cancelled', 'blocked'],
    []
  );

  const fetchStats = async () => {
    const response = await fetch('http://localhost:8000/admin/stats', { credentials: 'include' });
    if (response.ok) setStats(await response.json());
  };

  const fetchUsers = async () => {
    const response = await fetch('http://localhost:8000/admin/users', { credentials: 'include' });
    if (response.ok) setUsers(await response.json());
  };

  const fetchTasks = async () => {
    const url =
      statusFilter === 'all'
        ? 'http://localhost:8000/admin/tasks'
        : `http://localhost:8000/admin/tasks?status_filter=${encodeURIComponent(statusFilter)}`;
    const response = await fetch(url, { credentials: 'include' });
    if (response.ok) {
      const data = await response.json();
      setTasks(data);
      setTaskStatusDrafts((prev) => {
        const next = { ...prev };
        data.forEach((task: any) => {
          next[task.id] = task.status;
        });
        return next;
      });
    }
  };

  const fetchContracts = async () => {
    const response = await fetch('http://localhost:8000/admin/contracts', { credentials: 'include' });
    if (response.ok) setContracts(await response.json());
  };

  const fetchCatalogs = async () => {
    const [domainsRes, skillsRes, typesRes, taskStatusesRes, contractStatusesRes] = await Promise.all([
      fetch('http://localhost:8000/catalogs/domains', { credentials: 'include' }),
      fetch('http://localhost:8000/catalogs/skills', { credentials: 'include' }),
      fetch('http://localhost:8000/catalogs/task-types', { credentials: 'include' }),
      fetch('http://localhost:8000/catalogs/task-statuses', { credentials: 'include' }),
      fetch('http://localhost:8000/catalogs/contract-statuses', { credentials: 'include' }),
    ]);
    if (domainsRes.ok) setDomains(await domainsRes.json());
    if (skillsRes.ok) setSkills(await skillsRes.json());
    if (typesRes.ok) setTaskTypes(await typesRes.json());
    if (taskStatusesRes.ok) setTaskStatuses(await taskStatusesRes.json());
    if (contractStatusesRes.ok) setContractStatuses(await contractStatusesRes.json());
  };

  const fetchReport = async () => {
    const response = await fetch('http://localhost:8000/admin/reports/summary', { credentials: 'include' });
    if (response.ok) setReportData(await response.json());
  };

  useEffect(() => {
    if (activeTab === 'overview') fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'tasks') fetchTasks();
    if (activeTab === 'contracts') fetchContracts();
    if (activeTab === 'catalogs') fetchCatalogs();
    if (activeTab === 'reports') fetchReport();
  }, [activeTab, statusFilter]);

  const toggleUserStatus = async (user: any) => {
    const response = await fetch(`http://localhost:8000/admin/users/${user.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ is_active: !user.is_active }),
    });
    if (response.ok) {
      const updated = await response.json();
      setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    }
  };

  const updateTaskStatus = async (taskId: number) => {
    const status = taskStatusDrafts[taskId];
    if (!status) return;
    const response = await fetch(`http://localhost:8000/admin/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      const updated = await response.json();
      setTasks((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    }
  };

  const openProfile = async (user: any) => {
    const result: any = { user };
    if (user.role === 'executor') {
      const [profileRes, skillsRes] = await Promise.all([
        fetch(`http://localhost:8000/experts/${user.id}`, { credentials: 'include' }),
        fetch(`http://localhost:8000/experts/${user.id}/skills`, { credentials: 'include' }),
      ]);
      if (profileRes.ok) result.profile = await profileRes.json();
      if (skillsRes.ok) result.skills = await skillsRes.json();
    }
    setProfileDialog(result);
  };

  const openEditCatalog = (type: CatalogType, item: any) => {
    setEditCatalog({ type, item });
    setEditValues({ ...item, domain_id: item.domain_id ?? 'none' });
  };

  const saveCatalogEdit = async () => {
    if (!editCatalog) return;
    const { type, item } = editCatalog;
    let url = '';
    let payload: any = {};
    if (type === 'domain') {
      url = `http://localhost:8000/catalogs/domains/${item.id}`;
      payload = { name: editValues.name, description: editValues.description };
    } else if (type === 'skill') {
      url = `http://localhost:8000/catalogs/skills/${item.id}`;
      payload = {
        name: editValues.name,
        description: editValues.description,
        domain_id: editValues.domain_id === 'none' ? null : Number(editValues.domain_id),
      };
    } else if (type === 'taskType') {
      url = `http://localhost:8000/catalogs/task-types/${item.id}`;
      payload = { name: editValues.name, description: editValues.description };
    } else if (type === 'taskStatus') {
      url = `http://localhost:8000/catalogs/task-statuses/${item.id}`;
      payload = { code: editValues.code, name: editValues.name, description: editValues.description };
    } else if (type === 'contractStatus') {
      url = `http://localhost:8000/catalogs/contract-statuses/${item.id}`;
      payload = { code: editValues.code, name: editValues.name, description: editValues.description };
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      await fetchCatalogs();
      setEditCatalog(null);
    }
  };

  const deleteCatalogItem = async (type: CatalogType, item: any) => {
    const confirmDelete = window.confirm('Удалить запись?');
    if (!confirmDelete) return;
    let url = '';
    if (type === 'domain') url = `http://localhost:8000/catalogs/domains/${item.id}`;
    if (type === 'skill') url = `http://localhost:8000/catalogs/skills/${item.id}`;
    if (type === 'taskType') url = `http://localhost:8000/catalogs/task-types/${item.id}`;
    if (type === 'taskStatus') url = `http://localhost:8000/catalogs/task-statuses/${item.id}`;
    if (type === 'contractStatus') url = `http://localhost:8000/catalogs/contract-statuses/${item.id}`;
    const response = await fetch(url, { method: 'DELETE', credentials: 'include' });
    if (response.ok) await fetchCatalogs();
  };

  const createCatalogItem = async (type: CatalogType) => {
    let url = '';
    let payload: any = {};
    if (type === 'domain') {
      url = 'http://localhost:8000/catalogs/domains';
      payload = { name: newDomain.name, description: newDomain.description || null };
    } else if (type === 'skill') {
      url = 'http://localhost:8000/catalogs/skills';
      payload = {
        name: newSkill.name,
        description: newSkill.description || null,
        domain_id: newSkill.domain_id === 'none' ? null : Number(newSkill.domain_id),
      };
    } else if (type === 'taskType') {
      url = 'http://localhost:8000/catalogs/task-types';
      payload = { name: newTaskType.name, description: newTaskType.description || null };
    } else if (type === 'taskStatus') {
      url = 'http://localhost:8000/catalogs/task-statuses';
      payload = { code: newTaskStatus.code, name: newTaskStatus.name, description: newTaskStatus.description || null };
    } else if (type === 'contractStatus') {
      url = 'http://localhost:8000/catalogs/contract-statuses';
      payload = {
        code: newContractStatus.code,
        name: newContractStatus.name,
        description: newContractStatus.description || null,
      };
    }
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      await fetchCatalogs();
      if (type === 'domain') setNewDomain({ name: '', description: '' });
      if (type === 'skill') setNewSkill({ name: '', description: '', domain_id: 'none' });
      if (type === 'taskType') setNewTaskType({ name: '', description: '' });
      if (type === 'taskStatus') setNewTaskStatus({ code: '', name: '', description: '' });
      if (type === 'contractStatus') setNewContractStatus({ code: '', name: '', description: '' });
    }
  };

  const downloadReport = () => {
    if (!reportData) return;
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `synapsis-report-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1>Админ-панель Synapsis</h1>
        <p className="text-gray-600">Модерация, справочники, статистика и отчеты</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex w-full max-w-5xl flex-wrap gap-2">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="tasks">Задания</TabsTrigger>
          <TabsTrigger value="contracts">Контракты</TabsTrigger>
          <TabsTrigger value="catalogs">Справочники</TabsTrigger>
          <TabsTrigger value="reports">Отчеты</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {stats ? (
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Пользователи</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{stats.users_total}</div>
                  <div className="text-sm text-gray-500">
                    Активных: {stats.users_active} · Заблокированных: {stats.users_blocked}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Задания</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{stats.tasks_total}</div>
                  <div className="text-sm text-gray-500">Статусов: {Object.keys(stats.tasks_by_status || {}).length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Контракты</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{stats.contracts_total}</div>
                  <div className="text-sm text-gray-500">Ответов: {stats.task_responses_total}</div>
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardDescription>Сумма выплат</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{stats.payments_total.toLocaleString()} ₽</div>
                  <div className="text-sm text-gray-500">На основе принятых работ</div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-gray-500">Загрузка...</div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Пользователи</CardTitle>
              <CardDescription>Модерация и профили</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-gray-500">Пользователи не найдены</div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 border rounded-lg p-3">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">
                          Роль: {user.role} · {user.is_active ? 'Активен' : 'Заблокирован'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openProfile(user)}>
                          Профиль
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toggleUserStatus(user)}>
                          {user.is_active ? 'Заблокировать' : 'Разблокировать'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Задания</CardTitle>
              <CardDescription>Управление статусами и блокировкой</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3 items-center">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={fetchTasks}>
                  Обновить
                </Button>
              </div>

              {tasks.length === 0 ? (
                <div className="text-gray-500">Заданий нет</div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-sm text-gray-500">
                            Заказчик: {task.customer_name || `#${task.customer_id}`} · Исполнитель:{' '}
                            {task.performer_name || (task.performer_id ? `#${task.performer_id}` : '—')}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <Select
                            value={taskStatusDrafts[task.id] || task.status}
                            onValueChange={(value) =>
                              setTaskStatusDrafts((prev) => ({ ...prev, [task.id]: value }))
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Статус" />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm" onClick={() => updateTaskStatus(task.id)}>
                            Сохранить
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        Стоимость: {task.price} ₽ · Статус: {task.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Контракты</CardTitle>
              <CardDescription>История и статусы контрактов</CardDescription>
            </CardHeader>
            <CardContent>
              {contracts.length === 0 ? (
                <div className="text-gray-500">Контракты не найдены</div>
              ) : (
                <div className="space-y-3">
                  {contracts.map((contract) => (
                    <div key={contract.id} className="border rounded-lg p-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="font-medium">Контракт #{contract.id}</div>
                        <div className="text-sm text-gray-500">Статус: {contract.status}</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Задание #{contract.task_id} · Заказчик #{contract.customer_id} · Исполнитель #
                        {contract.performer_id}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Стоимость: {contract.agreed_price ?? '—'} ₽</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catalogs" className="space-y-6">
          <Tabs defaultValue="domains" className="w-full">
            <TabsList className="flex w-full max-w-4xl flex-wrap gap-2">
              <TabsTrigger value="domains">Области</TabsTrigger>
              <TabsTrigger value="skills">Навыки</TabsTrigger>
              <TabsTrigger value="types">Типы заданий</TabsTrigger>
              <TabsTrigger value="task-statuses">Статусы заданий</TabsTrigger>
              <TabsTrigger value="contract-statuses">Статусы контрактов</TabsTrigger>
            </TabsList>

            <TabsContent value="domains" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Области экспертизы</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-3">
                    <Input
                      placeholder="Название"
                      value={newDomain.name}
                      onChange={(e) => setNewDomain((prev) => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Описание"
                      value={newDomain.description}
                      onChange={(e) => setNewDomain((prev) => ({ ...prev, description: e.target.value }))}
                    />
                    <Button onClick={() => createCatalogItem('domain')}>Добавить</Button>
                  </div>
                  <div className="space-y-2">
                    {domains.map((domain) => (
                      <div key={domain.id} className="flex items-center justify-between border rounded-lg p-3">
                        <div>
                          <div className="font-medium">{domain.name}</div>
                          <div className="text-sm text-gray-500">{domain.description || 'Без описания'}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditCatalog('domain', domain)}>
                            Редактировать
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteCatalogItem('domain', domain)}>
                            Удалить
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Навыки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-3">
                    <Input
                      placeholder="Название"
                      value={newSkill.name}
                      onChange={(e) => setNewSkill((prev) => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Описание"
                      value={newSkill.description}
                      onChange={(e) => setNewSkill((prev) => ({ ...prev, description: e.target.value }))}
                    />
                    <Select
                      value={newSkill.domain_id}
                      onValueChange={(value) => setNewSkill((prev) => ({ ...prev, domain_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Область" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Без области</SelectItem>
                        {domains.map((domain) => (
                          <SelectItem key={domain.id} value={String(domain.id)}>
                            {domain.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={() => createCatalogItem('skill')}>Добавить</Button>
                  </div>
                  <div className="space-y-2">
                    {skills.map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between border rounded-lg p-3">
                        <div>
                          <div className="font-medium">{skill.name}</div>
                          <div className="text-sm text-gray-500">{skill.description || 'Без описания'}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditCatalog('skill', skill)}>
                            Редактировать
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteCatalogItem('skill', skill)}>
                            Удалить
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="types" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Типы заданий</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-3">
                    <Input
                      placeholder="Название"
                      value={newTaskType.name}
                      onChange={(e) => setNewTaskType((prev) => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Описание"
                      value={newTaskType.description}
                      onChange={(e) => setNewTaskType((prev) => ({ ...prev, description: e.target.value }))}
                    />
                    <Button onClick={() => createCatalogItem('taskType')}>Добавить</Button>
                  </div>
                  <div className="space-y-2">
                    {taskTypes.map((type) => (
                      <div key={type.id} className="flex items-center justify-between border rounded-lg p-3">
                        <div>
                          <div className="font-medium">{type.name}</div>
                          <div className="text-sm text-gray-500">{type.description || 'Без описания'}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditCatalog('taskType', type)}>
                            Редактировать
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteCatalogItem('taskType', type)}>
                            Удалить
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="task-statuses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Статусы заданий</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-3">
                    <Input
                      placeholder="Код"
                      value={newTaskStatus.code}
                      onChange={(e) => setNewTaskStatus((prev) => ({ ...prev, code: e.target.value }))}
                    />
                    <Input
                      placeholder="Название"
                      value={newTaskStatus.name}
                      onChange={(e) => setNewTaskStatus((prev) => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Описание"
                      value={newTaskStatus.description}
                      onChange={(e) => setNewTaskStatus((prev) => ({ ...prev, description: e.target.value }))}
                    />
                    <Button onClick={() => createCatalogItem('taskStatus')}>Добавить</Button>
                  </div>
                  <div className="space-y-2">
                    {taskStatuses.map((status) => (
                      <div key={status.id} className="flex items-center justify-between border rounded-lg p-3">
                        <div>
                          <div className="font-medium">{status.name}</div>
                          <div className="text-sm text-gray-500">{status.code}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditCatalog('taskStatus', status)}>
                            Редактировать
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteCatalogItem('taskStatus', status)}>
                            Удалить
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contract-statuses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Статусы контрактов</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-3">
                    <Input
                      placeholder="Код"
                      value={newContractStatus.code}
                      onChange={(e) => setNewContractStatus((prev) => ({ ...prev, code: e.target.value }))}
                    />
                    <Input
                      placeholder="Название"
                      value={newContractStatus.name}
                      onChange={(e) => setNewContractStatus((prev) => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      placeholder="Описание"
                      value={newContractStatus.description}
                      onChange={(e) => setNewContractStatus((prev) => ({ ...prev, description: e.target.value }))}
                    />
                    <Button onClick={() => createCatalogItem('contractStatus')}>Добавить</Button>
                  </div>
                  <div className="space-y-2">
                    {contractStatuses.map((status) => (
                      <div key={status.id} className="flex items-center justify-between border rounded-lg p-3">
                        <div>
                          <div className="font-medium">{status.name}</div>
                          <div className="text-sm text-gray-500">{status.code}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditCatalog('contractStatus', status)}>
                            Редактировать
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteCatalogItem('contractStatus', status)}>
                            Удалить
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Отчетность</CardTitle>
              <CardDescription>Сводный отчет по системе</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={fetchReport}>
                  Обновить отчет
                </Button>
                <Button onClick={downloadReport} disabled={!reportData}>
                  Скачать JSON
                </Button>
              </div>
              {reportData ? (
                <pre className="text-xs bg-gray-50 border rounded-lg p-4 overflow-auto max-h-96">
                  {JSON.stringify(reportData, null, 2)}
                </pre>
              ) : (
                <div className="text-gray-500">Отчет не загружен</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={Boolean(editCatalog)}
        onOpenChange={(open) => {
          if (!open) setEditCatalog(null);
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Редактировать запись</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {'code' in editValues && (
              <Input
                placeholder="Код"
                value={editValues.code || ''}
                onChange={(e) => setEditValues((prev: any) => ({ ...prev, code: e.target.value }))}
              />
            )}
            {'name' in editValues && (
              <Input
                placeholder="Название"
                value={editValues.name || ''}
                onChange={(e) => setEditValues((prev: any) => ({ ...prev, name: e.target.value }))}
              />
            )}
            {'description' in editValues && (
              <Textarea
                placeholder="Описание"
                value={editValues.description || ''}
                onChange={(e) => setEditValues((prev: any) => ({ ...prev, description: e.target.value }))}
              />
            )}
            {'domain_id' in editValues && (
              <Select
                value={editValues.domain_id ?? 'none'}
                onValueChange={(value) => setEditValues((prev: any) => ({ ...prev, domain_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Область" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без области</SelectItem>
                  {domains.map((domain) => (
                    <SelectItem key={domain.id} value={String(domain.id)}>
                      {domain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter>
            <Button onClick={saveCatalogEdit}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(profileDialog)}
        onOpenChange={(open) => {
          if (!open) setProfileDialog(null);
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Профиль пользователя</DialogTitle>
          </DialogHeader>
          {profileDialog ? (
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <strong>{profileDialog.user.name}</strong> · {profileDialog.user.email}
              </div>
              <div>Роль: {profileDialog.user.role}</div>
              <div>Статус: {profileDialog.user.is_active ? 'Активен' : 'Заблокирован'}</div>
              {profileDialog.profile && (
                <div className="border rounded-lg p-3">
                  <div className="font-medium mb-1">Профиль эксперта</div>
                  <div>Основная область: {profileDialog.profile.main_domain_id ?? '—'}</div>
                  <div>Ставка: {profileDialog.profile.rate ?? '—'} ₽</div>
                  <div>Био: {profileDialog.profile.bio || '—'}</div>
                </div>
              )}
              {profileDialog.skills && profileDialog.skills.length > 0 && (
                <div className="border rounded-lg p-3">
                  <div className="font-medium mb-1">Навыки</div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {profileDialog.skills.map((skill: any) => (
                      <span key={skill.id} className="px-2 py-1 rounded-full bg-gray-100">
                        #{skill.skill_id} · {skill.level}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
