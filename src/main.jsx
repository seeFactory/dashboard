import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Download,
  FileJson,
  FlaskConical,
  Image,
  KeyRound,
  LayoutDashboard,
  Link2,
  LogOut,
  MessageSquareText,
  Moon,
  MousePointer2,
  PackageOpen,
  Play,
  Plus,
  RefreshCw,
  ReceiptText,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  UploadCloud,
  UserPlus,
  UserRound,
  Video,
  Workflow
} from 'lucide-react';
import './styles.css';

const API_BASE = `http://${window.location.hostname || '192.168.31.26'}:18280`;

const tabs = [
  ['overview', '总览', LayoutDashboard],
  ['workflow', '工作流', Workflow],
  ['playground', '操练场', MessageSquareText],
  ['models', '模型测试台', FlaskConical],
  ['workshop', '创意工坊', PackageOpen],
  ['billing', '付费账单', CircleDollarSign],
  ['usage', '调用记录', Activity],
  ['assets', '资产', Image],
  ['profile', '账号资料', UserRound]
];

const emptyGraph = { schemaVersion: '1.0', nodes: [], edges: [] };
const emptyPage = { items: [], page: 1, pageSize: 10, total: 0, totalPages: 1 };
const nodeTypes = { sfNode: WorkflowNode };

function money(cents = 0) {
  return `¥${(Number(cents) / 100).toFixed(2)}`;
}

function assetUrl(url) {
  if (!url) return '';
  return url.startsWith('http') ? url : `${API_BASE}${url}`;
}

function normalizePage(payload, pageSize = 10) {
  if (Array.isArray(payload)) {
    return { items: payload, page: 1, pageSize, total: payload.length, totalPages: 1 };
  }
  return {
    items: payload?.items || [],
    page: Number(payload?.page || 1),
    pageSize: Number(payload?.pageSize || payload?.page_size || pageSize),
    total: Number(payload?.total || 0),
    totalPages: Number(payload?.totalPages || Math.max(1, Math.ceil(Number(payload?.total || 0) / Number(payload?.pageSize || payload?.page_size || pageSize))))
  };
}

function queryFrom(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') params.set(key, value);
  });
  return params.toString();
}

function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    acc[key] = obj?.[key];
    return acc;
  }, {});
}

function defaultConfig(component) {
  if (component.component_key === 'image.poster.render') {
    return { title: 'seeFactory Poster', palette: 'sage', width: 1200, height: 720 };
  }
  if (component.component_key === 'text.dialogue') return { instruction: '输出适合创意生产的简洁文本' };
  if (component.component_key === 'vision.describe') return { question: '请描述这张图片并提炼提示词' };
  if (component.component_key === 'video.storyboard.generate') return { duration: 6, ratio: '9:16' };
  if (component.component_key === 'video.image.animate') return { duration: 6, ratio: '9:16', motion: '轻微推进镜头' };
  if (component.component_key === 'asset.output') return { label: '最终资产' };
  return {};
}

function graphToFlow(graph, componentsByKey) {
  const nodes = (graph?.nodes || []).map((node) => {
    const component = componentsByKey[node.type] || {};
    return {
      id: String(node.id),
      type: 'sfNode',
      position: { x: Number(node.x || 80), y: Number(node.y || 120) },
      data: {
        componentKey: node.type,
        label: node.label || component.label || node.type,
        category: component.category || 'component',
        config: node.config || {}
      }
    };
  });
  const edges = (graph?.edges || []).map((edge) => ({
    id: edge.id || `e_${edge.source}_${edge.target}`,
    source: String(edge.source),
    target: String(edge.target),
    sourceHandle: edge.sourceHandle || undefined,
    targetHandle: edge.targetHandle || undefined,
    type: 'smoothstep',
    animated: true
  }));
  return { nodes, edges };
}

function flowToGraph(nodes, edges) {
  return {
    schemaVersion: '1.0',
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.data.componentKey,
      label: node.data.label,
      x: Math.round(node.position.x),
      y: Math.round(node.position.y),
      config: node.data.config || {}
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle || null,
      targetHandle: edge.targetHandle || null
    }))
  };
}

function extractTaskAsset(task) {
  return task?.output?.result?.output?.asset || task?.output?.result?.asset || null;
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('sf-token') || '');
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('sf-theme') || 'light');
  const [active, setActive] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', displayName: '', inviteCode: '' });
  const [summary, setSummary] = useState(null);
  const [pages, setPages] = useState({
    ledgers: emptyPage,
    orders: emptyPage,
    withdraws: emptyPage,
    providerJobs: emptyPage,
    tasks: emptyPage,
    assets: { ...emptyPage, pageSize: 12 }
  });
  const [filters, setFilters] = useState({
    ledgers: { page: 1, pageSize: 10, q: '', direction: 'all' },
    orders: { page: 1, pageSize: 10, q: '', status: 'all' },
    withdraws: { page: 1, pageSize: 10, status: 'all' },
    providerJobs: { page: 1, pageSize: 10, q: '', status: 'all' },
    tasks: { page: 1, pageSize: 10, q: '', status: 'all' },
    assets: { page: 1, pageSize: 12, q: '', assetType: 'all' }
  });
  const [profileForm, setProfileForm] = useState({ email: '', displayName: '', billingPreference: 'balance_first', locale: 'zh-CN' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [invite, setInvite] = useState(null);
  const [state, setState] = useState({
    components: [],
    models: [],
    workflows: [],
    workshop: [],
    wallet: { balanceCents: 0 },
    ledgers: [],
    tasks: [],
    assets: []
  });
  const [draft, setDraft] = useState({
    id: null,
    title: '新产出链条',
    description: '把真实组件连接成可以运行、导出和发布的无代码 workflow。',
    graph: emptyGraph,
    licenseMode: 'closed',
    tags: 'local-runtime,poster',
    priceCents: 0
  });
  const [workflowEditorMode, setWorkflowEditorMode] = useState('auto');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [runInput, setRunInput] = useState('为 seeFactory 生成一张极简风格产品海报');
  const [modelTest, setModelTest] = useState({ modelKey: '', prompt: '生成一张极简产品宣传图', title: 'seeFactory' });
  const [modelResult, setModelResult] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [taskEvents, setTaskEvents] = useState([]);
  const [taskNodes, setTaskNodes] = useState([]);
  const [estimate, setEstimate] = useState(0);

  const componentsByKey = useMemo(
    () => Object.fromEntries(state.components.map((component) => [component.component_key, component])),
    [state.components]
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('sf-theme', theme);
  }, [theme]);

  const api = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;
    if (!response.ok) throw new Error(body?.message || text || `HTTP ${response.status}`);
    return body;
  }, [token]);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [me, components, models, workflows, workshop, wallet, userSummary, inviteInfo, ledgersPage, ordersPage, withdrawsPage, providerJobsPage, tasksPage, assetsPage] = await Promise.all([
        api('/api/users/me'),
        api('/api/components'),
        api('/api/models/capabilities'),
        api('/api/workflows'),
        api('/api/workshop/items'),
        api('/api/wallet/balance'),
        api('/api/users/me/summary'),
        api('/api/users/me/invite'),
        api(`/api/wallet/ledgers?${queryFrom(filters.ledgers)}`),
        api(`/api/payments/recharge-orders?${queryFrom(filters.orders)}`),
        api(`/api/withdraw-orders?${queryFrom(filters.withdraws)}`),
        api(`/api/provider-jobs?${queryFrom(filters.providerJobs)}`),
        api(`/api/tasks?${queryFrom(filters.tasks)}`),
        api(`/api/assets?${queryFrom(filters.assets)}`)
      ]);
      setUser(me);
      setSummary(userSummary);
      setInvite(inviteInfo);
      setProfileForm({
        email: me.email || '',
        displayName: me.displayName || '',
        billingPreference: me.preferences?.billingPreference || 'balance_first',
        locale: me.preferences?.locale || 'zh-CN'
      });
      const normalizedPages = {
        ledgers: normalizePage(ledgersPage, filters.ledgers.pageSize),
        orders: normalizePage(ordersPage, filters.orders.pageSize),
        withdraws: normalizePage(withdrawsPage, filters.withdraws.pageSize),
        providerJobs: normalizePage(providerJobsPage, filters.providerJobs.pageSize),
        tasks: normalizePage(tasksPage, filters.tasks.pageSize),
        assets: normalizePage(assetsPage, filters.assets.pageSize)
      };
      setPages(normalizedPages);
      setState({
        components,
        models,
        workflows,
        workshop,
        wallet,
        ledgers: normalizedPages.ledgers.items,
        tasks: normalizedPages.tasks.items,
        assets: normalizedPages.assets.items
      });
      setModelTest((current) => {
        if (current.modelKey && models.some((model) => model.model_key === current.modelKey)) return current;
        return { ...current, modelKey: models.find((model) => model.model_key === 'local-poster-renderer')?.model_key || models[0]?.model_key || '' };
      });
    } catch (error) {
      setMessage(error.message);
      if (error.message.includes('登录') || error.message.includes('401')) logout();
    } finally {
      setLoading(false);
    }
  }, [api, filters, token]);

  const loadWorkflow = useCallback((workflow) => {
    const flow = graphToFlow(workflow.graph, componentsByKey);
    setWorkflowEditorMode('existing');
    setDraft({
      id: workflow.id,
      title: workflow.title,
      description: workflow.description,
      graph: workflow.graph,
      licenseMode: workflow.license_mode || 'closed',
      tags: Array.isArray(workflow.tags) ? workflow.tags.join(',') : (workflow.tags || 'local-runtime,poster'),
      priceCents: Number(workflow.price_cents || 0)
    });
    setNodes(flow.nodes);
    setEdges(flow.edges);
    setSelectedNodeId('');
  }, [componentsByKey, setEdges, setNodes]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (token && workflowEditorMode === 'auto' && state.workflows.length && !draft.id && !nodes.length) {
      loadWorkflow(state.workflows[0]);
    }
  }, [draft.id, loadWorkflow, nodes.length, state.workflows, token, workflowEditorMode]);

  useEffect(() => {
    if (!token || !nodes.length) {
      setEstimate(0);
      return;
    }
    const estimatePath = draft.id ? `/api/workflows/${draft.id}/estimate` : '/api/billing/estimate';
    api(estimatePath, { method: 'POST', body: JSON.stringify({ graph: flowToGraph(nodes, edges) }) })
      .then((result) => setEstimate(result.estimatedCostCents))
      .catch(() => setEstimate(0));
  }, [api, draft.id, edges, nodes, token]);

  async function submitAuth(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const path = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload = authMode === 'register'
        ? { email: form.email, password: form.password, displayName: form.displayName || form.email.split('@')[0], inviteCode: form.inviteCode || undefined }
        : { email: form.email, password: form.password };
      const result = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || '认证失败');
        return body;
      });
      localStorage.setItem('sf-token', result.token);
      setToken(result.token);
      setUser(result.user);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('sf-token');
    setToken('');
    setUser(null);
    setSummary(null);
    setWorkflowEditorMode('auto');
    setDraft({ id: null, title: '新产出链条', description: '把真实组件连接成可以运行、导出和发布的无代码 workflow。', graph: emptyGraph });
    setNodes([]);
    setEdges([]);
  }

  function updateFilter(resource, patch) {
    setFilters((current) => ({
      ...current,
      [resource]: { ...current[resource], ...patch }
    }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    const updated = await api('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify({
        email: profileForm.email,
        displayName: profileForm.displayName,
        preferences: {
          billingPreference: profileForm.billingPreference,
          locale: profileForm.locale
        }
      })
    });
    setUser(updated);
    setMessage('账号资料已保存');
    await refresh();
  }

  async function changePassword(event) {
    event.preventDefault();
    await api('/api/users/me/password', {
      method: 'PATCH',
      body: JSON.stringify(passwordForm)
    });
    setPasswordForm({ currentPassword: '', newPassword: '' });
    setMessage('登录密码已更新');
  }

  function newWorkflow() {
    setWorkflowEditorMode('new');
    setDraft({
      id: null,
      title: '新产出链条',
      description: '把真实组件连接成可以运行、导出和发布的无代码 workflow。',
      graph: emptyGraph,
      licenseMode: 'closed',
      tags: 'local-runtime,poster',
      priceCents: 0
    });
    setNodes([]);
    setEdges([]);
    setSelectedNodeId('');
    setActive('workflow');
  }

  const onConnect = useCallback((connection) => {
    setEdges((current) => addEdge({ ...connection, type: 'smoothstep', animated: true }, current));
  }, [setEdges]);

  function addComponentNode(component, position = { x: 120, y: 120 }) {
    const id = `n_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    setNodes((current) => [
      ...current,
      {
        id,
        type: 'sfNode',
        position,
        data: {
          componentKey: component.component_key,
          label: component.label,
          category: component.category,
          config: defaultConfig(component)
        }
      }
    ]);
    setSelectedNodeId(id);
  }

  function updateNodeConfig(nodeId, config) {
    setNodes((current) => current.map((node) => (
      node.id === nodeId ? { ...node, data: { ...node.data, config: { ...node.data.config, ...config } } } : node
    )));
  }

  function removeNode(nodeId) {
    setNodes((current) => current.filter((node) => node.id !== nodeId));
    setEdges((current) => current.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setSelectedNodeId('');
  }

  async function saveWorkflow() {
    const graph = flowToGraph(nodes, edges);
    if (!graph.nodes.length) {
      setMessage('请先拖入至少一个真实组件');
      return null;
    }
    const payload = { title: draft.title, description: draft.description, graph };
    if (draft.id) {
      await api(`/api/workflows/${draft.id}/draft`, { method: 'PUT', body: JSON.stringify(payload) });
      setDraft((current) => ({ ...current, graph }));
      setMessage('草稿已保存并通过后端校验');
      await refresh();
      return draft.id;
    }
    const created = await api('/api/workflows', { method: 'POST', body: JSON.stringify(payload) });
    setWorkflowEditorMode('existing');
    setDraft((current) => ({ ...current, id: created.id, title: created.title, description: created.description, graph: created.graph }));
    setMessage('工作流已创建并通过后端校验');
    await refresh();
    return created.id;
  }

  async function validateWorkflow() {
    const id = draft.id || await saveWorkflow();
    if (!id) return;
    const result = await api(`/api/workflows/${id}/validate`, { method: 'POST' });
    setMessage(result.valid ? '校验通过：当前 workflow 可进入真实执行' : result.errors.join('；'));
  }

  async function runWorkflow() {
    const id = draft.id || await saveWorkflow();
    if (!id) return;
    const result = await api(`/api/workflows/${id}/test-run`, {
      method: 'POST',
      body: JSON.stringify({ prompt: runInput })
    });
    await openTask(result.taskId);
    setMessage(`真实任务已完成：#${result.taskId}`);
    await refresh();
  }

  async function openTask(taskId) {
    const [task, events, runNodes] = await Promise.all([
      api(`/api/tasks/${taskId}`),
      api(`/api/tasks/${taskId}/events`),
      api(`/api/tasks/${taskId}/nodes`)
    ]);
    setActiveTask(task);
    setTaskEvents(events);
    setTaskNodes(Array.isArray(runNodes) ? runNodes : []);
    setActive('tasks');
  }

  async function publishWorkflow() {
    const id = draft.id || await saveWorkflow();
    if (!id) return;
    await api(`/api/workflows/${id}/publish`, {
      method: 'POST',
      body: JSON.stringify({
        licenseMode: draft.licenseMode || 'closed',
        tags: String(draft.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
        summary: draft.description,
        priceCents: Number(draft.priceCents || 0)
      })
    });
    setMessage(`已发布到创意工坊：${draft.licenseMode === 'open' ? '开源可克隆' : '闭源可运行'}，价格 ${money(draft.priceCents || 0)}`);
    await refresh();
  }

  async function downloadWorkflow() {
    const id = draft.id || await saveWorkflow();
    if (!id) return;
    const response = await fetch(`${API_BASE}/api/workflows/${id}/export`, {
      headers: { authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      setMessage(await response.text() || '导出失败');
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seefactory-workflow-${id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importWorkflowFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json,.seeflow';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const manifest = JSON.parse(await file.text());
        const created = await api('/api/workflows/import', {
          method: 'POST',
          body: JSON.stringify(manifest)
        });
        setWorkflowEditorMode('existing');
        loadWorkflow(created);
        setActive('workflow');
        setMessage(`已导入 workflow：${created.title}`);
        await refresh();
      } catch (error) {
        setMessage(error.message || '导入失败，请检查 manifest 文件');
      }
    };
    input.click();
  }

  async function runModelTest() {
    if (!modelTest.modelKey) return;
    const result = await api('/api/models/test', { method: 'POST', body: JSON.stringify(modelTest) });
    setModelResult(result);
    await refresh();
  }

  async function recharge(amountCents, channel = 'wechat', meta = {}) {
    const order = await api('/api/payments/recharge-orders', {
      method: 'POST',
      body: JSON.stringify({ amountCents, channel, ...meta })
    });
    const label = order.purpose === 'balance_recharge' ? '充值订单' : '单次支付订单';
    setMessage(`已创建 ${order.channel} ${label} #${order.id}，确认收款后才会入账`);
    await refresh();
  }

  async function redeemCoupon(code) {
    const result = await api('/api/coupons/redeem', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
    setMessage(`优惠券已兑换，入账 ${money(result.amountCents || 0)}`);
    await refresh();
  }

  async function createWithdraw(payload) {
    const result = await api('/api/withdraw-orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setMessage(`提现申请 #${result.id} 已创建`);
    await refresh();
  }

  async function refreshProviderJob(row) {
    const result = await api(`/api/provider-jobs/${row.id}/refresh`, { method: 'POST' });
    setMessage(`上游任务 #${row.id} 已同步为 ${result.status || row.status}`);
    await refresh();
  }

  if (!token) {
    return (
      <main className="auth-page">
        <form className="auth-card" onSubmit={submitAuth}>
          <img src="/brand/logo-icon.png" alt="seeFactory" />
          <h1>seeFactory 控制台</h1>
          <p>注册账号后即可创建真实 workflow，运行结果会写入任务与资产库。</p>
          <div className="segmented">
            <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>登录</button>
            <button type="button" className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}><UserPlus size={15} /> 注册</button>
          </div>
          {authMode === 'register' && (
            <label>
              昵称
              <input value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} placeholder="创作者名称" />
            </label>
          )}
          <label>
            邮箱
            <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" />
          </label>
          <label>
            密码
            <input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="至少 8 位" />
          </label>
          <button className="primary" disabled={loading}>{authMode === 'register' ? '创建账号' : '登录'}</button>
          {message && <div className="notice">{message}</div>}
        </form>
      </main>
    );
  }

  const taskAsset = extractTaskAsset(activeTask);

  return (
    <main className="shell">
      <aside className="sidebar">
        <a className="brand" href="/">
          <img src="/brand/logo-icon.png" alt="seeFactory" />
          <span>seeFactory</span>
        </a>
        <nav>
          {tabs.map(([key, label, Icon]) => (
            <button key={key} className={active === key ? 'active' : ''} onClick={() => setActive(key)}>
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <button className="icon-row" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            主题切换
          </button>
          <button className="icon-row" onClick={logout}>
            <LogOut size={16} />
            退出
          </button>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1>{tabs.find(([key]) => key === active)?.[1]}</h1>
          </div>
          <div className="top-actions">
            <button onClick={refresh}><RefreshCw size={15} /> 同步</button>
            <button className="primary" onClick={newWorkflow}><Plus size={15} /> 新建 workflow</button>
            <div className="user-pill">
              <span>{user?.displayName}</span>
              <strong>{money(state.wallet.balanceCents)}</strong>
            </div>
          </div>
        </header>

        {message && <div className="notice">{message}</div>}
        {loading && <div className="notice muted">正在同步平台真实数据...</div>}

        {active === 'overview' && <Overview state={state} summary={summary} user={user} setActive={setActive} newWorkflow={newWorkflow} />}

        {active === 'workflow' && (
          <ReactFlowProvider>
            <WorkflowPanel
              components={state.components}
              componentsByKey={componentsByKey}
              workflows={state.workflows}
              draft={draft}
              setDraft={setDraft}
              nodes={nodes}
              edges={edges}
              setNodes={setNodes}
              setEdges={setEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              selectedNodeId={selectedNodeId}
              setSelectedNodeId={setSelectedNodeId}
              estimate={estimate}
              runInput={runInput}
              setRunInput={setRunInput}
              addComponentNode={addComponentNode}
              updateNodeConfig={updateNodeConfig}
              removeNode={removeNode}
              loadWorkflow={loadWorkflow}
              saveWorkflow={saveWorkflow}
              validateWorkflow={validateWorkflow}
              runWorkflow={runWorkflow}
              publishWorkflow={publishWorkflow}
              downloadWorkflow={downloadWorkflow}
              importWorkflowFile={importWorkflowFile}
            />
          </ReactFlowProvider>
        )}

        {active === 'playground' && (
          <PlaygroundPanel
            api={api}
            assets={state.assets}
            models={state.models}
            refresh={refresh}
            setMessage={setMessage}
          />
        )}

        {active === 'models' && (
          <section className="grid two">
            <div className="panel">
              <h2>模型测试台</h2>
              <label>
                模型
                <select value={modelTest.modelKey} onChange={(event) => setModelTest({ ...modelTest, modelKey: event.target.value })}>
                  {state.models.map((model) => <option key={model.model_key} value={model.model_key}>{model.name}</option>)}
                </select>
              </label>
              <label>
                标题
                <input value={modelTest.title} onChange={(event) => setModelTest({ ...modelTest, title: event.target.value })} />
              </label>
              <label>
                提示词
                <textarea value={modelTest.prompt} onChange={(event) => setModelTest({ ...modelTest, prompt: event.target.value })} />
              </label>
              <button className="primary" onClick={runModelTest}><Play size={16} /> 真实测试</button>
              {modelResult?.asset && (
                <figure className="asset-preview">
                  <img src={assetUrl(modelResult.asset.url)} alt={modelResult.asset.title} />
                  <figcaption>{modelResult.asset.title}</figcaption>
                </figure>
              )}
            </div>
            <DataList title="模型池" rows={state.models} fields={['name', 'modality', 'provider', 'price_cents', 'status']} />
          </section>
        )}

        {active === 'workshop' && <Workshop rows={state.workshop} api={api} refresh={refresh} setMessage={setMessage} recharge={recharge} />}

        {active === 'billing' && (
          <BillingPanel
            summary={summary}
            wallet={state.wallet}
            ledgers={pages.ledgers}
            orders={pages.orders}
            withdraws={pages.withdraws}
            invite={invite}
            filters={filters}
            updateFilter={updateFilter}
            recharge={recharge}
            redeemCoupon={redeemCoupon}
            createWithdraw={createWithdraw}
          />
        )}

        {active === 'usage' && (
          <UsagePanel
            tasks={pages.tasks}
            providerJobs={pages.providerJobs}
            filters={filters.tasks}
            providerJobFilters={filters.providerJobs}
            updateFilter={(patch) => updateFilter('tasks', patch)}
            updateProviderJobFilter={(patch) => updateFilter('providerJobs', patch)}
            activeTask={activeTask}
            taskAsset={taskAsset}
            taskEvents={taskEvents}
            taskNodes={taskNodes}
            openTask={openTask}
            refreshProviderJob={refreshProviderJob}
          />
        )}

        {active === 'assets' && (
          <AssetGrid
            page={pages.assets}
            filters={filters.assets}
            updateFilter={(patch) => updateFilter('assets', patch)}
          />
        )}

        {active === 'profile' && (
          <ProfilePanel
            user={user}
            summary={summary}
            profileForm={profileForm}
            setProfileForm={setProfileForm}
            passwordForm={passwordForm}
            setPasswordForm={setPasswordForm}
            saveProfile={saveProfile}
            changePassword={changePassword}
          />
        )}
      </section>
    </main>
  );
}

function Overview({ state, summary, user, setActive, newWorkflow }) {
  const cards = [
    ['当前余额', money(summary?.balanceCents ?? state.wallet.balanceCents), '真实入账后用于扣费'],
    ['历史消耗', money(summary?.tasks?.costCents || 0), 'workflow 与模型调度成本'],
    ['请求次数', summary?.tasks?.total || 0, '全部调用记录'],
    ['成功任务', summary?.tasks?.succeeded || 0, '已完成产出链条']
  ];
  return (
    <section className="overview">
      <div className="hero-panel">
        <div>
          <p className="eyebrow">Hello</p>
          <h2>{user?.displayName}，把组件连成一条真正会产出资产的链。</h2>
          <p>当前运行器只暴露已经接入的真实组件。未配置运行器的模型不会伪造成功，运行失败会写入任务事件。</p>
          <div className="row-actions">
            <button className="primary" onClick={newWorkflow}><Plus size={15} /> 创建链条</button>
            <button onClick={() => setActive('workshop')}><PackageOpen size={15} /> 浏览工坊</button>
          </div>
        </div>
        <Sparkles size={42} />
      </div>
      <div className="metric-grid">
        {cards.map(([label, value, hint]) => (
          <article className="metric" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <p>{hint}</p>
          </article>
        ))}
      </div>
      <div className="grid two">
        <DataList title="最近调用" rows={summary?.recentTasks || []} fields={['id', 'status', 'workflow_title', 'cost_cents', 'created_at']} />
        <DataList title="最近充值订单" rows={summary?.recentOrders || []} fields={['id', 'amount_cents', 'status', 'channel', 'purpose', 'created_at']} />
      </div>
    </section>
  );
}

function PlaygroundPanel({ api, assets, models, refresh, setMessage }) {
  const modes = [
    ['chat', '对话', MessageSquareText, '文本生成、脚本、提示词', 'text_to_text'],
    ['multimodal_chat', '图生文', Image, '上传或选择图片后提问', 'image_to_text'],
    ['text_to_image', '生图', Sparkles, 'Prompt 生成图片资产', 'text_to_image'],
    ['text_to_video', '生视频', Video, 'Prompt 生成视频任务', 'text_to_video'],
    ['image_to_video', '图生视频', Play, '首帧图片生成视频任务', 'image_to_video']
  ];
  const [sessions, setSessions] = useState(emptyPage);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState('chat');
  const [selectedModel, setSelectedModel] = useState('');
  const [text, setText] = useState('为一个 AI 短剧镜头设计画面和动作');
  const [assetId, setAssetId] = useState('');
  const [params, setParams] = useState({ title: 'seeFactory 操练场', palette: 'sage', duration: 6, ratio: '9:16' });
  const [busy, setBusy] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const currentMode = modes.find(([key]) => key === mode) || modes[0];
  const currentNodeType = currentMode[4];
  const modelsForMode = useMemo(
    () => (models || []).filter((model) => model.schema?.nodeType === currentNodeType),
    [models, currentNodeType]
  );
  const selectedModelRow = modelsForMode.find((model) => model.model_key === selectedModel) || null;

  useEffect(() => {
    if (!modelsForMode.length) {
      setSelectedModel('');
      return;
    }
    if (!modelsForMode.some((model) => model.model_key === selectedModel)) {
      setSelectedModel(modelsForMode[0].model_key);
    }
  }, [modelsForMode, selectedModel]);

  async function loadSessions(nextActiveId = activeSessionId) {
    const page = await api('/api/playground/sessions?pageSize=30');
    let items = page.items || [];
    let selectedId = nextActiveId || items[0]?.id;
    if (!items.length) {
      const created = await api('/api/playground/sessions', {
        method: 'POST',
        body: JSON.stringify({ title: '我的操练场', type: 'mixed' })
      });
      items = [created];
      selectedId = created.id;
    }
    setSessions({ ...page, items });
    setActiveSessionId(selectedId);
    if (selectedId) await loadMessages(selectedId);
  }

  async function loadMessages(sessionId = activeSessionId) {
    if (!sessionId) return;
    const page = await api(`/api/playground/sessions/${sessionId}/messages?pageSize=80`);
    setMessages(page.items || []);
  }

  useEffect(() => {
    loadSessions().catch((error) => setMessage(error.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createSession() {
    const created = await api('/api/playground/sessions', {
      method: 'POST',
      body: JSON.stringify({ title: `操练场 ${new Date().toLocaleTimeString()}`, type: 'mixed' })
    });
    await loadSessions(created.id);
  }

  async function deleteSession(sessionId) {
    await api(`/api/playground/sessions/${sessionId}`, { method: 'DELETE' });
    setMessage('操练场 session 已删除');
    setActiveSessionId(null);
    await loadSessions(null);
  }

  async function runPlayground() {
    if (!activeSessionId) return;
    setBusy(true);
    try {
      if (!selectedModel) {
        setMessage('当前模式没有可用模型，请先让管理员配置并上线模型能力');
        return;
      }
      const needsAsset = mode === 'multimodal_chat' || mode === 'image_to_video';
      if (needsAsset && !assetId) {
        setMessage('当前模式需要先选择一个图片资产');
        return;
      }
      const input = {
        text,
        prompt: text,
        assetId: assetId ? Number(assetId) : undefined,
        assetIds: assetId ? [Number(assetId)] : []
      };
      const result = await api(`/api/playground/sessions/${activeSessionId}/run`, {
        method: 'POST',
        body: JSON.stringify({ mode, capabilityKey: selectedModel, input, params })
      });
      setLastRun(result);
      setMessage(`操练场运行完成，消耗 ${money(result.billing?.actualCostCents || 0)}`);
      await loadMessages(activeSessionId);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  const activeSession = (sessions.items || []).find((item) => item.id === activeSessionId);
  const imageAssets = (assets || []).filter((asset) => ['image', 'poster', 'banner'].includes(asset.asset_type || asset.assetType));

  return (
    <section className="playground-shell">
      <aside className="panel playground-sessions">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Playground</span>
            <h2>操练场</h2>
          </div>
          <button onClick={createSession}><Plus size={15} /> 新建</button>
        </div>
        <div className="session-list">
          {(sessions.items || []).map((session) => (
            <button
              key={session.id}
              className={session.id === activeSessionId ? 'active session-item' : 'session-item'}
              onClick={() => {
                setActiveSessionId(session.id);
                loadMessages(session.id);
              }}
            >
              <span>{session.title}</span>
              <small>{session.last_mode || session.session_type} · {money(session.total_cost_cents || 0)}</small>
            </button>
          ))}
        </div>
        {activeSession && (
          <button className="danger soft" onClick={() => deleteSession(activeSession.id)}><Trash2 size={15} /> 删除当前 session</button>
        )}
      </aside>

      <main className="panel playground-chat">
        <div className="panel-head">
          <div>
            <span className="eyebrow">Session</span>
            <h2>{activeSession?.title || '操练场'}</h2>
          </div>
          <span className="pill">{messages.length} 条消息</span>
        </div>
        <div className="message-stream">
          {!messages.length && <div className="empty-table">选择能力并运行，session 会自动保存到服务器。</div>}
          {messages.map((item) => (
            <article key={item.id} className={`chat-message ${item.role}`}>
              <span>{item.role === 'user' ? '你' : item.role === 'assistant' ? 'seeFactory' : '系统'}</span>
              <p>{item.content || '已保存多模态输入'}</p>
              {!!item.assetRefs?.length && <small>资产：{item.assetRefs.join(', ')}</small>}
              {!!item.cost_cents && <small>消耗 {money(item.cost_cents)}</small>}
            </article>
          ))}
        </div>
        {lastRun?.assets?.length > 0 && (
          <div className="playground-assets">
            {lastRun.assets.map((asset) => (
              <a key={asset.id} href={assetUrl(asset.url)} target="_blank" rel="noreferrer">
                {asset.assetType === 'video' ? <Video size={18} /> : <Image size={18} />}
                #{asset.id} {asset.title}
              </a>
            ))}
          </div>
        )}
      </main>

      <aside className="panel playground-config">
        <span className="eyebrow">Mode</span>
        <div className="mode-grid">
          {modes.map(([key, label, Icon, hint]) => (
            <button key={key} className={mode === key ? 'active' : ''} onClick={() => setMode(key)}>
              <Icon size={16} />
              <span>{label}</span>
              <small>{hint}</small>
            </button>
          ))}
        </div>
        <label>
          模型能力
          <select value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)}>
            {!modelsForMode.length && <option value="">当前模式暂无可用模型</option>}
            {modelsForMode.map((model) => (
              <option key={model.model_key} value={model.model_key}>
                {model.name} · {money(model.price_cents)}
              </option>
            ))}
          </select>
        </label>
        <div className="playground-model-card">
          <span>运行前预估</span>
          <strong>{selectedModelRow ? money(selectedModelRow.price_cents) : '暂无模型'}</strong>
          <small>
            {selectedModelRow
              ? `${selectedModelRow.name} / ${currentNodeType}`
              : '该能力未配置可上线模型，不能运行'}
          </small>
        </div>
        <label>
          输入
          <textarea value={text} onChange={(event) => setText(event.target.value)} />
        </label>
        {(mode === 'multimodal_chat' || mode === 'image_to_video') && (
          <label>
            图片资产
            <select value={assetId} onChange={(event) => setAssetId(event.target.value)}>
              <option value="">选择图片资产</option>
              {imageAssets.map((asset) => <option key={asset.id} value={asset.id}>#{asset.id} {asset.title}</option>)}
            </select>
          </label>
        )}
        {mode === 'text_to_image' && (
          <>
            <label>
              标题
              <input value={params.title} onChange={(event) => setParams({ ...params, title: event.target.value })} />
            </label>
            <label>
              色调
              <select value={params.palette} onChange={(event) => setParams({ ...params, palette: event.target.value })}>
                <option value="sage">Sage</option>
                <option value="graphite">Graphite</option>
                <option value="clay">Clay</option>
              </select>
            </label>
          </>
        )}
        {(mode === 'text_to_video' || mode === 'image_to_video') && (
          <>
            <label>
              时长
              <input type="number" min="2" max="30" value={params.duration} onChange={(event) => setParams({ ...params, duration: Number(event.target.value) })} />
            </label>
            <label>
              画幅
              <select value={params.ratio} onChange={(event) => setParams({ ...params, ratio: event.target.value })}>
                <option value="9:16">9:16</option>
                <option value="16:9">16:9</option>
                <option value="1:1">1:1</option>
              </select>
            </label>
          </>
        )}
        <div className="playground-models">
          <strong>当前模式可选模型</strong>
          {modelsForMode.map((model) => (
            <button
              type="button"
              key={model.model_key}
              className={model.model_key === selectedModel ? 'active' : ''}
              onClick={() => setSelectedModel(model.model_key)}
            >
              <span>{model.name}</span>
              <small>{money(model.price_cents)}</small>
            </button>
          ))}
          {!modelsForMode.length && <span>等待管理员配置该模式的模型能力</span>}
        </div>
        <button className="primary wide" disabled={busy || !activeSessionId || !selectedModel} onClick={runPlayground}>
          <Play size={16} /> {busy ? '运行中' : '运行操练'}
        </button>
      </aside>
    </section>
  );
}

function WorkflowPanel(props) {
  const {
    components,
    componentsByKey,
    workflows,
    draft,
    setDraft,
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedNodeId,
    setSelectedNodeId,
    estimate,
    runInput,
    setRunInput,
    addComponentNode,
    updateNodeConfig,
    removeNode,
    loadWorkflow,
    saveWorkflow,
    validateWorkflow,
    runWorkflow,
    publishWorkflow,
    downloadWorkflow,
    importWorkflowFile
  } = props;
  const { screenToFlowPosition } = useReactFlow();
  const selectedNode = nodes.find((node) => node.id === selectedNodeId);
  const selectedComponent = selectedNode ? componentsByKey[selectedNode.data.componentKey] : null;

  function onDrop(event) {
    event.preventDefault();
    const key = event.dataTransfer.getData('application/seefactory-component') || event.dataTransfer.getData('text/plain');
    const component = components.find((item) => item.component_key === key);
    if (!component) return;
    addComponentNode(component, screenToFlowPosition({ x: event.clientX, y: event.clientY }));
  }

  return (
    <section className="workflow-grid">
      <aside className="panel palette">
        <div className="panel-head">
          <h2>组件库</h2>
          <span>{components.length}</span>
        </div>
        {components.map((component) => (
          <button
            key={component.id}
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData('application/seefactory-component', component.component_key);
              event.dataTransfer.effectAllowed = 'move';
            }}
            onClick={() => addComponentNode(component)}
          >
            <span style={{ background: component.uiSchema?.color || '#e8e2d6' }} />
            <strong>{component.label}</strong>
            <small>{component.category}</small>
          </button>
        ))}
        <div className="mini-help">
          <MousePointer2 size={15} />
          拖到画布，移动节点，再从右侧圆点拖线到下一个节点。
        </div>
        <div className="workflow-list">
          <h3>我的 workflow</h3>
          {workflows.map((workflow) => (
            <button key={workflow.id} className={draft.id === workflow.id ? 'active' : ''} onClick={() => loadWorkflow(workflow)}>
              <FileJson size={15} />
              <span>{workflow.title}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="panel builder">
        <div className="builder-head">
          <div className="builder-fields">
            <input className="title-input" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
            <textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
            <label>
              运行文本
              <input value={runInput} onChange={(event) => setRunInput(event.target.value)} />
            </label>
            <label>
              发布授权
              <select value={draft.licenseMode || 'closed'} onChange={(event) => setDraft({ ...draft, licenseMode: event.target.value })}>
                <option value="closed">闭源可运行</option>
                <option value="open">开源可克隆</option>
              </select>
            </label>
            <label>
              工坊标签
              <input value={draft.tags || ''} onChange={(event) => setDraft({ ...draft, tags: event.target.value })} />
            </label>
            <label>
              售价（分）
              <input type="number" min="0" value={draft.priceCents || 0} onChange={(event) => setDraft({ ...draft, priceCents: Number(event.target.value || 0) })} />
            </label>
          </div>
          <div className="builder-actions">
            <span>{money(estimate)} / 次</span>
            <button onClick={validateWorkflow}><Link2 size={15} /> 校验</button>
            <button onClick={saveWorkflow}><Save size={15} /> 保存</button>
            <button className="primary" onClick={runWorkflow}><Play size={15} /> 运行</button>
            <button onClick={publishWorkflow}><UploadCloud size={15} /> 发布</button>
            <button onClick={importWorkflowFile}><UploadCloud size={15} /> 导入</button>
            <button onClick={downloadWorkflow}><Download size={15} /> 导出</button>
          </div>
        </div>
        <div className="canvas" onDrop={onDrop} onDragOver={(event) => event.preventDefault()}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(event, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId('')}
            fitView
          >
            <Background gap={28} color="var(--grid-line)" />
            <Controls />
            <MiniMap pannable zoomable nodeColor={(node) => componentsByKey[node.data.componentKey]?.uiSchema?.color || '#dcebdc'} />
          </ReactFlow>
          {!nodes.length && <div className="empty canvas-empty">把真实组件拖到这里</div>}
        </div>
      </section>

      <aside className="panel inspector">
        <div className="panel-head">
          <h2>节点配置</h2>
          {selectedNode && <button onClick={() => removeNode(selectedNode.id)}><Trash2 size={14} /> 移除</button>}
        </div>
        {!selectedNode ? (
          <div className="empty-table">选择画布上的节点</div>
        ) : (
          <>
            <div className="selected-card">
              <strong>{selectedNode.data.label}</strong>
              <span>{selectedNode.data.componentKey}</span>
              <p>{selectedComponent?.description}</p>
            </div>
            {(selectedComponent?.uiSchema?.fields || []).map((field) => (
              <ConfigField
                key={field.key}
                field={field}
                value={selectedNode.data.config?.[field.key] ?? ''}
                onChange={(value) => updateNodeConfig(selectedNode.id, { [field.key]: value })}
              />
            ))}
          </>
        )}
      </aside>
    </section>
  );
}

function WorkflowNode({ data, selected }) {
  return (
    <div className={`flow-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <strong>{data.label}</strong>
      <span>{data.componentKey}</span>
      <small>{data.category}</small>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function ConfigField({ field, value, onChange }) {
  if (field.type === 'select') {
    return (
      <label>
        {field.label}
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">默认</option>
          {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>
    );
  }
  if (field.type === 'textarea') {
    return (
      <label>
        {field.label}
        <textarea value={value} onChange={(event) => onChange(event.target.value)} />
      </label>
    );
  }
  return (
    <label>
      {field.label}
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={(event) => onChange(field.type === 'number' ? Number(event.target.value) : event.target.value)}
      />
    </label>
  );
}

function Workshop({ rows, api, refresh, setMessage, recharge }) {
  const [filters, setFilters] = useState({ page: 1, pageSize: 9, q: '', licenseMode: 'all', sort: 'popular' });
  const [page, setPage] = useState(normalizePage(rows, 9));
  const [selected, setSelected] = useState(null);
  const [comments, setComments] = useState(normalizePage([], 6));
  const [estimate, setEstimate] = useState(null);
  const [runPrompt, setRunPrompt] = useState('');
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [report, setReport] = useState({ reason: '内容违规', detail: '' });
  const [paymentChannel, setPaymentChannel] = useState('wechat');

  const loadPage = useCallback(async (nextFilters = filters) => {
    const payload = await api(`/api/workshop/items?${queryFrom(nextFilters)}`);
    setPage(normalizePage(payload, nextFilters.pageSize));
  }, [api, filters]);

  useEffect(() => {
    loadPage(filters).catch((error) => setMessage(error.message || '创意工坊加载失败'));
  }, []);

  async function openItem(item) {
    const [detail, commentPage, cost] = await Promise.all([
      api(`/api/workshop/items/${item.id}`),
      api(`/api/workshop/items/${item.id}/comments?page=1&pageSize=6`),
      api(`/api/workshop/items/${item.id}/estimate`).catch(() => null)
    ]);
    setSelected(detail);
    setComments(normalizePage(commentPage, 6));
    setEstimate(cost);
    setRunPrompt(detail.summary || detail.title || '');
  }

  async function applyFilters(patch) {
    const next = { ...filters, ...patch };
    setFilters(next);
    await loadPage(next);
  }

  async function reloadSelected(item = selected) {
    if (!item?.id) return;
    await openItem(item);
    await loadPage(filters);
  }

  async function run(item = selected) {
    const result = await api(`/api/workshop/items/${item.id}/run`, {
      method: 'POST',
      body: JSON.stringify({ prompt: runPrompt || item.title })
    });
    setMessage(`工坊 workflow 已真实运行：#${result.taskId}`);
    await reloadSelected(item);
    await refresh();
  }

  async function createRunPayment(item = selected) {
    const amount = Number(estimate?.estimatedCostCents || 0);
    if (!item?.id || amount <= 0) {
      setMessage('当前样例无需创建支付订单');
      return;
    }
    await recharge(amount, paymentChannel, {
      purpose: 'workflow_run',
      refType: 'workshop_item',
      refId: Number(item.id)
    });
  }

  async function clone(item = selected) {
    await api(`/api/workshop/items/${item.id}/clone`, { method: 'POST' });
    setMessage('已克隆到我的 workflow');
    await refresh();
  }

  async function favorite(item = selected) {
    await api(`/api/workshop/items/${item.id}/favorite`, { method: 'POST' });
    setMessage('已收藏该 workflow');
    await reloadSelected(item);
  }

  async function rate(item = selected) {
    await api(`/api/workshop/items/${item.id}/rating`, {
      method: 'POST',
      body: JSON.stringify({ rating: Number(rating) })
    });
    setMessage('评分已提交');
    await reloadSelected(item);
  }

  async function comment(item = selected) {
    if (!commentText.trim()) return;
    await api(`/api/workshop/items/${item.id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content: commentText.trim() })
    });
    setCommentText('');
    setMessage('评论已发布');
    await reloadSelected(item);
  }

  async function reportItem(item = selected) {
    await api(`/api/workshop/items/${item.id}/report`, {
      method: 'POST',
      body: JSON.stringify(report)
    });
    setReport({ reason: '内容违规', detail: '' });
    setMessage('举报已提交，等待管理员审核');
  }

  return (
    <section className="stack">
      <div className="panel filter-row">
        <span className="searchbox"><Search size={15} /><input value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} placeholder="标题、作者、标签" /></span>
        <select value={filters.licenseMode} onChange={(event) => applyFilters({ licenseMode: event.target.value, page: 1 })}>
          <option value="all">全部授权</option>
          <option value="open">开源</option>
          <option value="closed">闭源</option>
        </select>
        <select value={filters.sort} onChange={(event) => applyFilters({ sort: event.target.value, page: 1 })}>
          <option value="popular">热门</option>
          <option value="latest">最新</option>
          <option value="income">收入</option>
          <option value="rating">评分</option>
        </select>
        <button onClick={() => applyFilters({ page: 1 })}>搜索</button>
      </div>
      <section className="grid cards">
        {!page.items.length && <div className="panel empty-table">创意工坊还没有公开项目</div>}
        {page.items.map((item) => (
          <article className="panel workshop-item" key={item.id}>
            <h2>{item.title}</h2>
            <p>{item.summary}</p>
            <div className="tags">{(item.tags || []).map((tag) => <span key={tag}>{tag}</span>)}</div>
            <div className="status-line">
              <span>{item.license_mode === 'open' ? '开源' : '闭源'} · {money(item.price_cents || 0)}</span>
              <span>评分 {Number(item.avg_rating || 0).toFixed(1)} / 收藏 {item.favorite_count || 0}</span>
            </div>
            <div className="row-actions">
              <button onClick={() => openItem(item)}>详情</button>
              {item.license_mode === 'open' && <button onClick={() => clone(item)}><Plus size={15} /> 克隆</button>}
            </div>
          </article>
        ))}
      </section>
      <Pagination page={page} onChange={applyFilters} />

      {selected && (
        <section className="panel task-detail">
          <div className="panel-head">
            <h2>{selected.title}</h2>
            <span className="pill">{selected.license_mode === 'open' ? '开源' : '闭源'}</span>
          </div>
          <p>{selected.summary || selected.description}</p>
          <div className="status-line">
            <strong>{estimate ? money(estimate.estimatedCostCents) : money(selected.price_cents || 0)} / 次</strong>
            <span>模型 {estimate ? money(estimate.modelUsageCostCents) : '-'} · workflow {estimate ? money(estimate.workflowFeeCents) : money(selected.price_cents || 0)}</span>
          </div>
          {estimate?.estimatedCostCents > 0 && (
            <div className="payment-inline">
              <select value={paymentChannel} onChange={(event) => setPaymentChannel(event.target.value)}>
                <option value="wechat">微信支付</option>
                <option value="alipay">支付宝</option>
              </select>
              <button onClick={() => createRunPayment(selected)}><CreditCard size={15} /> 按预估费用支付</button>
            </div>
          )}
          <label>运行提示词<textarea value={runPrompt} onChange={(event) => setRunPrompt(event.target.value)} /></label>
          <div className="row-actions">
            <button className="primary" onClick={() => run(selected)}><Play size={15} /> 运行</button>
            {selected.license_mode === 'open' && <button onClick={() => clone(selected)}><Plus size={15} /> 克隆</button>}
            <button onClick={() => favorite(selected)}>收藏</button>
          </div>
          <div className="grid two">
            <div>
              <h3>评分与评论</h3>
              <label>评分<select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
                {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} 星</option>)}
              </select></label>
              <button onClick={() => rate(selected)}>提交评分</button>
              <label>评论<textarea value={commentText} onChange={(event) => setCommentText(event.target.value)} /></label>
              <button onClick={() => comment(selected)}>发布评论</button>
              <div className="event-list">
                {comments.items.map((item) => (
                  <div key={item.id}>
                    <span>{item.user_name}</span>
                    <p>{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3>举报</h3>
              <label>原因<input value={report.reason} onChange={(event) => setReport({ ...report, reason: event.target.value })} /></label>
              <label>详情<textarea value={report.detail} onChange={(event) => setReport({ ...report, detail: event.target.value })} /></label>
              <button onClick={() => reportItem(selected)}>提交举报</button>
            </div>
          </div>
        </section>
      )}
    </section>
  );
}

function BillingPanel({ summary, wallet, ledgers, orders, withdraws, invite, filters, updateFilter, recharge, redeemCoupon, createWithdraw }) {
  const [customRecharge, setCustomRecharge] = useState(1000);
  const [rechargeChannel, setRechargeChannel] = useState('wechat');
  const [couponCode, setCouponCode] = useState('');
  const [withdrawForm, setWithdrawForm] = useState({ amountCents: 100, channel: 'alipay', accountName: '', accountNo: '' });
  const rechargeOptions = [
    { label: '¥100', amountCents: 10000 },
    { label: '¥500', amountCents: 50000 },
    { label: '¥1000', amountCents: 100000 }
  ];
  return (
    <section className="stack">
      <div className="billing-hero panel">
        <div>
          <p className="eyebrow">账单</p>
          <h2>{money(wallet.balanceCents)}</h2>
          <p>充值订单创建后保持待确认，管理员确认真实收款才会入账。所有扣费与入账都会写入钱包流水。</p>
        </div>
        <div className="billing-actions">
          {rechargeOptions.map((option) => (
            <button key={option.amountCents} onClick={() => recharge(option.amountCents, rechargeChannel)}><CreditCard size={15} /> 创建 {option.label} 订单</button>
          ))}
        </div>
      </div>

      <div className="billing-tools">
        <section className="panel billing-tool">
          <div className="panel-head">
            <h2>自定义充值</h2>
            <CreditCard size={17} />
          </div>
          <label>充值渠道<select value={rechargeChannel} onChange={(event) => setRechargeChannel(event.target.value)}>
            <option value="wechat">微信支付</option>
            <option value="alipay">支付宝</option>
            <option value="manual">手动登记</option>
          </select></label>
          <label>金额（分）<input type="number" min="1" value={customRecharge} onChange={(event) => setCustomRecharge(Number(event.target.value || 0))} /></label>
          <button onClick={() => recharge(customRecharge, rechargeChannel)}>创建充值订单</button>
        </section>
        <section className="panel billing-tool">
          <div className="panel-head">
            <h2>优惠券</h2>
            <ReceiptText size={17} />
          </div>
          <label>优惠券码<input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="SF-COUPON" /></label>
          <button onClick={() => redeemCoupon(couponCode)}>兑换优惠券</button>
        </section>
        <section className="panel billing-tool">
          <div className="panel-head">
            <h2>提现申请</h2>
            <CircleDollarSign size={17} />
          </div>
          <div className="grid two compact-grid">
            <label>提现金额（分）<input type="number" min="1" value={withdrawForm.amountCents} onChange={(event) => setWithdrawForm({ ...withdrawForm, amountCents: Number(event.target.value || 0) })} /></label>
            <label>提现渠道<select value={withdrawForm.channel} onChange={(event) => setWithdrawForm({ ...withdrawForm, channel: event.target.value })}>
              <option value="alipay">支付宝</option>
              <option value="wechat">微信</option>
            </select></label>
          </div>
          <label>收款姓名<input value={withdrawForm.accountName} onChange={(event) => setWithdrawForm({ ...withdrawForm, accountName: event.target.value })} /></label>
          <label>收款账号<input value={withdrawForm.accountNo} onChange={(event) => setWithdrawForm({ ...withdrawForm, accountNo: event.target.value })} /></label>
          <button onClick={() => createWithdraw(withdrawForm)}>创建提现申请</button>
        </section>
      </div>

      <div className="panel invite-panel">
        <div>
          <p className="eyebrow">邀请</p>
          <h2>{invite?.code || '暂无邀请码'}</h2>
          <p>被邀请用户完成真实充值后，邀请奖励会自动入账。</p>
        </div>
        <div className="mini-stats">
          <span>待入账 {invite?.stats?.pending || 0}</span>
          <span>已入账 {invite?.stats?.granted || 0}</span>
          <span>{money(invite?.stats?.reward_cents || 0)}</span>
        </div>
      </div>

      <div className="metric-grid">
        <article className="metric"><span>已支付金额</span><strong>{money(summary?.orders?.paidAmountCents || 0)}</strong><p>确认收款后的充值总额</p></article>
        <article className="metric"><span>待确认订单</span><strong>{summary?.orders?.pending || 0}</strong><p>等待 Admin 核销</p></article>
        <article className="metric"><span>累计入账</span><strong>{money(summary?.ledgers?.incomeCents || 0)}</strong><p>充值与管理员调额</p></article>
        <article className="metric"><span>累计消耗</span><strong>{money(summary?.ledgers?.expenseCents || 0)}</strong><p>真实 workflow 调度扣费</p></article>
      </div>

      <PaginatedTable
        title="充值订单"
        icon={<ReceiptText size={17} />}
        page={orders}
        filters={filters.orders}
        onFilter={(patch) => updateFilter('orders', patch)}
        statusOptions={['pending', 'paid', 'failed', 'cancelled']}
        searchPlaceholder="搜索订单号、渠道或状态"
        columns={[
          ['id', 'ID'],
          ['amount_cents', '金额'],
          ['status', '状态'],
          ['channel', '渠道'],
          ['purpose', '用途'],
          ['ref_type', '关联类型'],
          ['ref_id', '关联 ID'],
          ['external_no', '外部单号'],
          ['created_at', '创建时间']
        ]}
      />

      <PaginatedTable
        title="提现申请"
        icon={<CircleDollarSign size={17} />}
        page={withdraws}
        filters={filters.withdraws}
        onFilter={(patch) => updateFilter('withdraws', patch)}
        statusOptions={['pending', 'approved', 'paid', 'rejected', 'cancelled']}
        searchPlaceholder="搜索提现状态、渠道或账号"
        columns={[
          ['id', 'ID'],
          ['amount_cents', '申请金额'],
          ['arrival_cents', '到账金额'],
          ['channel', '渠道'],
          ['status', '状态'],
          ['created_at', '创建时间']
        ]}
      />

      <PaginatedTable
        title="钱包流水"
        icon={<CircleDollarSign size={17} />}
        page={ledgers}
        filters={filters.ledgers}
        onFilter={(patch) => updateFilter('ledgers', patch)}
        directionOptions
        searchPlaceholder="搜索流水原因或关联对象"
        columns={[
          ['id', 'ID'],
          ['amount_cents', '变动'],
          ['reason', '原因'],
          ['ref_type', '关联类型'],
          ['ref_id', '关联 ID'],
          ['created_at', '时间']
        ]}
      />
    </section>
  );
}

function UsagePanel({ tasks, providerJobs, filters, providerJobFilters, updateFilter, updateProviderJobFilter, activeTask, taskAsset, taskEvents, taskNodes, openTask, refreshProviderJob }) {
  return (
    <section className="grid two usage-grid">
      <PaginatedTable
        title="调用记录"
        icon={<Activity size={17} />}
        page={tasks}
        filters={filters}
        onFilter={updateFilter}
        statusOptions={['queued', 'running', 'succeeded', 'failed', 'cancelled']}
        searchPlaceholder="搜索任务 ID、状态、工作流或错误"
        columns={[
          ['id', 'ID'],
          ['status', '状态'],
          ['workflow_title', '工作流'],
          ['workshop_title', '工坊来源'],
          ['cost_cents', '扣费'],
          ['created_at', '创建时间']
        ]}
        action={(row) => <button onClick={() => openTask(row.id)}>查看</button>}
      />
      <PaginatedTable
        title="供应方视频任务"
        icon={<Video size={17} />}
        page={providerJobs}
        filters={providerJobFilters}
        onFilter={updateProviderJobFilter}
        statusOptions={['queued', 'running', 'waiting_callback', 'succeeded', 'failed', 'cancelled']}
        searchPlaceholder="供应方、模型、上游任务号或状态"
        columns={[
          ['id', 'ID'],
          ['provider_key', '供应方'],
          ['model_key', '模型'],
          ['upstream_job_id', '上游任务'],
          ['mode', '模式'],
          ['status', '状态'],
          ['asset_id', '资产'],
          ['updated_at', '更新时间']
        ]}
        action={(row) => ['queued', 'running', 'waiting_callback'].includes(row.status)
          ? <button onClick={() => refreshProviderJob(row)}><RefreshCw size={15} /> 刷新</button>
          : <span>{row.status}</span>}
      />
      <div className="panel task-detail">
        <div className="panel-head">
          <h2>调用详情</h2>
          <span className="pill">{activeTask ? `#${activeTask.id}` : '未选择'}</span>
        </div>
        {!activeTask ? <div className="empty-table">选择一条调用记录查看真实执行结果</div> : (
          <>
            <div className="status-line">
              <strong>{money(activeTask.cost_cents)}</strong>
              <span>{activeTask.status}</span>
            </div>
            {activeTask.error_message && <div className="notice danger">{activeTask.error_message}</div>}
            {taskAsset && (
              <figure className="asset-preview">
                <img src={assetUrl(taskAsset.url)} alt={taskAsset.title} />
                <figcaption>{taskAsset.title}</figcaption>
              </figure>
            )}
            <pre>{JSON.stringify(activeTask.input || {}, null, 2)}</pre>
            <div className="event-list">
              {taskNodes.length ? taskNodes.map((node) => (
                <div key={node.id || node.node_id}>
                  <span>{node.node_label || node.label || node.component_key || node.node_id} · {node.status}</span>
                  <p>{node.error_message || `版本 ${node.workflow_version_id || '-'} / 节点 ${node.node_id}`}</p>
                </div>
              )) : (
                <div>
                  <span>节点明细</span>
                  <p>暂无节点级执行记录</p>
                </div>
              )}
            </div>
            <div className="event-list">
              {taskEvents.map((event) => (
                <div key={event.id}>
                  <span>{event.event_type}</span>
                  <p>{event.message}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function ProfilePanel({ user, summary, profileForm, setProfileForm, passwordForm, setPasswordForm, saveProfile, changePassword }) {
  return (
    <section className="grid two profile-grid">
      <form className="panel profile-panel" onSubmit={saveProfile}>
        <div className="panel-head">
          <h2>账号资料</h2>
          <UserRound size={18} />
        </div>
        <div className="profile-card">
          <div className="avatar-mark">{(profileForm.displayName || profileForm.email || 'S').slice(0, 1).toUpperCase()}</div>
          <div>
            <strong>{profileForm.displayName}</strong>
            <span>{user?.role} / {user?.status}</span>
          </div>
        </div>
        <label>
          昵称
          <input value={profileForm.displayName} onChange={(event) => setProfileForm({ ...profileForm, displayName: event.target.value })} />
        </label>
        <label>
          邮箱
          <input value={profileForm.email} onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })} />
        </label>
        <label>
          计费偏好
          <select value={profileForm.billingPreference} onChange={(event) => setProfileForm({ ...profileForm, billingPreference: event.target.value })}>
            <option value="balance_first">优先使用余额</option>
            <option value="subscription_first">优先使用套餐</option>
            <option value="manual_review">大额调用前人工确认</option>
          </select>
        </label>
        <label>
          语言
          <select value={profileForm.locale} onChange={(event) => setProfileForm({ ...profileForm, locale: event.target.value })}>
            <option value="zh-CN">简体中文</option>
            <option value="zh-TW">繁体中文</option>
            <option value="en-US">English</option>
          </select>
        </label>
        <button className="primary" type="submit">保存资料</button>
      </form>

      <div className="stack">
        <form className="panel" onSubmit={changePassword}>
          <div className="panel-head">
            <h2>登录安全</h2>
            <KeyRound size={18} />
          </div>
          <label>
            当前密码
            <input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} />
          </label>
          <label>
            新密码
            <input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} />
          </label>
          <button type="submit">更新密码</button>
        </form>

        <div className="panel security-notes">
          <div className="panel-head">
            <h2>账户概览</h2>
            <ShieldCheck size={18} />
          </div>
          <div className="mini-stats">
            <span><BarChart3 size={15} /> 调用 {summary?.tasks?.total || 0}</span>
            <span><CheckCircle2 size={15} /> 成功 {summary?.tasks?.succeeded || 0}</span>
            <span><CircleDollarSign size={15} /> 消耗 {money(summary?.tasks?.costCents || 0)}</span>
          </div>
          <p className="muted-text">seeFactory 当前使用平台统一模型池。个人侧只管理账号资料、调用记录和资金流水，不暴露底层运行器密钥。</p>
        </div>
      </div>
    </section>
  );
}

function AssetGrid({ page, filters, updateFilter }) {
  const rows = page.items || [];
  return (
    <section className="stack">
      <div className="panel">
        <div className="toolbar">
          <label>
            搜索资产
            <span className="searchbox"><Search size={15} /><input value={filters.q} onChange={(event) => updateFilter({ q: event.target.value, page: 1 })} placeholder="标题、类型或 URL" /></span>
          </label>
          <label>
            类型
            <select value={filters.assetType} onChange={(event) => updateFilter({ assetType: event.target.value, page: 1 })}>
              <option value="all">全部</option>
              <option value="image">image</option>
              <option value="poster">poster</option>
              <option value="banner">banner</option>
              <option value="video">video</option>
              <option value="file">file</option>
            </select>
          </label>
        </div>
      </div>
      <section className="asset-grid">
      {!rows.length && <div className="panel empty-table">资产库为空。运行 workflow 后会出现真实产物。</div>}
      {rows.map((asset) => (
        <article className="panel asset-card" key={asset.id}>
          {asset.asset_type !== 'video' && <img src={assetUrl(asset.url)} alt={asset.title} />}
          <div>
            <strong>{asset.title}</strong>
            <span>{asset.asset_type}</span>
            <small>{asset.url}</small>
          </div>
        </article>
      ))}
      </section>
      <Pagination page={page} onChange={(patch) => updateFilter(patch)} />
    </section>
  );
}

function PaginatedTable({ title, icon, page, filters, onFilter, columns, action, statusOptions, directionOptions, searchPlaceholder }) {
  return (
    <section className="panel data-list paginated">
      <div className="panel-head">
        <h2>{icon}{title}</h2>
        <span className="pill">{page.total} 条</span>
      </div>
      <div className="toolbar">
        <label>
          搜索
          <span className="searchbox"><Search size={15} /><input value={filters.q || ''} onChange={(event) => onFilter({ q: event.target.value, page: 1 })} placeholder={searchPlaceholder} /></span>
        </label>
        {statusOptions && (
          <label>
            状态
            <select value={filters.status || 'all'} onChange={(event) => onFilter({ status: event.target.value, page: 1 })}>
              <option value="all">全部</option>
              {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
        )}
        {directionOptions && (
          <label>
            方向
            <select value={filters.direction || 'all'} onChange={(event) => onFilter({ direction: event.target.value, page: 1 })}>
              <option value="all">全部</option>
              <option value="income">入账</option>
              <option value="expense">扣费</option>
            </select>
          </label>
        )}
        <label>
          每页
          <select value={filters.pageSize || page.pageSize} onChange={(event) => onFilter({ pageSize: Number(event.target.value), page: 1 })}>
            {[5, 10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
      </div>
      {!page.items.length ? (
        <div className="empty-table">暂无数据</div>
      ) : (
        <div className="table">
          <div className="tr head" style={{ '--cols': columns.length + (action ? 1 : 0) }}>
            {columns.map(([, label]) => <span key={label}>{label}</span>)}
            {action && <span>操作</span>}
          </div>
          {page.items.map((row) => (
            <div className="tr" key={row.id} style={{ '--cols': columns.length + (action ? 1 : 0) }}>
              {columns.map(([key]) => <span key={key} title={formatValue(key, row[key])}>{formatValue(key, row[key])}</span>)}
              {action && <span>{action(row)}</span>}
            </div>
          ))}
        </div>
      )}
      <Pagination page={page} onChange={onFilter} />
    </section>
  );
}

function Pagination({ page, onChange }) {
  const start = page.total ? (page.page - 1) * page.pageSize + 1 : 0;
  const end = Math.min(page.total, page.page * page.pageSize);
  return (
    <div className="pagination">
      <span>{start}-{end} / {page.total}</span>
      <button disabled={page.page <= 1} onClick={() => onChange({ page: page.page - 1 })}><ChevronLeft size={15} /></button>
      <input value={page.page} onChange={(event) => onChange({ page: Number(event.target.value) || 1 })} />
      <span>/ {page.totalPages}</span>
      <button disabled={page.page >= page.totalPages} onClick={() => onChange({ page: page.page + 1 })}><ChevronRight size={15} /></button>
    </div>
  );
}

function formatValue(key, value) {
  if (key.endsWith('_cents') || key === 'cost_cents' || key === 'amount_cents') return money(value);
  if (value === null || value === undefined || value === '') return '-';
  if (key.endsWith('_at')) return String(value).replace('T', ' ').slice(0, 19);
  if (typeof value === 'object') return JSON.stringify(value).slice(0, 90);
  return String(value).slice(0, 90);
}

function DataList({ title, rows = [], fields, onOpen }) {
  const keys = fields || Object.keys(rows[0] || {}).slice(0, 6);
  return (
    <section className="panel data-list">
      <h2>{title}</h2>
      {!rows.length ? (
        <div className="empty-table">暂无数据</div>
      ) : (
        <div className="table">
          <div className="tr head" style={{ '--cols': keys.length + (onOpen ? 1 : 0) }}>
            {keys.map((key) => <span key={key}>{key}</span>)}
            {onOpen && <span>action</span>}
          </div>
          {rows.map((row, index) => (
            <div className="tr" key={row.id || index} style={{ '--cols': keys.length + (onOpen ? 1 : 0) }}>
              {keys.map((key) => <span key={key} title={formatValue(key, row[key])}>{formatValue(key, row[key])}</span>)}
              {onOpen && <span><button onClick={() => onOpen(row.id)}>查看</button></span>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);
