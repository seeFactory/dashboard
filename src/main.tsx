import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type PageData<T> = {
  list: T[];
  total?: number;
};

type Tool = {
  id?: string;
  toolKey: string;
  name: string;
  category?: string;
  description?: string;
  icon?: string;
  cost?: number;
  fields?: string[];
  modes?: ToolMode[];
  assetSlots?: ToolAssetSlot[];
  outputTypes?: string[];
  options?: Record<string, unknown>;
};

type ToolAssetSlot = {
  slotKey?: string;
  key?: string;
  name?: string;
  label?: string;
  type?: "image" | "video" | "audio" | "file" | string;
  required?: boolean;
  minCount?: number;
  maxCount?: number;
  acceptTypes?: string[];
  multiple?: boolean;
};

type ToolMode = {
  modeKey?: string;
  key?: string;
  id?: string;
  label?: string;
  outputType?: string;
  fields?: string[];
  assetSlots?: ToolAssetSlot[];
  allowedModels?: string[];
  defaultModelKey?: string;
  options?: Record<string, unknown>;
  costPoints?: number;
  cost?: number;
  enabled?: boolean;
  default?: boolean;
};

type WorkflowRunField = {
  key: string;
  label?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  options?: Array<string | { label?: string; value?: string | number | boolean }>;
  defaultValue?: string | number | boolean;
  help?: string;
  accept?: string;
  acceptTypes?: string[];
  assetType?: "image" | "video" | "audio" | "file";
  maxCount?: number;
  minCount?: number;
  multiple?: boolean;
  slotKey?: string;
};

type WorkflowRunValue = string | number | boolean | string[];

type WorkflowRunForm = {
  schemaVersion?: string;
  fields?: WorkflowRunField[];
  nodes?: Array<Record<string, unknown>>;
};

type UploadedAsset = {
  id: string;
  type?: string;
  url?: string;
  mimeType?: string;
  size?: number;
  name?: string;
};

type UploadPolicy = {
  configured?: boolean;
  uploadMode?: string;
  uploadUrl: string;
  ossKey: string;
  publicUrl: string;
  maxSize?: number;
  allowedExtensions?: string[];
  fields?: Record<string, string>;
};

type WorkflowRunUploadState = Record<string, {
  assets: UploadedAsset[];
  uploading?: boolean;
  message?: string;
  error?: string;
}>;

type CaseContent = {
  id: string;
  caseType?: "prompt" | "work" | "workflow";
  title: string;
  summary?: string;
  coverUrl?: string;
  category?: string;
  tags?: string[];
  sourceId?: string;
  toolKey?: string;
  licenseMode?: "open_free" | "closed_paid";
  pricePoints?: number;
  trialEnabled?: boolean;
  trialLimitPerUser?: number;
  trialRemaining?: number;
  purchased?: boolean;
  canRun?: boolean;
  runnable?: boolean;
  runBlockedReason?: string;
  disabled?: boolean;
  disabledReason?: string;
  hasReplacementModel?: boolean;
  visibility?: string;
  listingStatus?: string;
  public?: boolean;
  creatorUserId?: string;
  deletedByAuthorAt?: string;
  purchaseRequired?: boolean;
  allowClone?: boolean;
  allowExport?: boolean;
  purchaseCount?: number;
  runCount?: number;
  trialRunCount?: number;
  cloneCount?: number;
  favoriteCount?: number;
  favorited?: boolean;
  prompt?: string;
  params?: Record<string, unknown>;
  runForm?: WorkflowRunForm;
  createdAt?: string;
  updatedAt?: string;
};

type WorkflowPurchaseStatus = {
  purchased: boolean;
  purchaseId?: string;
  canRun?: boolean;
  runnable: boolean;
  runBlockedReason?: string;
  disabled?: boolean;
  disabledReason?: string;
  hasReplacementModel?: boolean;
  replacementAvailable?: boolean;
  visibility?: string;
  listingStatus?: string;
  public?: boolean;
  deletedByAuthorAt?: string;
  trialEnabled?: boolean;
  trialLimitPerUser?: number;
  trialUsed?: number;
  trialRemaining?: number;
};

type ModelCapability = {
  id: string;
  modelKey: string;
  name: string;
  modality: string;
  nodeType: string;
  capabilityKey: string;
  pricePoints?: number;
  latencyMs?: number;
  inputModalities?: string[];
  outputModalities?: string[];
  status?: string;
};

type ComponentDefinition = {
  id: string;
  componentKey: string;
  displayName?: string;
  label?: string;
  category?: string;
  description?: string;
  modelKey?: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  uiSchema?: Record<string, unknown>;
  supportedPlatforms?: string[];
  allowedInLinear?: boolean;
  allowedPublishModes?: string[];
  ratioResolutionMap?: Record<string, string[]>;
  videoQualityOptions?: string[];
};

type WorkflowEditorNode = {
  nodeKey: string;
  component: ComponentDefinition;
  upstreamNodeKeys: string[];
  promptTemplate: string;
  toolKey?: string;
  modelKey?: string;
  costPoints?: number;
  exposePrompt: boolean;
  exposeRatio: boolean;
  exposeResolution: boolean;
  exposeQuality: boolean;
  exposeUpload: boolean;
};

type WorkflowGraph = {
  schemaVersion: string;
  nodes: Array<Record<string, unknown>>;
  edges: Array<Record<string, unknown>>;
};

type WorkflowDraft = {
  id: string;
  title: string;
  description?: string;
  graph?: WorkflowGraph;
  editorMode?: string;
  status?: string;
  latestVersionId?: string;
};

type WorkflowValidation = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  estimatedPoints: number;
  minPoints?: number;
  maxPoints?: number;
  nodeCount: number;
  edgeCount: number;
  nodeEstimates?: Array<{
    nodeId: string;
    label: string;
    componentKey?: string;
    toolKey: string;
    toolName?: string;
    modelKey?: string;
    outputType?: string;
    estimatedPoints: number;
    available: boolean;
  }>;
};

type WorkflowPurchase = {
  id: string;
  caseContentId: string;
  pricePoints?: number;
  status?: string;
  canRun?: boolean;
  runnable?: boolean;
  runBlockedReason?: string;
  disabled?: boolean;
  disabledReason?: string;
  hasReplacementModel?: boolean;
  replacementAvailable?: boolean;
  visibility?: string;
  listingStatus?: string;
  public?: boolean;
  deletedByAuthorAt?: string;
  purchasedAt?: string;
  creator?: {
    id: string;
    nickname?: string;
    avatarUrl?: string;
  };
  versionLabel?: string;
  purchasedVersion?: {
    id: string;
    version?: number;
    title?: string;
  };
  lastRun?: {
    id: string;
    status?: string;
    isTrial?: boolean;
    createdAt?: string;
    finishedAt?: string;
    failureReason?: string;
  };
  lastRunAt?: string;
  lastRunStatus?: string;
  case?: CaseContent;
  version?: {
    title?: string;
    summary?: string;
    coverUrl?: string;
    runForm?: WorkflowRunForm;
  };
};

type WorkflowRun = {
  id: string;
  status: string;
  isTrial?: boolean;
  estimatedPoints?: number;
  actualPoints?: number;
  frozenPoints?: number;
  settledPoints?: number;
  releasedPoints?: number;
  failureReason?: string;
  outputWorkIds?: string[];
  intermediateWorkIds?: string[];
  createdAt?: string;
};

type WorkflowRunNode = {
  id: string;
  workflowRunId: string;
  workflowVersionId?: string;
  generationTaskId?: string;
  workId?: string;
  workStatus?: string;
  workDownloadEnabled?: boolean;
  workLockedUntilPurchase?: boolean;
  workIsTrialOutput?: boolean;
  workIsIntermediateOutput?: boolean;
  workGalleryVisible?: boolean;
  workGalleryStatus?: string;
  nodeId?: string;
  componentKey?: string;
  label?: string;
  status?: string;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  costPoints?: number;
  isTerminalOutput?: boolean;
  isIntermediateOutput?: boolean;
  errorMessage?: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt?: string;
};

type Work = {
  id: string;
  generationTaskId?: string;
  sourceWorkflowVersionId?: string;
  sourceCaseContentId?: string;
  generatedByWorkflowRunId?: string;
  toolKey?: string;
  title?: string;
  prompt?: string;
  params?: Record<string, unknown>;
  modeKey?: string;
  inputAssets?: Record<string, string[]>;
  type?: string;
  contentType?: string;
  resultUrls?: string[];
  coverUrl?: string;
  status?: string;
  failureReason?: string;
  downloadEnabled?: boolean;
  lockedUntilPurchase?: boolean;
  isTrialOutput?: boolean;
  isIntermediateOutput?: boolean;
  galleryVisible?: boolean;
  galleryStatus?: string;
  galleryTitle?: string;
  gallerySummary?: string;
  galleryFeatured?: boolean;
  galleryPublishedAt?: string;
  shareTicket?: string;
  viewCount?: number;
  likeCount?: number;
  favorited?: boolean;
  author?: {
    nickname?: string;
    avatarUrl?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

type ShareTicket = {
  shareTicket: string;
  shareUrl: string;
};

type DownloadUrl = {
  url?: string;
  signed?: boolean;
  expiresAt?: string | null;
};

type GenerationTask = {
  id: string;
  toolKey: string;
  modelKey?: string;
  prompt?: string;
  params?: Record<string, unknown>;
  modeKey?: string;
  status: string;
  resultUrls?: string[];
  coverUrl?: string;
  costPoints?: number;
  failureReason?: string;
  finishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

type GenerationSubmitResult = {
  task: GenerationTask;
  work: Work;
};

type WorkflowIncome = {
  id: string;
  grossPoints?: number;
  platformFeePoints?: number;
  incomePoints?: number;
  availablePoints?: number;
  status?: "frozen" | "available";
  frozenUntil?: string;
  settledAt?: string;
  createdAt?: string;
};

type WorkflowCreatorIncomeSummary = {
  income?: {
    recordCount?: number;
    totalGrossPoints?: number;
    totalPlatformFeePoints?: number;
    totalIncomePoints?: number;
    availablePoints?: number;
    frozenPoints?: number;
    availableCount?: number;
    frozenCount?: number;
  };
  purchases?: {
    totalCount?: number;
    activeCount?: number;
    disabledCount?: number;
    uniqueBuyerCount?: number;
    totalPricePoints?: number;
    totalPlatformFeePoints?: number;
    totalCreatorIncomePoints?: number;
  };
  runs?: {
    totalCount?: number;
    formalCount?: number;
    trialCount?: number;
    successCount?: number;
    failedCount?: number;
    activeCount?: number;
    uniqueRunnerCount?: number;
    actualPoints?: number;
  };
  cases?: {
    totalCount?: number;
    listedCount?: number;
    hiddenCount?: number;
    disabledCount?: number;
    openFreeCount?: number;
    closedPaidCount?: number;
    totalPurchaseCount?: number;
    totalRunCount?: number;
    totalTrialRunCount?: number;
  };
  privacy?: {
    anonymized?: boolean;
    excludes?: string[];
  };
};

type CreditBalance = {
  balance: number;
  frozenBalance?: number;
  availableBalance?: number;
  pointRate?: number;
};

type CreditTransaction = {
  id?: string;
  type?: string;
  amount?: number;
  balanceAfter?: number;
  reason?: string;
  refType?: string;
  createdAt?: string;
};

type RechargePolicy = {
  currency: "CNY";
  pointRate: number;
  minAmountCents: number;
  maxAmountCents: number;
  allowCustomAmount: boolean;
  allowPayPerGeneration?: boolean;
};

type WorkflowPublishPolicy = {
  priceMinPoints?: number;
  priceMaxPoints?: number;
  trialLimitMaxPerUser?: number;
  commissionRate?: number;
  maxGraphNodes?: number;
  maxGraphModelNodes?: number;
  maxLinearSteps?: number;
  maxLinearModelNodes?: number;
  maxConcurrentRunsPerUser?: number;
  runTimeoutMinutes?: number;
  nodeRetryMax?: number;
  publishMaxPerDay?: number;
  publishMaxTotal?: number;
  publishLimitPolicyRef?: string;
};

type PublicAppConfig = {
  brand?: {
    name?: string;
    subtitle?: string;
    logoUrl?: string;
    faviconUrl?: string;
  };
  home?: {
    eyebrow?: string;
    headline?: string;
    subtitle?: string;
    videoUrl?: string;
    posterUrl?: string;
    fallbackImageUrl?: string;
    fallbackMode?: string;
    videoFixed?: boolean;
    videoMuted?: boolean;
    videoLoop?: boolean;
    overlayOpacity?: number;
    mainCardOpacity?: number;
  };
  feature?: Record<string, unknown>;
  customer?: Record<string, unknown>;
  legal?: Record<string, unknown>;
  generation?: Record<string, unknown>;
  workflowPolicy?: WorkflowPublishPolicy;
};

type CryptoTokenOption = {
  token: string;
  bridgeCurrency?: string;
};

type CryptoChainOption = {
  chain: string;
  label?: string;
  network?: string;
  tokens: CryptoTokenOption[];
};

type WalletRechargeOptions = {
  currency?: string;
  chains?: CryptoChainOption[];
  acquiringConfigured?: boolean;
  walletRechargeEnabled?: boolean;
  unavailableReason?: string;
};

type PaymentOrder = {
  id: string;
  orderNo?: string;
  provider?: string;
  clientRuntime?: string;
  amountCents?: number;
  currency?: string;
  points?: number;
  pointRate?: number;
  creditedPoints?: number;
  payScene?: string;
  status?: string;
  paidAt?: string;
  createdAt?: string;
};

type CryptoPayment = {
  id: string;
  paymentOrderId?: string;
  configured?: boolean;
  amount?: number;
  amountCents?: number;
  currency?: string;
  points?: number;
  creditedPoints?: number;
  chainName?: string;
  token?: string;
  payChain?: string;
  payToken?: string;
  payCurrency?: string;
  payAmount?: string | number;
  depositAddress?: string;
  bridgeDepositAddress?: string;
  status?: string;
  bridgeStatus?: string;
  expiresAt?: string;
  paidAt?: string;
  createdAt?: string;
};

type Toast = {
  title: string;
  tone?: "success" | "danger" | "info";
};

type PendingPublicAction = {
  type: "gallery-download" | "gallery-rerun" | "gallery-favorite" | "share-download" | "share-rerun" | "share-favorite" | "case-rerun" | "case-download" | "case-favorite" | "case-workflow";
  workId?: string;
  ticket?: string;
  caseId?: string;
};

type AuthResult = {
  accessToken: string;
  refreshToken: string;
  user?: {
    id?: string;
    nickname?: string;
    avatarUrl?: string;
  };
  isNewUser?: boolean;
};

type CustomerServiceConfig = {
  wechat?: string;
  telegram?: string;
  email?: string;
  qrCodeUrl?: string;
  note?: string;
};

type FaqItem = {
  question: string;
  answer: string;
  category?: string;
  sort?: number;
};

type AgreementType = "user" | "privacy" | "creator" | "agent";

type Agreement = {
  id: string;
  type: AgreementType;
  title: string;
  version: string;
  contentMarkdown: string;
  externalUrl?: string;
  status?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

type CurrentUser = {
  id?: string;
  _id?: string;
  nickname?: string;
  avatarUrl?: string;
  status?: string;
  role?: string;
  creditBalance?: number;
  creditFrozenBalance?: number;
  primaryIdentityId?: string;
  createdAt?: string;
  updatedAt?: string;
};

type AuthMe = {
  loggedIn: boolean;
  user?: CurrentUser | null;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme: string;
              size: string;
              type: string;
              shape: string;
              text: string;
              locale: string;
              width: number;
            }
          ) => void;
        };
      };
    };
    __SEEFACTORY_DASHBOARD_TELEGRAM_AUTH__?: (user: Record<string, unknown>) => void;
  }
}

const API_BASE = (
  import.meta.env.VITE_SEEFACTORY_API_BASE ||
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV ? "http://127.0.0.1:10087/api/v1" : "https://api.seefactory.xyz/api/v1")
).replace(/\/+$/, "");

const GOOGLE_CLIENT_ID = String(
  import.meta.env.VITE_SEEFACTORY_GOOGLE_CLIENT_ID ||
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    ""
);
const X_REDIRECT_URI = String(
  import.meta.env.VITE_SEEFACTORY_X_REDIRECT_URI ||
    import.meta.env.VITE_X_REDIRECT_URI ||
    ""
);
const TELEGRAM_BOT_USERNAME = String(
  import.meta.env.VITE_SEEFACTORY_TELEGRAM_BOT_USERNAME ||
    import.meta.env.VITE_TELEGRAM_BOT_USERNAME ||
    ""
);

const tokenKey = "seefactory.dashboard.accessToken";
const refreshTokenKey = "seefactory.dashboard.refreshToken";
const pendingPublicActionKey = "seefactory.dashboard.pendingPublicAction";
const xCodeVerifierKey = "seefactory.dashboard.xCodeVerifier";
const xRedirectUriKey = "seefactory.dashboard.xRedirectUri";
const sidebarCollapsedKey = "seefactory.dashboard.sidebarCollapsed";

function authHeaders(auth = false, runtime = "h5-google") {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "X-Client-Runtime": runtime,
    "X-Client-Version": "0.1.0"
  };
  const token = localStorage.getItem(tokenKey);
  if (auth && token) headers.authorization = `Bearer ${token}`;
  return headers;
}

async function apiGet<T>(path: string, options: { auth?: boolean; runtime?: string } = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { headers: authHeaders(options.auth, options.runtime) });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    throw new Error(body.userMessage || body.message || "请求失败");
  }
  return body.data;
}

async function apiPost<T>(path: string, payload: unknown = {}, options: { auth?: boolean; runtime?: string } = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: authHeaders(options.auth, options.runtime),
    body: JSON.stringify(payload)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    throw new Error(body.userMessage || body.message || "请求失败");
  }
  return body.data;
}

async function apiPut<T>(path: string, payload: unknown = {}, options: { auth?: boolean; runtime?: string } = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: authHeaders(options.auth, options.runtime),
    body: JSON.stringify(payload)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    throw new Error(body.userMessage || body.message || "请求失败");
  }
  return body.data;
}

async function apiDelete<T>(path: string, options: { auth?: boolean; runtime?: string } = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: authHeaders(options.auth, options.runtime)
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) {
    throw new Error(body.userMessage || body.message || "请求失败");
  }
  return body.data;
}

function settle<T>(promise: Promise<T>): Promise<{ ok: true; value: T } | { ok: false; reason: Error }> {
  return promise
    .then((value) => ({ ok: true as const, value }))
    .catch((reason) => ({
      ok: false as const,
      reason: reason instanceof Error ? reason : new Error("请求失败")
    }));
}

function resolveLogoUrl(value?: string) {
  const url = String(value || "").trim();
  if (!url || url === "docs/logo.png") return "/logo.png";
  if (/^(https?:|data:|blob:)/i.test(url) || url.startsWith("/")) return url;
  return `/${url.replace(/^\/+/, "")}`;
}

function resolveConfigAssetUrl(value?: string) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (url === "docs/logo.png") return "/logo.png";
  if (/^(https?:|data:|blob:)/i.test(url) || url.startsWith("/")) return url;
  return `/${url.replace(/^\/+/, "")}`;
}

const DASHBOARD_VISUAL_VERSION = "2026062501";
const DEFAULT_HOME_VIDEO_URL = "/home-bg.mp4";
const DEFAULT_HOME_POSTER_URL = "/home-bg-poster.jpg";

function versionDashboardVisualAsset(url: string) {
  if (!url || !url.startsWith("/")) return url;
  if (!url.startsWith("/visuals/") && url !== "/home-bg-poster.jpg") return url;
  return `${url}${url.includes("?") ? "&" : "?"}v=${DASHBOARD_VISUAL_VERSION}`;
}

function clampConfigNumber(value: unknown, min: number, max: number, fallback: number) {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
}

function usePublicData() {
  const [appConfig, setAppConfig] = useState<PublicAppConfig | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [cases, setCases] = useState<CaseContent[]>([]);
  const [galleryWorks, setGalleryWorks] = useState<Work[]>([]);
  const [models, setModels] = useState<ModelCapability[]>([]);
  const [components, setComponents] = useState<ComponentDefinition[]>([]);
  const [customerService, setCustomerService] = useState<CustomerServiceConfig | null>(null);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [rechargePolicy, setRechargePolicy] = useState<RechargePolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    Promise.all([
      settle(apiGet<PublicAppConfig>("/app/config")),
      settle(apiGet<Tool[]>("/tools")),
      settle(apiGet<PageData<CaseContent>>("/case-contents?pageSize=12")),
      settle(apiGet<PageData<Work>>("/gallery/works?pageSize=12")),
      settle(apiGet<PageData<ModelCapability>>("/models?pageSize=100")),
      settle(apiGet<PageData<ComponentDefinition>>("/components?pageSize=100&clientRuntime=h5-google")),
      settle(apiGet<CustomerServiceConfig>("/customer-service")),
      settle(apiGet<{ list: FaqItem[] }>("/faqs")),
      settle(apiGet<RechargePolicy>("/credits/recharge-settings"))
    ])
      .then(([appConfigResult, toolResult, caseResult, galleryResult, modelResult, componentResult, customerResult, faqResult, rechargeResult]) => {
        if (!mounted) return;
        setAppConfig(appConfigResult.ok ? appConfigResult.value : null);
        setTools(toolResult.ok ? toolResult.value : []);
        setCases(caseResult.ok ? caseResult.value.list || [] : []);
        setGalleryWorks(galleryResult.ok ? galleryResult.value.list || [] : []);
        setModels(modelResult.ok ? modelResult.value.list || [] : []);
        setComponents(componentResult.ok ? componentResult.value.list || [] : []);
        setCustomerService(customerResult.ok ? customerResult.value : null);
        setFaqs(faqResult.ok ? faqResult.value.list || [] : []);
        setRechargePolicy(rechargeResult.ok ? rechargeResult.value : null);
        const errors = [
          appConfigResult.ok ? "" : "首页内容：" + (appConfigResult.reason?.message || "加载失败"),
          toolResult.ok ? "" : "工具内容：" + (toolResult.reason?.message || "加载失败"),
          caseResult.ok ? "" : "案例内容：" + (caseResult.reason?.message || "加载失败"),
          galleryResult.ok ? "" : "作品广场：" + (galleryResult.reason?.message || "加载失败"),
          modelResult.ok ? "" : "模型能力：" + (modelResult.reason?.message || "加载失败"),
          componentResult.ok ? "" : "Workflow 组件：" + (componentResult.reason?.message || "加载失败"),
          customerResult.ok ? "" : "客服信息：" + (customerResult.reason?.message || "加载失败"),
          faqResult.ok ? "" : "FAQ：" + (faqResult.reason?.message || "加载失败"),
          rechargeResult.ok ? "" : "充值信息：" + (rechargeResult.reason?.message || "加载失败")
        ].filter(Boolean);
        setError(errors.join("；"));
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return { appConfig, tools, cases, galleryWorks, models, components, customerService, faqs, rechargePolicy, loading, error };
}

function Logo({ appConfig }: { appConfig?: PublicAppConfig | null }) {
  const brandName = productCopy(appConfig?.brand?.name, "seeFactory");
  const subtitle = productCopy(appConfig?.brand?.subtitle, "AI 创作工厂");
  const logoUrl = resolveLogoUrl(appConfig?.brand?.logoUrl);
  return (
    <div className="brand-lockup">
      <img src={logoUrl} alt={brandName} />
      <div>
        <strong>{brandName}</strong>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}

function Icon({ name }: { name: string }) {
  return <span className="icon-mark" data-icon={name} aria-hidden="true" />;
}

function Button({
  children,
  variant = "primary",
  onClick,
  disabled = false
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "quiet";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button className={`button ${variant}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function EmptyBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="state-card">
      <Icon name="empty" />
      <strong>{title}</strong>
      <span>{body}</span>
    </div>
  );
}

function LoadingBlock({ title }: { title: string }) {
  return (
    <div className="state-card">
      <span className="spinner" />
      <strong>{title}</strong>
      <span>正在加载 seeFactory 的最新内容。</span>
    </div>
  );
}

function WorkflowRunFormFields({
  runForm,
  values,
  disabled,
  uploadState = {},
  onChange,
  onUploadStateChange,
  onToast
}: {
  runForm?: WorkflowRunForm;
  values: Record<string, WorkflowRunValue>;
  disabled?: boolean;
  uploadState?: WorkflowRunUploadState;
  onChange: (key: string, value: WorkflowRunValue) => void;
  onUploadStateChange?: (key: string, state: WorkflowRunUploadState[string]) => void;
  onToast?: (toast: Toast) => void;
}) {
  const fields = workflowRunFields(runForm);
  if (!fields.length) {
    return (
      <div className="case-run-form">
        <p className="muted-text">作者未开放可调整运行参数，将使用发布版本中锁定的默认设置。</p>
      </div>
    );
  }
  const uploadFiles = async (field: WorkflowRunField, fileList: FileList | null) => {
    const files = Array.from(fileList || []).slice(0, workflowUploadMaxCount(field));
    if (!files.length) return;
    const currentAssets = uploadState[field.key]?.assets || [];
    onUploadStateChange?.(field.key, {
      assets: currentAssets,
      uploading: true,
      message: "素材上传中",
      error: ""
    });
    try {
      const uploaded = await uploadWorkflowRunAssets(field, files);
      const nextAssets = workflowUploadMaxCount(field) === 1
        ? uploaded
        : currentAssets.concat(uploaded).slice(0, workflowUploadMaxCount(field));
      onChange(field.key, nextAssets.map((asset) => asset.id));
      onUploadStateChange?.(field.key, {
        assets: nextAssets,
        uploading: false,
        message: `已上传 ${nextAssets.length} 个素材`,
        error: ""
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "素材上传失败";
      onUploadStateChange?.(field.key, {
        assets: currentAssets,
        uploading: false,
        message: "",
        error: message
      });
      onToast?.({ title: message, tone: "danger" });
    }
  };

  const removeAsset = (field: WorkflowRunField, assetId: string) => {
    const nextAssets = (uploadState[field.key]?.assets || []).filter((asset) => asset.id !== assetId);
    onChange(field.key, nextAssets.map((asset) => asset.id));
    onUploadStateChange?.(field.key, {
      assets: nextAssets,
      uploading: false,
      message: nextAssets.length ? `已上传 ${nextAssets.length} 个素材` : "",
      error: ""
    });
  };

  return (
    <div className="case-run-form">
      {fields.map((field) => {
        const label = field.label || field.key;
        const value = values[field.key] ?? defaultWorkflowRunValue(field);
        const options = Array.isArray(field.options) ? field.options : [];
        if (isWorkflowUploadField(field)) {
          const state = uploadState[field.key] || { assets: [] };
          return (
            <label className="field-wide asset-upload-field" key={field.key}>
              <span>{label}{field.required ? " *" : ""}</span>
              <input
                type="file"
                accept={workflowUploadAccept(field)}
                multiple={workflowUploadMaxCount(field) > 1}
                disabled={disabled || state.uploading}
                onChange={(event) => uploadFiles(field, event.target.files).finally(() => { event.target.value = ""; })}
              />
              <small>
                {state.uploading ? state.message || "素材上传中" : field.help || `最多上传 ${workflowUploadMaxCount(field)} 个素材`}
              </small>
              {state.error ? <small className="danger-text">{state.error}</small> : null}
              {state.assets.length ? (
                <div className="asset-chip-list">
                  {state.assets.map((asset) => (
                    <span className="asset-chip" key={asset.id}>
                      <span>{asset.name || asset.mimeType || asset.type || "素材"}</span>
                      <button type="button" onClick={() => removeAsset(field, asset.id)} disabled={disabled || state.uploading}>
                        移除
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
            </label>
          );
        }
        if (field.type === "checkbox") {
          return (
            <label className="check-field" key={field.key}>
              <input
                type="checkbox"
                checked={Boolean(value)}
                disabled={disabled}
                onChange={(event) => onChange(field.key, event.target.checked)}
              />
              <span>{label}{field.required ? " *" : ""}</span>
              {field.help ? <small>{field.help}</small> : null}
            </label>
          );
        }
        return (
          <label className={field.type === "textarea" ? "field-wide" : ""} key={field.key}>
            <span>{label}{field.required ? " *" : ""}</span>
            {field.type === "textarea" ? (
              <textarea
                value={String(value ?? "")}
                disabled={disabled}
                placeholder={field.placeholder || `填写${label}`}
                onChange={(event) => onChange(field.key, event.target.value)}
              />
            ) : options.length || field.type === "select" ? (
              <select
                value={String(value ?? "")}
                disabled={disabled}
                onChange={(event) => onChange(field.key, event.target.value)}
              >
                {options.map((option) => (
                  <option key={fieldOptionValue(option)} value={fieldOptionValue(option)}>
                    {fieldOptionLabel(option)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type === "number" || field.type === "range" ? "number" : "text"}
                value={String(value ?? "")}
                disabled={disabled}
                placeholder={field.placeholder || `填写${label}`}
                onChange={(event) => onChange(field.key, field.type === "number" || field.type === "range" ? Number(event.target.value) : event.target.value)}
              />
            )}
            {field.help ? <small>{field.help}</small> : null}
          </label>
        );
      })}
    </div>
  );
}

function ToastHost({ toast }: { toast: Toast | null }) {
  if (!toast) return null;
  return <div className={`toast ${toast.tone || "info"}`}>{toast.title}</div>;
}

function formatDate(value?: string) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatPoints(value?: number) {
  const normalized = Number(value ?? 0);
  if (!Number.isFinite(normalized)) return "0";
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 }).format(normalized);
}

const PARAM_LABELS: Record<string, string> = {
  model: "模型",
  modelKey: "模型",
  providerModel: "上游模型",
  prompt: "提示词",
  negativePrompt: "反向提示词",
  ratio: "比例",
  aspectRatio: "比例",
  resolution: "分辨率",
  size: "尺寸",
  quality: "精度",
  duration: "时长",
  style: "风格",
  seed: "随机种子",
  width: "宽度",
  height: "高度",
  count: "数量",
  n: "数量",
  steps: "步数",
  strength: "参考强度",
  cfgScale: "提示词权重",
  guidanceScale: "引导强度",
  outputType: "输出类型",
  imageUrl: "参考图",
  inputImage: "输入图片",
  inputVideo: "输入视频"
};

function paramLabel(key: string) {
  if (PARAM_LABELS[key]) return PARAM_LABELS[key];
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (value) => value.toUpperCase());
}

function formatParamValue(value: unknown, depth = 0): string {
  if (value === null || value === undefined || value === "") return "未填写";
  if (typeof value === "boolean") return value ? "是" : "否";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "未填写";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    if (!value.length) return "未填写";
    return value.map((item) => formatParamValue(item, depth + 1)).join("、");
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(([, item]) => item !== undefined && item !== null && item !== "");
    if (!entries.length) return "未填写";
    if (depth > 0 || entries.length > 4) return `${entries.length} 项设置`;
    return entries.map(([key, item]) => `${paramLabel(key)}：${formatParamValue(item, depth + 1)}`).join("；");
  }
  return String(value);
}

function ParamSnapshot({ params, emptyText = "暂无参数记录" }: { params?: Record<string, unknown>; emptyText?: string }) {
  const entries = Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== "");
  if (!entries.length) return <p className="muted-text param-empty">{emptyText}</p>;
  return (
    <dl className="param-snapshot">
      {entries.map(([key, value]) => (
        <div key={key}>
          <dt>{paramLabel(key)}</dt>
          <dd>{formatParamValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function productCopy(value?: unknown, fallback = "") {
  const text = String(value ?? "").trim() || fallback;
  return text
    .replace(/\.seeflow\b/gi, "流程文件")
    .replace(/\bgraph\b/gi, "流程图")
    .replace(/\bopen_free\b/gi, "免费公开")
    .replace(/\bclosed_paid\b/gi, "付费闭源")
    .replace(/\bPC\s*H5\b/gi, "桌面 Web")
    .replace(/进入 PC/g, "进入桌面")
    .replace(/后端配置/g, "平台规则")
    .replace(/后台配置/g, "平台规则")
    .replace(/公开配置/g, "公开内容")
    .replace(/工具配置/g, "工具内容")
    .replace(/案例配置/g, "案例内容")
    .replace(/充值配置/g, "充值信息");
}

function contentTypeLabel(value?: string) {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("video")) return "视频";
  if (normalized.includes("image")) return "图像";
  if (normalized.includes("audio")) return "音频";
  if (normalized.includes("text")) return "文本";
  return productCopy(value || "内容");
}

function workflowCanRun(item?: { canRun?: boolean; runnable?: boolean; status?: string; disabled?: boolean } | null) {
  if (!item) return false;
  if (item.canRun !== undefined) return Boolean(item.canRun);
  if (item.runnable !== undefined) return Boolean(item.runnable);
  return item.status !== "disabled" && item.disabled !== true;
}

function workflowBlockedReason(item?: { runBlockedReason?: string; disabledReason?: string } | null) {
  return item?.runBlockedReason || item?.disabledReason || "";
}

type WorkflowLifecycleFields = {
  disabled?: boolean;
  visibility?: string;
  listingStatus?: string;
  public?: boolean;
  deletedByAuthorAt?: string;
};

function workflowCaseLifecycle(caseContent?: WorkflowLifecycleFields | null) {
  if (!caseContent) return { label: "--", tone: "idle" };
  if (caseContent.disabled || caseContent.visibility === "disabled" || caseContent.listingStatus === "disabled") {
    return { label: "已禁用", tone: "danger" };
  }
  if (caseContent.deletedByAuthorAt) return { label: "已停止公开", tone: "stopped" };
  if (caseContent.public === false || caseContent.visibility === "hidden" || caseContent.listingStatus === "hidden") {
    return { label: "已隐藏", tone: "hidden" };
  }
  return { label: "公开中", tone: "listed" };
}

function workflowLifecycleNote(source?: WorkflowLifecycleFields | null, purchased = false) {
  if (!source) return "";
  if (source.disabled || source.visibility === "disabled" || source.listingStatus === "disabled") {
    return "该模板已被平台暂停运行，购买记录仍保留，待平台恢复或提供替代模型后再运行。";
  }
  if (source.deletedByAuthorAt) {
    return purchased
      ? "作者已停止公开展示该案例，已购权益仍保留，可继续运行该发布版本。"
      : "作者已停止公开展示该案例，暂不支持新的购买或公开访问。";
  }
  if (source.public === false || source.visibility === "hidden" || source.listingStatus === "hidden") {
    return purchased
      ? "作者已隐藏公开展示，已购权益仍保留，可继续运行该发布版本。"
      : "该案例当前已隐藏，暂不支持新的购买或公开访问。";
  }
  return "";
}

function workflowPurchaseLifecycleSource(item?: WorkflowPurchase | null): WorkflowLifecycleFields | null {
  return item?.case || item || null;
}

function workflowPurchaseCreatorName(item?: WorkflowPurchase | null) {
  return item?.creator?.nickname || "seeFactory 创作者";
}

function workflowPurchaseVersionLabel(item?: WorkflowPurchase | null) {
  return item?.versionLabel || (item?.purchasedVersion?.version ? `v${item.purchasedVersion.version}` : "发布版本");
}

function workflowPurchaseLastRunText(item?: WorkflowPurchase | null) {
  if (!item?.lastRunAt) return "暂无运行";
  const runKind = item.lastRun?.isTrial ? "试运行" : "正式运行";
  return `${runKind} ${paymentStatusLabel(item.lastRunStatus)} · ${formatDate(item.lastRunAt)}`;
}

function formatCnyFromCents(value?: number) {
  const normalized = Number(value ?? 0);
  if (!Number.isFinite(normalized)) return "¥0.00";
  return `¥${(normalized / 100).toFixed(2)}`;
}

function formatUsdLike(value?: string | number, currency = "USD") {
  const text = String(value ?? "").trim();
  if (!text) return "--";
  return `${text} ${currency}`;
}

function paymentStatusLabel(status?: string) {
  const labels: Record<string, string> = {
    queued: "排队中",
    pending: "等待支付",
    processing: "确认中",
    success: "已完成",
    paid: "已到账",
    closed: "已关闭",
    failed: "失败",
    expired: "已过期",
    canceled: "已取消",
    online: "可用",
    available: "可用",
    enabled: "已启用",
    active: "可用",
    offline: "不可用",
    disabled: "已停用",
    draft: "草稿",
    published: "已发布",
    hidden: "已隐藏",
    archived: "已归档"
  };
  return labels[String(status || "").toLowerCase()] || status || "--";
}

function creditTransactionLabel(type?: string, reason?: string) {
  const labels: Record<string, string> = {
    grant: "赠送",
    consume: "消费",
    rollback: "回退",
    recharge: "充值",
    adjust: "调整",
    direct_pay_grant: "生成直付入账",
    freeze: "冻结",
    settle_freeze: "冻结结算",
    release_freeze: "释放冻结",
    workflow_income: "创作者收益"
  };
  return labels[String(type || "")] || reason || type || "点数流水";
}

function fieldType(field: WorkflowRunField) {
  return String(field.type || "").toLowerCase();
}

function isWorkflowUploadField(field: WorkflowRunField) {
  const type = fieldType(field);
  return ["upload", "multiupload", "asset", "assets", "file", "image", "video", "audio", "media"].includes(type);
}

function workflowUploadMaxCount(field: WorkflowRunField) {
  const raw = Number(field.maxCount ?? (field.multiple || fieldType(field) === "multiupload" || fieldType(field) === "assets" ? 6 : 1));
  return Number.isFinite(raw) ? Math.max(1, Math.min(12, Math.floor(raw))) : 1;
}

function workflowUploadMinCount(field: WorkflowRunField) {
  const raw = Number(field.minCount ?? (field.required ? 1 : 0));
  return Number.isFinite(raw) ? Math.max(0, Math.min(workflowUploadMaxCount(field), Math.floor(raw))) : 0;
}

function workflowUploadAccept(field: WorkflowRunField) {
  if (field.accept) return field.accept;
  const acceptTypes = Array.isArray(field.acceptTypes) ? field.acceptTypes : [];
  if (acceptTypes.length) {
    return acceptTypes.map((type) => `${String(type).toLowerCase()}/*`).join(",");
  }
  const type = field.assetType || fieldType(field);
  if (type === "image") return "image/*";
  if (type === "video") return "video/*";
  if (type === "audio") return "audio/*";
  return "";
}

function inferWorkflowAssetType(field: WorkflowRunField, file: File): "image" | "video" | "audio" | "file" {
  if (field.assetType) return field.assetType;
  const type = fieldType(field);
  if (type === "image" || type === "video" || type === "audio") return type;
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return "file";
}

function workflowAssetSlotKey(field: WorkflowRunField) {
  if (field.slotKey) return field.slotKey;
  if (field.key.startsWith("inputAssets.")) return field.key.slice("inputAssets.".length);
  return field.key;
}

function workflowAssetIds(value: WorkflowRunValue | undefined) {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  if (typeof value === "string") return value.split(/[,，\s]+/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function isWorkflowUploadBusy(uploadState: WorkflowRunUploadState) {
  return Object.values(uploadState).some((state) => state.uploading);
}

async function uploadWorkflowRunAssets(field: WorkflowRunField, files: File[]) {
  const uploaded: UploadedAsset[] = [];
  for (const file of files) {
    const type = inferWorkflowAssetType(field, file);
    const policy = await apiPost<UploadPolicy>("/assets/upload-token", {
      type,
      filename: file.name,
      mimeType: file.type,
      size: file.size
    }, { auth: true });
    if (policy.configured !== false) {
      const form = new FormData();
      Object.entries(policy.fields || {}).forEach(([key, value]) => form.append(key, value));
      form.append("file", file);
      const response = await fetch(policy.uploadUrl, {
        method: "POST",
        body: form
      });
      if (!response.ok) {
        throw new Error("OSS 上传失败，请稍后重试");
      }
    }
    const asset = await apiPost<UploadedAsset>("/assets", {
      type,
      url: policy.publicUrl,
      ossKey: policy.ossKey,
      mimeType: file.type,
      size: file.size
    }, { auth: true });
    uploaded.push({ ...asset, name: file.name });
  }
  return uploaded;
}

function workflowNodeOutput(node: WorkflowRunNode) {
  return node.output && typeof node.output === "object" ? node.output : {};
}

function workflowNodeWorkId(node: WorkflowRunNode) {
  const output = workflowNodeOutput(node);
  return String(node.workId || output.workId || "").trim();
}

function workflowNodeResultUrls(node: WorkflowRunNode) {
  const output = workflowNodeOutput(node);
  const urls = Array.isArray(output.resultUrls) ? output.resultUrls : [];
  return urls.map((url) => String(url || "").trim()).filter(Boolean);
}

function workflowNodeCoverUrl(node: WorkflowRunNode) {
  const output = workflowNodeOutput(node);
  return String(output.coverUrl || workflowNodeResultUrls(node)[0] || "").trim();
}

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url);
}

function openExternalUrl(url?: string) {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}

function workflowRunFields(runForm?: WorkflowRunForm): WorkflowRunField[] {
  return Array.isArray(runForm?.fields)
    ? runForm.fields.filter((field) => field && typeof field.key === "string" && field.key.trim())
    : [];
}

function fieldOptionValue(option: string | { label?: string; value?: string | number | boolean }) {
  return typeof option === "string" ? option : String(option.value ?? option.label ?? "");
}

function fieldOptionLabel(option: string | { label?: string; value?: string | number | boolean }) {
  return typeof option === "string" ? option : String(option.label ?? option.value ?? "");
}

function defaultWorkflowRunValue(field: WorkflowRunField) {
  if (isWorkflowUploadField(field)) return [];
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.type === "checkbox") return false;
  const firstOption = Array.isArray(field.options) ? field.options[0] : undefined;
  return firstOption !== undefined ? fieldOptionValue(firstOption) : "";
}

function initialWorkflowRunValues(runForm?: WorkflowRunForm) {
  return workflowRunFields(runForm).reduce<Record<string, WorkflowRunValue>>((values, field) => {
    values[field.key] = defaultWorkflowRunValue(field);
    return values;
  }, {});
}

function normalizeWorkflowRunValue(field: WorkflowRunField, value: WorkflowRunValue | undefined) {
  if (isWorkflowUploadField(field)) return workflowAssetIds(value);
  if (field.type === "checkbox") return Boolean(value);
  if (field.type === "number" || field.type === "range") {
    if (value === "" || value === undefined) return "";
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : "";
  }
  if (Array.isArray(value)) return value;
  return typeof value === "string" ? value.trim() : value ?? "";
}

function buildWorkflowRunPayload(runForm: WorkflowRunForm | undefined, values: Record<string, WorkflowRunValue>) {
  const input: Record<string, unknown> = {};
  const params: Record<string, unknown> = {};
  const inputAssetIds: string[] = [];
  const inputAssets: Record<string, string[]> = {};
  for (const field of workflowRunFields(runForm)) {
    const value = normalizeWorkflowRunValue(field, values[field.key]);
    if (isWorkflowUploadField(field)) {
      const ids = Array.isArray(value) ? value.map((item) => String(item || "").trim()).filter(Boolean) : [];
      const minCount = workflowUploadMinCount(field);
      if (ids.length < minCount) {
        return {
          ok: false as const,
          message: `请上传${field.label || field.key}。`
        };
      }
      if (!ids.length) continue;
      input[field.key] = ids;
      if (field.key === "inputAssetIds" || workflowAssetSlotKey(field) === "inputAssetIds") {
        inputAssetIds.push(...ids);
      } else {
        inputAssets[workflowAssetSlotKey(field)] = ids;
      }
      continue;
    }
    const isEmpty = value === "" || value === undefined || value === null || (Array.isArray(value) && !value.length);
    if (field.required && isEmpty) {
      return {
        ok: false as const,
        message: `请填写${field.label || field.key}。`
      };
    }
    if (isEmpty && field.type !== "checkbox") continue;
    input[field.key] = value;
    if (field.key !== "prompt") params[field.key] = value;
  }
  if (inputAssetIds.length) input.inputAssetIds = inputAssetIds;
  if (Object.keys(inputAssets).length) input.inputAssets = inputAssets;
  return {
    ok: true as const,
    payload: { input, params }
  };
}

function saveAuthResult(result: AuthResult) {
  localStorage.setItem(tokenKey, result.accessToken);
  localStorage.setItem(refreshTokenKey, result.refreshToken);
}

function clearAuthResult() {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(refreshTokenKey);
}

function isPendingPublicAction(value: unknown): value is PendingPublicAction {
  if (!value || typeof value !== "object") return false;
  const action = value as PendingPublicAction;
  return [
    "gallery-download",
    "gallery-rerun",
    "gallery-favorite",
    "share-download",
    "share-rerun",
    "share-favorite",
    "case-rerun",
    "case-download",
    "case-favorite",
    "case-workflow"
  ].includes(action.type);
}

function readPendingPublicAction(): PendingPublicAction | null {
  try {
    const raw = sessionStorage.getItem(pendingPublicActionKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isPendingPublicAction(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function savePendingPublicAction(action: PendingPublicAction) {
  sessionStorage.setItem(pendingPublicActionKey, JSON.stringify(action));
}

function clearPendingPublicAction() {
  sessionStorage.removeItem(pendingPublicActionKey);
}

function randomBase64Url(byteLength = 48) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  if (window.crypto?.getRandomValues) {
    const bytes = new Uint8Array(byteLength);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes).map((byte) => chars[byte % chars.length]).join("");
  }
  return Array.from({ length: byteLength }).map(() => chars[Math.floor(Math.random() * chars.length)]).join("");
}

async function sha256Base64Url(value: string) {
  if (!window.crypto?.subtle) {
    throw new Error("当前浏览器不支持安全 OAuth 登录");
  }
  const bytes = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  const binary = String.fromCharCode(...new Uint8Array(digest));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function loadScript(src: string) {
  const existed = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
  if (existed) {
    return existed.dataset.loaded === "true"
      ? Promise.resolve()
      : new Promise<void>((resolve, reject) => {
          existed.addEventListener("load", () => resolve(), { once: true });
          existed.addEventListener("error", () => reject(new Error("脚本加载失败")), { once: true });
        });
  }
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error("脚本加载失败"));
    document.head.appendChild(script);
  });
}

function resolveXRedirectUri() {
  if (X_REDIRECT_URI) return X_REDIRECT_URI;
  return `${window.location.origin}${window.location.pathname}`;
}

function removeOAuthQuery() {
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  url.searchParams.delete("error");
  url.searchParams.delete("error_description");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function authSuccessText(provider: string, result: AuthResult) {
  const name = result.user?.nickname ? "：" + result.user.nickname : "";
  return provider + " 登录成功" + name;
}

function AuthModal({
  open,
  onClose,
  onAuthSuccess,
  onToast
}: {
  open: boolean;
  onClose: () => void;
  onAuthSuccess: (result: AuthResult, provider: string) => void;
  onToast: (toast: Toast) => void;
}) {
  const googleHostRef = useRef<HTMLDivElement>(null);
  const telegramHostRef = useRef<HTMLDivElement>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [pendingProvider, setPendingProvider] = useState("");

  useEffect(() => {
    if (!open || !GOOGLE_CLIENT_ID || !googleHostRef.current) return;
    let cancelled = false;
    setGoogleReady(false);
    loadScript("https://accounts.google.com/gsi/client?hl=zh-CN")
      .then(() => {
        if (cancelled || !window.google?.accounts?.id || !googleHostRef.current) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (!response.credential) {
              onToast({ title: "Google 授权失败，请重试", tone: "danger" });
              return;
            }
            setPendingProvider("Google");
            apiPost<AuthResult>("/auth/h5/google-login", { idToken: response.credential }, { runtime: "h5-google" })
              .then((result) => onAuthSuccess(result, "Google"))
              .catch((error) => onToast({ title: error.message || "Google 登录失败", tone: "danger" }))
              .finally(() => setPendingProvider(""));
          }
        });
        googleHostRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleHostRef.current, {
          theme: "filled_black",
          size: "large",
          type: "standard",
          shape: "pill",
          text: "signin_with",
          locale: "zh-CN",
          width: Math.min(320, Math.max(260, googleHostRef.current.clientWidth || 300))
        });
        setGoogleReady(true);
      })
      .catch(() => onToast({ title: "Google 登录组件加载失败", tone: "danger" }));
    return () => {
      cancelled = true;
    };
  }, [open, onAuthSuccess, onToast]);

  useEffect(() => {
    if (!open || !TELEGRAM_BOT_USERNAME || !telegramHostRef.current) return;
    const host = telegramHostRef.current;
    host.innerHTML = "";
    window.__SEEFACTORY_DASHBOARD_TELEGRAM_AUTH__ = (user) => {
      setPendingProvider("Telegram");
      apiPost<AuthResult>("/auth/h5/telegram-login", { telegramAuth: user }, { runtime: "h5-telegram" })
        .then((result) => onAuthSuccess(result, "Telegram"))
        .catch((error) => onToast({ title: error.message || "Telegram 登录失败", tone: "danger" }))
        .finally(() => setPendingProvider(""));
    };
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", TELEGRAM_BOT_USERNAME);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-userpic", "true");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-onauth", "window.__SEEFACTORY_DASHBOARD_TELEGRAM_AUTH__(user)");
    script.onerror = () => onToast({ title: "Telegram 登录组件加载失败", tone: "danger" });
    host.appendChild(script);
    return () => {
      host.innerHTML = "";
      delete window.__SEEFACTORY_DASHBOARD_TELEGRAM_AUTH__;
    };
  }, [open, onAuthSuccess, onToast]);

  const handleXLogin = async () => {
    setPendingProvider("X");
    try {
      const redirectUri = resolveXRedirectUri();
      const codeVerifier = randomBase64Url();
      const codeChallenge = await sha256Base64Url(codeVerifier);
      const query = new URLSearchParams({ codeChallenge, redirectUri });
      const result = await apiGet<{ authorizeUrl: string; state: string }>("/auth/h5/x/authorize-url?" + query.toString(), {
        runtime: "h5-x"
      });
      localStorage.setItem(xCodeVerifierKey, codeVerifier);
      localStorage.setItem(xRedirectUriKey, redirectUri);
      window.location.href = result.authorizeUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : "X 授权启动失败";
      onToast({ title: message, tone: "danger" });
      setPendingProvider("");
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-panel auth-modal-panel">
        <div className="modal-head">
          <div>
            <span className="eyebrow">登录 seeFactory</span>
            <h2>选择登录方式</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="关闭">
            <Icon name="close" />
          </button>
        </div>
        <div className="auth-grid">
          <div className="auth-method">
            <div className="auth-method-title">
              <Icon name="google" />
              <span>Google</span>
            </div>
            {GOOGLE_CLIENT_ID ? (
              <>
                <div ref={googleHostRef} className="google-button-host" />
                {!googleReady ? <small>正在加载 Google 登录</small> : null}
              </>
            ) : (
              <small>Google 登录暂未开放</small>
            )}
          </div>
          <button disabled={pendingProvider === "X"} onClick={handleXLogin}>
            <Icon name="x" />
            {pendingProvider === "X" ? "准备授权" : "X"}
          </button>
          <div className="auth-method">
            <div className="auth-method-title">
              <Icon name="telegram" />
              <span>Telegram</span>
            </div>
            {TELEGRAM_BOT_USERNAME ? (
              <div ref={telegramHostRef} className="telegram-widget-host" />
            ) : (
              <small>Telegram 登录暂未开放</small>
            )}
          </div>
        </div>
        {pendingProvider ? <p className="muted-text">正在完成 {pendingProvider} 登录，请稍候。</p> : null}
        <p className="muted-text">
          Telegram 登录可与 Telegram 小程序中的账号保持一致。
        </p>
      </div>
    </div>
  );
}

type AccessChannel = {
  key: string;
  title: string;
  label: string;
  description: string;
  icon: string;
  actionLabel: string;
  href?: string;
  copyKeyword?: string;
  disabled?: boolean;
};

const ACCESS_CHANNELS: AccessChannel[] = [
  {
    key: "apk",
    title: "App（Google Play）",
    label: "Android App",
    description: "前往 Google Play 获取 Android 版本，适合固定在手机桌面使用。",
    icon: "app",
    actionLabel: "打开 Google Play",
    href: "https://play.google.com/store/search?q=seeFactory&c=apps"
  },
  {
    key: "tma",
    title: "Telegram Mini App",
    label: "TMA",
    description: "在 Telegram 内登录、查看点数、运行工具和模板。",
    icon: "telegram",
    actionLabel: "打开 TMA",
    href: "https://tma.seefactory.xyz"
  },
  {
    key: "wechat",
    title: "微信小程序",
    label: "WeChat",
    description: "在微信中搜索 seeFactory，打开后可使用移动端创作入口。",
    icon: "wechat",
    actionLabel: "复制小程序名称",
    copyKeyword: "seeFactory"
  },
  {
    key: "alipay",
    title: "支付宝小程序",
    label: "Alipay",
    description: "在支付宝中搜索 seeFactory，进入适配支付宝场景的小程序。",
    icon: "alipay",
    actionLabel: "复制小程序名称",
    copyKeyword: "seeFactory"
  },
  {
    key: "douyin",
    title: "抖音小程序",
    label: "Douyin",
    description: "在抖音中搜索 seeFactory，适合从内容场景快速进入创作。",
    icon: "douyin",
    actionLabel: "复制小程序名称",
    copyKeyword: "seeFactory"
  }
];

function PlatformAccessModal({
  open,
  onClose,
  onToast
}: {
  open: boolean;
  onClose: () => void;
  onToast: (toast: Toast) => void;
}) {
  if (!open) return null;

  const handleChannelAction = (channel: AccessChannel) => {
    if (channel.disabled) return;
    if (channel.href) {
      openExternalUrl(channel.href);
      return;
    }
    if (channel.copyKeyword) {
      navigator.clipboard?.writeText(channel.copyKeyword).catch(() => undefined);
      onToast({ title: `已复制：${channel.copyKeyword}，请在${channel.title.replace("小程序", "")}中搜索打开`, tone: "success" });
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel platform-access-modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">移动端入口</span>
            <h2>选择访问方式</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="关闭">
            <Icon name="close" />
          </button>
        </div>
        <p className="platform-access-intro">根据你所在的平台打开 seeFactory。桌面端可以继续使用工作台，移动端更适合快速提交任务、查看作品和下载结果。</p>
        <div className="platform-access-grid">
          {ACCESS_CHANNELS.map((channel) => (
            <article className={channel.disabled ? "platform-access-card disabled" : "platform-access-card"} key={channel.key}>
              <div className="platform-access-icon">
                <Icon name={channel.icon} />
              </div>
              <div>
                <span>{channel.label}</span>
                <h3>{channel.title}</h3>
                <p>{channel.description}</p>
              </div>
              <button type="button" onClick={() => handleChannelAction(channel)} disabled={channel.disabled}>
                {channel.actionLabel}
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function PublicShell({
  appConfig,
  authed,
  onLogin,
  onOpenDashboard,
  onToast,
  children
}: {
  appConfig?: PublicAppConfig | null;
  authed: boolean;
  onLogin: () => void;
  onOpenDashboard: () => void;
  onToast: (toast: Toast) => void;
  children: React.ReactNode;
}) {
  const [platformAccessOpen, setPlatformAccessOpen] = useState(false);

  return (
    <div className="site-shell runninghub-shell">
      <HeroBackground home={appConfig?.home} />
      <div className="launch-strip">
        <span>Workflow 画布与模板市场已开放</span>
        <strong>工具、模板与作品广场会持续更新</strong>
        <button type="button" onClick={onOpenDashboard}>立即创作</button>
      </div>
      <header className="topbar rh-topbar">
        <Logo appConfig={appConfig} />
        <nav>
          <a href="#tools">探索</a>
          <a href="#cases">模板</a>
          <a href="#showcase">广场</a>
          <a href="#models">模型</a>
          <a href="#pricing">价格</a>
          <a href="#help">帮助</a>
        </nav>
        <div className="topbar-actions">
          <Button variant="ghost" onClick={() => setPlatformAccessOpen(true)}>
            <Icon name="phone" />
            App / 小程序
          </Button>
          <button type="button" className="search-fab" aria-label="搜索">
            <Icon name="search" />
          </button>
          {authed ? (
            <Button variant="ghost" onClick={onOpenDashboard}>
              <Icon name="panel" />
              工作台
            </Button>
          ) : (
            <Button variant="primary" onClick={onLogin}>
              <Icon name="login" />
              登录
            </Button>
          )}
        </div>
      </header>
      {children}
      <PlatformAccessModal open={platformAccessOpen} onClose={() => setPlatformAccessOpen(false)} onToast={onToast} />
    </div>
  );
}

function HeroBackground({ home }: { home?: PublicAppConfig["home"] }) {
  const videoUrl = resolveConfigAssetUrl(home?.videoUrl) || DEFAULT_HOME_VIDEO_URL;
  const posterUrl = versionDashboardVisualAsset(resolveConfigAssetUrl(home?.posterUrl || home?.fallbackImageUrl) || DEFAULT_HOME_POSTER_URL);
  if (!videoUrl && !posterUrl) return null;

  return (
    <div className={`hero-media ${home?.videoFixed === false ? "" : "fixed"}`} aria-hidden="true">
      {videoUrl ? (
        <video
          src={videoUrl}
          poster={posterUrl || undefined}
          autoPlay
          muted={home?.videoMuted !== false}
          loop={home?.videoLoop !== false}
          playsInline
          preload="metadata"
        />
      ) : (
        <img src={posterUrl} alt="" loading="eager" />
      )}
    </div>
  );
}

const dashboardVisuals = {
  hero: versionDashboardVisualAsset("/visuals/hero-control-room.jpg"),
  heroWide: versionDashboardVisualAsset("/visuals/hero-factory-wide.jpg"),
  image: versionDashboardVisualAsset("/visuals/image-studio.jpg"),
  video: versionDashboardVisualAsset("/visuals/video-timeline.jpg"),
  workflow: versionDashboardVisualAsset("/visuals/workflow-canvas.jpg"),
  gallery: versionDashboardVisualAsset("/visuals/gallery-wall.jpg"),
  model: versionDashboardVisualAsset("/visuals/model-lab.jpg"),
  market: versionDashboardVisualAsset("/visuals/workflow-market-wide.jpg")
};

const homeVisualFallbacks = [
  dashboardVisuals.image,
  dashboardVisuals.video,
  dashboardVisuals.workflow,
  dashboardVisuals.gallery,
  dashboardVisuals.model,
  dashboardVisuals.heroWide,
  dashboardVisuals.market
];

function homeVisual(index = 0) {
  return homeVisualFallbacks[Math.abs(index) % homeVisualFallbacks.length];
}

function toolVisualUrl(tool: Tool, index = 0) {
  const category = String(tool.category || tool.outputTypes?.[0] || "").toLowerCase();
  const fields = (tool.fields || []).join(" ").toLowerCase();
  if (category.includes("video")) return dashboardVisuals.video;
  if (fields.includes("workflow") || fields.includes("model")) return dashboardVisuals.workflow;
  if (category.includes("image")) return dashboardVisuals.image;
  return homeVisual(index);
}

function Hero({
  appConfig,
  tools,
  onStart,
  onShowcase
}: {
  appConfig?: PublicAppConfig | null;
  tools: Tool[];
  onStart: () => void;
  onShowcase: () => void;
}) {
  const home = appConfig?.home;
  const brandName = appConfig?.brand?.name?.trim() || "seeFactory";
  const posterUrl = versionDashboardVisualAsset(resolveConfigAssetUrl(home?.posterUrl || home?.fallbackImageUrl) || DEFAULT_HOME_POSTER_URL) || dashboardVisuals.hero;
  const videoUrl = resolveConfigAssetUrl(home?.videoUrl) || DEFAULT_HOME_VIDEO_URL;
  const imageTools = tools.filter((tool) => tool.category === "image");
  const videoTools = tools.filter((tool) => tool.category === "video");
  const featuredTool = tools[0];
  const videoTool = videoTools[0] || tools[1];
  const imageTool = imageTools[0] || tools[2];
  const workflowCount = tools.filter((tool) => (tool.fields || []).includes("model")).length;
  const capabilityText = tools.length
    ? `${tools.length} 个工具 · ${videoTools.length} 个视频能力 · ${workflowCount} 个模型化生成入口`
    : "工具矩阵、视频能力与模型入口会持续开放";

  return (
    <section className="rh-hero" aria-label={brandName + " 首页"}>
      <div className="hero-tile hero-tile-tall">
        <img src={dashboardVisuals.image} alt="AI 图像创作空间" />
        <div className="tile-shade" />
        <div className="tile-copy bottom-left">
          <span>AI 图像工厂</span>
          <strong>{imageTool?.name || "AI 图像工厂"}</strong>
          <small>选择比例、清晰度与模型，快速生成可下载作品</small>
        </div>
      </div>

      <div className="hero-tile hero-tile-main">
        {videoUrl ? (
          <>
            <img className="hero-card-backdrop" src={dashboardVisuals.hero} alt="seeFactory AI 内容工厂" loading="eager" />
            <video
              className="hero-card-video-overlay"
              src={videoUrl}
              poster={posterUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              onLoadedData={(event) => {
                void event.currentTarget.play().catch(() => {});
              }}
            />
          </>
        ) : (
          <img className="hero-card-backdrop" src={posterUrl || dashboardVisuals.hero} alt="seeFactory AI 内容工厂" />
        )}
        <div className="tile-shade heavy" />
        <div className="tile-copy center-stage">
          <span>{productCopy(home?.eyebrow, "seeFactory 工作台")}</span>
          <h1>{productCopy(home?.headline, "AI 内容工厂")}</h1>
          <p>{productCopy(home?.subtitle, "在桌面端浏览工具、案例、模型和作品广场；登录后即可生成、下载、收藏、购买模板并编排 Workflow。")}</p>
          <div className="hero-actions">
            <Button onClick={onStart}>
              <Icon name="play" />
              开始创作
            </Button>
            <Button variant="ghost" onClick={onShowcase}>
              <Icon name="gallery" />
              逛作品广场
            </Button>
          </div>
        </div>
      </div>

      <div className="hero-side-stack">
        <div className="hero-tile hero-tile-small">
          <img src={dashboardVisuals.workflow} alt="Workflow 模板编排" />
          <div className="tile-shade" />
          <div className="tile-copy bottom-left">
            <span>热门模板</span>
            <strong>开源 / 闭源 Workflow 模板</strong>
          </div>
        </div>
        <div className="invite-card">
          <img className="invite-card-media" src={dashboardVisuals.video} alt="" aria-hidden="true" />
          <span>AI 视频</span>
          <strong>{videoTool?.name || "视频工作流生成"}</strong>
          <button type="button" onClick={onStart}>进入工作台</button>
        </div>
      </div>

      <div className="hero-campaign">
        <div>
          <strong>{featuredTool?.name || "工具矩阵已上线"}</strong>
          <span>{capabilityText}</span>
        </div>
        <button type="button" onClick={onStart}>立即使用</button>
      </div>

      <div className="platform-routes" aria-label="分端入口">
        <button type="button" className="platform-card primary" onClick={onStart}>
          <span>桌面 Web</span>
          <strong>进入创作工作台</strong>
          <small>适合管理作品、编排 Workflow、购买模板和查看点数钱包。</small>
        </button>
        <a className="platform-card" href="https://app.seefactory.xyz" target="_blank" rel="noreferrer">
          <span>移动端小程序</span>
          <strong>打开移动创作入口</strong>
          <small>适合快速提交图像、视频任务，查看作品进度和下载结果。</small>
        </a>
        <a className="platform-card" href="https://tma.seefactory.xyz" target="_blank" rel="noreferrer">
          <span>Telegram Mini App</span>
          <strong>打开 Telegram 版本</strong>
          <small>在 Telegram 中快速进入工具、模板与点数账户。</small>
        </a>
      </div>
    </section>
  );
}

function ToolMatrix({ tools }: { tools: Tool[] }) {
  const featured = tools.slice(0, 12);
  return (
    <section id="tools" className="content-band rh-section tool-section">
      <div className="section-title-row rh-title-row">
        <div>
          <span className="eyebrow">工具</span>
          <h2>探索 seeFactory 工具</h2>
        </div>
        <span className="section-note">选择图像、视频和 Workflow 工具，登录后按页面参数完成生成。</span>
      </div>
      {featured.length ? (
        <div className="tool-grid rh-tool-grid">
          {featured.map((tool, index) => {
            const visualUrl = toolVisualUrl(tool, index);
            return (
            <article className={index === 0 ? "tool-card rh-tool-card hero-tool" : "tool-card rh-tool-card"} key={tool.toolKey}>
              <div className="tool-card-visual" data-kind={tool.category === "video" ? "video" : "image"}>
                <img src={visualUrl} alt="" aria-hidden="true" loading="lazy" />
                <div className="tile-shade" />
                <Icon name={tool.category === "video" ? "video" : "image"} />
                <span>{tool.category === "video" ? "AI 视频" : "AI 图像"}</span>
              </div>
              <div className="card-topline">
                <span>{tool.category === "video" ? "视频" : "图像"}</span>
                <span>{tool.cost || 0} 点/次</span>
              </div>
              <h3>{tool.name}</h3>
              <p>{productCopy(tool.description, "该工具正在补充说明，仍可进入工作台查看可用参数。")}</p>
              <div className="chip-row">
                {(tool.fields || []).slice(0, 5).map((field) => (
                  <span key={field}>{paramLabel(field)}</span>
                ))}
              </div>
            </article>
          );
          })}
        </div>
      ) : (
        <EmptyBlock title="暂无公开工具" body="工具库正在整理中，请稍后再来查看。" />
      )}
    </section>
  );
}

function contentCoverUrl(item?: { coverUrl?: string } | null, fallback = dashboardVisuals.hero) {
  return resolveConfigAssetUrl(item?.coverUrl || fallback);
}

function caseActionLabel(item: CaseContent) {
  if (item.caseType === "workflow") return item.licenseMode === "closed_paid" ? "购买并运行" : "打开 Workflow";
  if (item.caseType === "prompt") return "复制提示词";
  return "同款创作";
}

function HomeChannelStrip({
  tools,
  cases,
  galleryWorks,
  onStart
}: {
  tools: Tool[];
  cases: CaseContent[];
  galleryWorks: Work[];
  onStart: () => void;
}) {
  const tiles = [
    { title: cases[0]?.title || "图像创作模板入口", label: "一键同款", image: contentCoverUrl(cases[0], dashboardVisuals.image) },
    { title: cases[1]?.title || "视频 Workflow 入口", label: "Workflow 模板", image: contentCoverUrl(cases[1], dashboardVisuals.workflow) },
    { title: galleryWorks[0]?.galleryTitle || galleryWorks[0]?.title || "作品广场精选入口", label: "作品广场", image: contentCoverUrl(galleryWorks[0], dashboardVisuals.gallery) },
    { title: tools[0]?.name || "热门工具入口", label: "热门工具", image: toolVisualUrl(tools[0] || ({} as Tool), 0) }
  ];
  return (
    <section className="rh-hot-strip" aria-label="热门模板">
      <div className="hot-copy">
        <span>无限画布</span>
        <strong>热门模板</strong>
        <button type="button" onClick={onStart}>进入工作台</button>
      </div>
      <div className="hot-card-row">
        {tiles.map((tile, index) => (
          <article className="hot-card" key={String(tile.title) + "-" + index}>
            <img src={tile.image} alt={tile.title} loading="lazy" />
            <span>{tile.label}</span>
            <strong>{tile.title}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function HomeCaseDeck({
  cases,
  authed,
  onLogin,
  onToast,
  onOpenDashboard
}: {
  cases: CaseContent[];
  authed: boolean;
  onLogin: () => void;
  onToast: (toast: Toast) => void;
  onOpenDashboard?: (tab: string, path?: string) => void;
}) {
  const openCase = (item: CaseContent) => {
    if (!authed && item.caseType === "workflow" && item.purchaseRequired) {
      onToast({ title: "请先登录后再购买或运行闭源 Workflow", tone: "info" });
      onLogin();
      return;
    }
    if (item.caseType === "workflow") {
      onOpenDashboard?.("cases", workflowCasePath(item.id));
      return;
    }
    if (!authed) {
      onToast({ title: "请先登录后再进行同款创作", tone: "info" });
      onLogin();
      return;
    }
    onOpenDashboard?.("create", item.toolKey ? "/dashboard/tool/" + encodeURIComponent(item.toolKey) : dashboardPathForTab("create"));
  };

  return (
    <section id="cases" className="content-band rh-section case-deck-section">
      <div className="section-title-row rh-title-row">
        <div>
          <span className="eyebrow">模板</span>
          <h2>案例与 Workflow 市场</h2>
        </div>
        <span className="section-note">从提示词、作品和 Workflow 模板中挑选灵感，登录后可收藏、购买或直接运行。</span>
      </div>
      {cases.length ? (
        <div className="case-deck-grid">
          {cases.slice(0, 8).map((item, index) => (
            <article className={index < 2 ? "case-deck-card featured" : "case-deck-card"} key={item.id}>
              <img src={contentCoverUrl(item, homeVisual(index + 2))} alt={item.title} loading="lazy" />
              <div className="tile-shade" />
              <div className="case-deck-body">
                <div className="card-topline">
                  <span>{caseContentTypeLabel(item)}</span>
                  <span>{caseContentAccessLabel(item)}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{productCopy(item.summary, "该案例暂未填写摘要。")}</p>
                <div className="chip-row">
                  {caseContentTags(item).map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <button type="button" onClick={() => openCase(item)}>{caseActionLabel(item)}</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyBlock title="暂无公开案例" body="模板市场正在整理中，稍后会展示更多可复用案例。" />
      )}
    </section>
  );
}

function HomeGalleryPreview({
  works,
  authed,
  onLogin,
  onToast,
  onOpenDashboard
}: {
  works: Work[];
  authed: boolean;
  onLogin: () => void;
  onToast: (toast: Toast) => void;
  onOpenDashboard?: (tab: string, path?: string) => void;
}) {
  const openWork = (work: Work) => {
    if (!authed) {
      onToast({ title: "请先登录后再下载、收藏或同款创作", tone: "info" });
      onLogin();
      return;
    }
    onOpenDashboard?.("works", "/dashboard/works/" + encodeURIComponent(work.id));
  };

  return (
    <section id="showcase" className="content-band rh-section gallery-preview-section">
      <div className="section-title-row rh-title-row">
        <div>
          <span className="eyebrow">广场</span>
          <h2>公开作品广场</h2>
        </div>
        <span className="section-note">打开作品可查看提示词与参数；下载、收藏和同款创作需要登录。</span>
      </div>
      {works.length ? (
        <div className="gallery-preview-grid">
          {works.slice(0, 10).map((work, index) => {
            const url = workPreviewUrl(work) || homeVisual(index + 3);
            return (
              <button type="button" className={index === 0 ? "gallery-preview-card featured" : "gallery-preview-card"} key={work.id} onClick={() => openWork(work)}>
                {isVideoUrl(url) || work.contentType === "video" ? <video src={url} preload="metadata" /> : <img src={url} alt={workTitle(work)} loading="lazy" />}
                <div className="tile-shade" />
                <strong>{work.galleryTitle || work.title || "未命名作品"}</strong>
                <span>{work.author?.nickname || "seeFactory 用户"} · {work.toolKey || "创作工具"}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="empty-gallery-wall">
          <img src={dashboardVisuals.gallery} alt="" aria-hidden="true" />
          <strong>作品广场正在等待第一批精选内容</strong>
          <span>这里会汇集用户公开发布的图像与视频作品。</span>
        </div>
      )}
    </section>
  );
}

function HomeModelStrip({ models }: { models: ModelCapability[] }) {
  return (
    <section id="models" className="content-band rh-section model-strip-section">
      <div className="section-title-row rh-title-row">
        <div>
          <span className="eyebrow">模型</span>
          <h2>可用模型能力</h2>
        </div>
        <span className="section-note">查看可用于创作的图像、视频和工作流模型能力。</span>
      </div>
      {models.length ? (
        <div className="model-strip">
          {models.slice(0, 18).map((model) => (
            <article key={model.modelKey}>
              <span>{model.modality || model.nodeType || "模型"}</span>
              <strong>{model.name}</strong>
              <small>{model.pricePoints || 0} 点 · {paymentStatusLabel(model.status || "online")}</small>
            </article>
          ))}
        </div>
      ) : (
        <EmptyBlock title="暂无可用模型" body="模型能力正在整理中，请稍后再查看。" />
      )}
    </section>
  );
}

function HomePricingBlock({
  rechargePolicy,
  onStart
}: {
  rechargePolicy?: RechargePolicy | null;
  onStart: () => void;
}) {
  const pointRate = Number(rechargePolicy?.pointRate || 7);
  return (
    <section id="pricing" className="content-band rh-section pricing-runway">
      <article>
        <span className="eyebrow">钱包</span>
        <h2>桌面端采用 Crypto 充值</h2>
        <p>移动端按所在平台支付，桌面端通过 Crypto 充值点数。</p>
      </article>
      <article>
        <span className="eyebrow">点数</span>
        <h2>1 CNY = {formatPoints(pointRate)} 点</h2>
        <p>支持自填金额充值；每次生成或运行前都会展示预估点数，确认后再扣除。</p>
      </article>
      <article>
          <span className="eyebrow">工作流</span>
        <h2>预估冻结 + 实际结算</h2>
        <p>失败释放未消耗部分，购买闭源模板后永久获得该发布版本运行权。</p>
      </article>
      <button type="button" onClick={onStart}>打开钱包与工作台</button>
    </section>
  );
}

function caseContentTypeLabel(item: CaseContent) {
  if (item.caseType === "prompt") return "提示词案例";
  if (item.caseType === "work") return "作品案例";
  return "Workflow 案例";
}

function caseContentAccessLabel(item: CaseContent) {
  if (item.caseType === "workflow") {
    return item.licenseMode === "closed_paid" ? "闭源付费" : "开源免费";
  }
  if (item.caseType === "prompt") return "提示词可见";
  return "公开作品";
}

function caseContentMetricLabel(item: CaseContent) {
  if (item.caseType === "workflow") return formatPoints(item.pricePoints || 0) + " 点";
  if (item.caseType === "prompt") return formatPoints(item.runCount || 0) + " 次使用";
  return formatPoints(item.runCount || 0) + " 次浏览";
}

function caseContentTags(item: CaseContent) {
  const tags = item.tags?.length ? item.tags : [item.category || item.caseType || "case"];
  return tags.filter(Boolean).map((tag) => productCopy(tag)).slice(0, 3);
}

type CaseContentFilter = "all" | "prompt" | "work" | "workflow";

function CaseSquare({
  cases,
  authed,
  onLogin,
  onToast,
  pendingAction,
  onRequireAuthAction,
  onActionConsumed,
  onOpenDashboard
}: {
  cases: CaseContent[];
  authed: boolean;
  onLogin: () => void;
  onToast: (toast: Toast) => void;
  pendingAction?: PendingPublicAction | null;
  onRequireAuthAction?: (action: PendingPublicAction) => void;
  onActionConsumed?: () => void;
  onOpenDashboard?: (tab: string, path?: string) => void;
}) {
  const [activeType, setActiveType] = useState<CaseContentFilter>("all");
  const [items, setItems] = useState<CaseContent[]>(cases);
  const [selectedCase, setSelectedCase] = useState<CaseContent | null>(cases[0] || null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const pendingCaseActionRef = useRef("");
  const filteredItems = activeType === "all" ? items : items.filter((item) => item.caseType === activeType);

  const mergeCaseContent = (next: CaseContent) => {
    setItems((current) => current.map((item) => (item.id === next.id ? { ...item, ...next } : item)));
    setSelectedCase((current) => (current?.id === next.id ? { ...current, ...next } : current));
  };

  const loadCases = (nextType = activeType) => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ pageSize: "18" });
    if (nextType !== "all") params.set("caseType", nextType);
    apiGet<PageData<CaseContent>>(`/case-contents?${params.toString()}`, { auth: authed })
      .then((data) => {
        const list = data.list || [];
        setItems(list);
        setSelectedCase((current) => {
          if (current && list.some((item) => item.id === current.id)) return list.find((item) => item.id === current.id) || current;
          return list[0] || null;
        });
      })
      .catch((err) => setError(err.message || "案例广场加载失败"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (activeType === "all" && cases.length) {
      setItems(cases);
      setSelectedCase((current) => {
        if (current && cases.some((item) => item.id === current.id)) return cases.find((item) => item.id === current.id) || current;
        return cases[0] || null;
      });
      setLoading(false);
      return;
    }
    loadCases(activeType);
  }, [activeType, authed, cases.length]);

  const openCase = (item: CaseContent) => {
    setSelectedCase(item);
    setBusy(`detail:${item.id}`);
    apiGet<CaseContent>(`/case-contents/${item.id}`, { auth: authed })
      .then((detail) => {
        setSelectedCase(detail);
        mergeCaseContent(detail);
      })
      .catch((err) => onToast({ title: err.message || "案例详情加载失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  const requireCaseAuth = (action: PendingPublicAction, message: string) => {
    if (onRequireAuthAction) {
      onRequireAuthAction(action);
    } else {
      onLogin();
    }
    onToast({ title: message, tone: "info" });
  };

  const copyCasePrompt = (item: CaseContent | null) => {
    const prompt = String(item?.prompt || "").trim();
    if (!prompt) {
      onToast({ title: "该案例暂未公开提示词", tone: "danger" });
      return;
    }
    navigator.clipboard?.writeText(prompt).catch(() => undefined);
    onToast({ title: "提示词已复制", tone: "success" });
  };

  const caseGenerationSeed = async (item: CaseContent) => {
    if (item.caseType === "prompt" && item.sourceId) {
      return apiPost<{ toolKey?: string; prompt?: string; params?: Record<string, unknown> }>(`/prompt-cases/${item.sourceId}/use`, {}, { auth: true });
    }
    return {
      toolKey: item.toolKey,
      prompt: item.prompt,
      params: item.params || {}
    };
  };

  const openWorkflowCase = (item: CaseContent | null) => {
    if (!item?.id) return;
    if (!authed) {
      requireCaseAuth({ type: "case-workflow", caseId: item.id }, "请先登录后再运行 Workflow 案例");
      return;
    }
    onOpenDashboard?.("cases", `/dashboard/workflow-cases?id=${encodeURIComponent(item.id)}`);
  };

  const rerunCase = async (item: CaseContent | null) => {
    if (!item?.id) return;
    if (item.caseType === "workflow") {
      openWorkflowCase(item);
      return;
    }
    if (!authed) {
      requireCaseAuth({ type: "case-rerun", caseId: item.id }, "请先登录后再同款创作");
      return;
    }
    setBusy(`rerun:${item.id}`);
    try {
      const seed = await caseGenerationSeed(item);
      if (!seed.toolKey || !seed.prompt) {
        onToast({ title: "该案例缺少可复用的工具或提示词参数", tone: "danger" });
        return;
      }
      const result = await apiPost<GenerationSubmitResult>("/generation-tasks", {
        toolKey: seed.toolKey,
        prompt: seed.prompt,
        params: seed.params || {}
      }, { auth: true });
      onToast({ title: `同款生成任务已创建：${result.task.id.slice(-6)}`, tone: "success" });
    } catch (err) {
      onToast({ title: err instanceof Error ? err.message : "同款生成失败", tone: "danger" });
    } finally {
      setBusy("");
    }
  };

  const downloadCaseWork = async (item: CaseContent | null) => {
    if (!item?.id) return;
    if (item.caseType !== "work" || !item.sourceId) {
      onToast({ title: "只有公开作品案例支持下载", tone: "info" });
      return;
    }
    if (!authed) {
      requireCaseAuth({ type: "case-download", caseId: item.id }, "请先登录后再下载案例作品");
      return;
    }
    setBusy(`download:${item.id}`);
    try {
      const data = await apiGet<DownloadUrl>(`/works/${item.sourceId}/download-url`, { auth: true });
      if (data.url) {
        openExternalUrl(data.url);
        onToast({ title: data.signed ? "已生成临时下载链接" : "已打开下载链接", tone: "success" });
      } else {
        onToast({ title: "该作品暂未返回下载地址", tone: "danger" });
      }
    } catch (err) {
      onToast({ title: err instanceof Error ? err.message : "下载失败", tone: "danger" });
    } finally {
      setBusy("");
    }
  };

  const toggleFavoriteCase = async (item: CaseContent | null) => {
    if (!item?.id) return;
    if (!authed) {
      requireCaseAuth({ type: "case-favorite", caseId: item.id }, "请先登录后再收藏案例");
      return;
    }
    setBusy(`favorite:${item.id}`);
    try {
      const next = item.favorited
        ? await apiDelete<CaseContent>(`/case-contents/${item.id}/favorite`, { auth: true })
        : await apiPost<CaseContent>(`/case-contents/${item.id}/favorite`, {}, { auth: true });
      mergeCaseContent(next);
      onToast({ title: next.favorited ? "已收藏案例" : "已取消收藏", tone: "success" });
    } catch (err) {
      onToast({ title: err instanceof Error ? err.message : "收藏操作失败", tone: "danger" });
    } finally {
      setBusy("");
    }
  };

  useEffect(() => {
    if (!authed || !pendingAction?.caseId || !pendingAction.type.startsWith("case-")) return;
    const actionKey = `${pendingAction.type}:${pendingAction.caseId}`;
    if (pendingCaseActionRef.current === actionKey) return;
    pendingCaseActionRef.current = actionKey;
    const runPending = async () => {
      const cached = selectedCase?.id === pendingAction.caseId
        ? selectedCase
        : items.find((item) => item.id === pendingAction.caseId);
      const target = cached || await apiGet<CaseContent>(`/case-contents/${pendingAction.caseId}`, { auth: true }).catch(() => null);
      if (!target) return;
      onActionConsumed?.();
      if (pendingAction.type === "case-rerun") await rerunCase(target);
      if (pendingAction.type === "case-download") await downloadCaseWork(target);
      if (pendingAction.type === "case-favorite") await toggleFavoriteCase(target);
      if (pendingAction.type === "case-workflow") openWorkflowCase(target);
    };
    runPending().catch(() => undefined);
  }, [authed, pendingAction, selectedCase, items]);

  return (
    <section id="cases" className="content-band">
      <div className="section-title-row">
        <div>
          <span className="eyebrow">案例</span>
          <h2>公开案例广场</h2>
        </div>
        <span className="section-note">浏览提示词、作品和 Workflow 模板；登录后可收藏、下载、同款创作或运行。</span>
      </div>
      <div className="gallery-filter-row case-type-filter">
        {[
          ["all", "全部"],
          ["prompt", "提示词"],
          ["work", "作品"],
          ["workflow", "Workflow"]
        ].map(([value, label]) => (
          <button key={value} className={activeType === value ? "active" : ""} onClick={() => setActiveType(value as CaseContentFilter)}>
            {label}
          </button>
        ))}
        <button onClick={() => loadCases(activeType)} disabled={loading || Boolean(busy)}>
          <Icon name="sync" />
          {loading ? "同步中" : "刷新"}
        </button>
      </div>
      {error ? <p className="danger-text">{error}</p> : null}
      {loading ? (
        <LoadingBlock title="正在同步案例广场" />
      ) : filteredItems.length ? (
        <div className="case-square-shell">
          <div className="case-layout case-square-grid">
            {filteredItems.map((item) => (
              <button className={selectedCase?.id === item.id ? "case-card active" : "case-card"} key={item.id} onClick={() => openCase(item)}>
                {item.coverUrl ? (
                  <img src={item.coverUrl} alt={item.title} />
                ) : (
                  <div className="case-cover-placeholder">
                    <Icon name="gallery" />
                  </div>
                )}
                <div>
                  <div className="card-topline">
                    <span>{caseContentTypeLabel(item)}</span>
                    <span>{caseContentAccessLabel(item)}</span>
                    <span>{caseContentMetricLabel(item)}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{productCopy(item.summary, "该案例暂未填写摘要。")}</p>
                  <div className="chip-row">
                    {caseContentTags(item).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <article className="gallery-detail-panel case-square-detail">
            {selectedCase ? (
              <>
                <div className="case-detail-preview">
                  {selectedCase.coverUrl ? <img src={selectedCase.coverUrl} alt={selectedCase.title} /> : <Icon name="gallery" />}
                </div>
                <div className="card-topline">
                  <span>{caseContentTypeLabel(selectedCase)}</span>
                  <span>{caseContentAccessLabel(selectedCase)}</span>
                  <span>{busy === `detail:${selectedCase.id}` ? "加载详情中" : caseContentMetricLabel(selectedCase)}</span>
                </div>
                <h3>{selectedCase.title}</h3>
                <p>{productCopy(selectedCase.summary, "该案例暂未填写摘要。")}</p>
                <div className="case-detail-meta">
                  <span>收藏 {formatPoints(selectedCase.favoriteCount || 0)}</span>
                  <span>运行 {formatPoints(selectedCase.runCount || 0)}</span>
                  {selectedCase.caseType === "workflow" ? <span>购买 {formatPoints(selectedCase.purchaseCount || 0)}</span> : null}
                </div>
                {selectedCase.prompt ? (
                  <div className="copy-box">
                    <span>{selectedCase.prompt}</span>
                    <button onClick={() => copyCasePrompt(selectedCase)}>复制</button>
                  </div>
                ) : null}
                {selectedCase.params && Object.keys(selectedCase.params).length ? (
                  <details className="params-panel">
                    <summary>公开参数</summary>
                    <ParamSnapshot params={selectedCase.params} />
                  </details>
                ) : null}
                <div className="case-action-buttons">
                  <Button onClick={() => selectedCase.caseType === "workflow" ? openWorkflowCase(selectedCase) : rerunCase(selectedCase)} disabled={Boolean(busy)}>
                    <Icon name={selectedCase.caseType === "workflow" ? "workflow" : "spark"} />
                    {selectedCase.caseType === "workflow" ? "打开 Workflow" : "同款创作"}
                  </Button>
                  <Button variant="ghost" onClick={() => toggleFavoriteCase(selectedCase)} disabled={Boolean(busy)}>
                    <Icon name="badge" />
                    {selectedCase.favorited ? "取消收藏" : "收藏案例"}
                  </Button>
                  {selectedCase.caseType === "work" ? (
                    <Button variant="ghost" onClick={() => downloadCaseWork(selectedCase)} disabled={Boolean(busy)}>
                      <Icon name="download" />
                      下载作品
                    </Button>
                  ) : null}
                </div>
              </>
            ) : (
              <EmptyBlock title="请选择案例" body="从左侧案例列表中打开一个提示词、作品或 Workflow 案例。" />
            )}
          </article>
        </div>
      ) : (
        <EmptyBlock title="暂无公开案例" body="模板市场正在整理中，稍后会展示更多可复用案例。" />
      )}
    </section>
  );
}

function StaticCaseSquare({ cases }: { cases: CaseContent[] }) {
  return (
    <section id="cases" className="content-band">
      <div className="section-title-row">
        <div>
          <span className="eyebrow">案例</span>
          <h2>公开案例广场</h2>
        </div>
        <span className="section-note">提示词、作品和 Workflow 模板会统一展示在这里。</span>
      </div>
      {cases.length ? (
        <div className="case-layout">
          {cases.map((item) => (
            <article className="case-card" key={item.id}>
              {item.coverUrl ? (
                <img src={item.coverUrl} alt={item.title} />
              ) : (
                <div className="case-cover-placeholder">
                  <Icon name="gallery" />
                </div>
              )}
              <div>
                <div className="card-topline">
                  <span>{caseContentTypeLabel(item)}</span>
                  <span>{caseContentAccessLabel(item)}</span>
                  <span>{caseContentMetricLabel(item)}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{productCopy(item.summary, "该案例暂未填写摘要。")}</p>
                <div className="chip-row">
                  {caseContentTags(item).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyBlock title="暂无公开案例" body="模板市场正在整理中，稍后会展示更多可复用案例。" />
      )}
    </section>
  );
}

function GalleryPanel({
  tools,
  initialWorks = [],
  authed,
  onLogin,
  onToast,
  pendingAction,
  onRequireAuthAction,
  onActionConsumed,
  compact = false
}: {
  tools: Tool[];
  initialWorks?: Work[];
  authed: boolean;
  onLogin: () => void;
  onToast: (toast: Toast) => void;
  pendingAction?: PendingPublicAction | null;
  onRequireAuthAction?: (action: PendingPublicAction) => void;
  onActionConsumed?: () => void;
  compact?: boolean;
}) {
  const [items, setItems] = useState<Work[]>(initialWorks);
  const [selectedWork, setSelectedWork] = useState<Work | null>(initialWorks[0] || null);
  const [toolFilter, setToolFilter] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [loading, setLoading] = useState(!initialWorks.length);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const mergeGalleryWork = (next: Work) => {
    setItems((current) => current.map((item) => item.id === next.id ? { ...item, ...next } : item));
    setSelectedWork((current) => current?.id === next.id ? { ...current, ...next } : current);
  };

  const loadGallery = () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ pageSize: compact ? "12" : "30" });
    if (toolFilter) params.set("toolKey", toolFilter);
    if (featuredOnly) params.set("featured", "true");
    apiGet<PageData<Work>>(`/gallery/works?${params.toString()}`, { auth: authed })
      .then((data) => {
        const list = data.list || [];
        setItems(list);
        setSelectedWork((current) => {
          if (current && list.some((item) => item.id === current.id)) {
            return list.find((item) => item.id === current.id) || current;
          }
          return list[0] || null;
        });
      })
      .catch((err) => setError(err.message || "作品广场加载失败"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!toolFilter && !featuredOnly && initialWorks.length) {
      setItems(initialWorks);
      setSelectedWork((current) => current || initialWorks[0] || null);
      setLoading(false);
      return;
    }
    loadGallery();
  }, [toolFilter, featuredOnly, initialWorks.length]);

  const openGalleryWork = (work: Work) => {
    setSelectedWork(work);
    setBusy(`detail:${work.id}`);
    apiGet<Work>(`/gallery/works/${work.id}`, { auth: authed })
      .then(setSelectedWork)
      .catch((err) => onToast({ title: err.message || "公开作品详情加载失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  const downloadGalleryWork = (work: Work | null) => {
    if (!work?.id) return;
    if (!authed) {
      if (onRequireAuthAction) {
        onRequireAuthAction({ type: "gallery-download", workId: work.id });
      } else {
        onLogin();
      }
      onToast({ title: "请先登录后再下载作品", tone: "info" });
      return;
    }
    if (work.downloadEnabled === false) {
      onToast({ title: "该公开作品已关闭下载权限", tone: "danger" });
      return;
    }
    setBusy(`download:${work.id}`);
    apiGet<DownloadUrl>(`/works/${work.id}/download-url`, { auth: true })
      .then((data) => {
        if (data.url) {
          openExternalUrl(data.url);
          onToast({ title: data.signed ? "已生成临时下载链接" : "已打开下载链接", tone: "success" });
        } else {
          onToast({ title: "该作品暂未返回下载地址", tone: "danger" });
        }
      })
      .catch((err) => onToast({ title: err.message || "下载失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  const copyPrompt = (work: Work | null) => {
    const prompt = String(work?.prompt || "").trim();
    if (!prompt) {
      onToast({ title: "该作品没有公开提示词", tone: "danger" });
      return;
    }
    navigator.clipboard?.writeText(prompt).catch(() => undefined);
    onToast({ title: "提示词已复制", tone: "success" });
  };

  const rerunGalleryWork = (work: Work | null) => {
    if (!work?.id) return;
    if (!authed) {
      if (onRequireAuthAction) {
        onRequireAuthAction({ type: "gallery-rerun", workId: work.id });
      } else {
        onLogin();
      }
      onToast({ title: "请先登录后再同款创作", tone: "info" });
      return;
    }
    if (!work.toolKey || !work.prompt) {
      onToast({ title: "该公开作品缺少同款生成参数", tone: "danger" });
      return;
    }
    setBusy(`rerun:${work.id}`);
    apiPost<GenerationSubmitResult>("/generation-tasks", {
      toolKey: work.toolKey,
      modeKey: work.modeKey,
      prompt: work.prompt,
      params: work.params || {},
      inputAssets: work.inputAssets || {}
    }, { auth: true })
      .then((result) => {
        onToast({ title: `同款生成任务已创建：${result.task.id.slice(-6)}`, tone: "success" });
      })
      .catch((err) => onToast({ title: err.message || "同款生成失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  const toggleFavoriteWork = (work: Work | null) => {
    if (!work?.id) return;
    if (!authed) {
      if (onRequireAuthAction) {
        onRequireAuthAction({ type: "gallery-favorite", workId: work.id });
      } else {
        onLogin();
      }
      onToast({ title: "请先登录后再收藏作品", tone: "info" });
      return;
    }
    setBusy(`favorite:${work.id}`);
    const request = work.favorited
      ? apiDelete<Work>(`/works/${work.id}/favorite`, { auth: true })
      : apiPost<Work>(`/works/${work.id}/favorite`, {}, { auth: true });
    request
      .then((next) => {
        mergeGalleryWork(next);
        onToast({ title: next.favorited ? "已收藏作品" : "已取消收藏", tone: "success" });
      })
      .catch((err) => onToast({ title: err.message || "收藏操作失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  useEffect(() => {
    if (!authed || !pendingAction?.workId) return;
    if (pendingAction.type !== "gallery-download" && pendingAction.type !== "gallery-rerun" && pendingAction.type !== "gallery-favorite") return;
    const runPending = async () => {
      const target = selectedWork?.id === pendingAction.workId
        ? selectedWork
        : items.find((item) => item.id === pendingAction.workId)
          || await apiGet<Work>(`/gallery/works/${pendingAction.workId}`, { auth: true }).catch(() => null);
      if (!target) return;
      onActionConsumed?.();
      if (pendingAction.type === "gallery-download") {
        downloadGalleryWork(target);
      } else if (pendingAction.type === "gallery-rerun") {
        rerunGalleryWork(target);
      } else {
        toggleFavoriteWork(target);
      }
    };
    runPending().catch(() => undefined);
  }, [authed, pendingAction, selectedWork, items]);

  return (
    <section id="showcase" className={compact ? "content-band public-gallery compact" : "workspace-section public-gallery"}>
      <div className="section-title-row">
        <div>
          <span className="eyebrow">作品广场</span>
          <h2>作品广场</h2>
        </div>
        <span className="section-note">登录后可下载、收藏或基于公开作品进行同款创作。</span>
      </div>

      <div className="gallery-filter-row">
        <label>
          <span>工具</span>
          <select value={toolFilter} onChange={(event) => setToolFilter(event.target.value)}>
            <option value="">全部工具</option>
            {tools.map((tool) => (
              <option value={tool.toolKey} key={tool.toolKey}>{tool.name}</option>
            ))}
          </select>
        </label>
        <button className={featuredOnly ? "active" : ""} onClick={() => setFeaturedOnly((value) => !value)}>
          <Icon name="badge" />
          只看精选
        </button>
        <button onClick={loadGallery} disabled={Boolean(busy) || loading}>
          <Icon name="sync" />
          {loading ? "同步中" : "刷新"}
        </button>
      </div>

      {error ? <p className="danger-text">{error}</p> : null}

      <div className="gallery-layout">
        <div className="gallery-masonry">
          {loading ? (
            <LoadingBlock title="正在同步作品广场" />
          ) : items.length ? (
            items.map((work) => {
              const url = workPreviewUrl(work);
              return (
                <button key={work.id} className={selectedWork?.id === work.id ? "gallery-tile active" : "gallery-tile"} onClick={() => openGalleryWork(work)}>
                  <div className="gallery-media">
                    {url ? (
                      isVideoUrl(url) || work.contentType === "video" ? <video src={url} preload="metadata" /> : <img src={url} alt={workTitle(work)} loading="lazy" />
                    ) : (
                      <span className="case-cover-placeholder">无预览</span>
                    )}
                    {work.galleryFeatured ? <span className="featured-badge">精选</span> : null}
                  </div>
                  <div className="gallery-tile-body">
                    <strong>{workTitle(work)}</strong>
                    <small>{work.author?.nickname || "seeFactory 用户"} · {work.toolKey || "创作工具"}</small>
                    <span>{Number(work.viewCount || 0)} 浏览 · {Number(work.likeCount || 0)} 喜欢</span>
                  </div>
                </button>
              );
            })
          ) : (
            <EmptyBlock title="暂无公开作品" body="用户发布到作品广场后，会在这里形成公开瀑布流。" />
          )}
        </div>

        <aside className="gallery-detail-panel">
          {selectedWork ? (
            <>
              <div className="section-title-row">
                <div>
              <span className="eyebrow">作品详情</span>
                  <h2>{workTitle(selectedWork)}</h2>
                </div>
                <span className="section-note">{selectedWork.author?.nickname || "seeFactory 用户"}</span>
              </div>
              {workPreviewUrl(selectedWork) ? (
                <div className="generation-preview">
                  {isVideoUrl(workPreviewUrl(selectedWork)) || selectedWork.contentType === "video" ? (
                    <video src={workPreviewUrl(selectedWork)} controls preload="metadata" />
                  ) : (
                    <img src={workPreviewUrl(selectedWork)} alt={workTitle(selectedWork)} loading="lazy" />
                  )}
                </div>
              ) : null}
              <div className="mini-meta">
                <span>{selectedWork.toolKey || "创作工具"}</span>
                <span>{selectedWork.modeKey || "默认模式"}</span>
                <span>{formatDate(selectedWork.galleryPublishedAt || selectedWork.createdAt)}</span>
                <span>{Number(selectedWork.likeCount || 0)} 收藏</span>
                <span>{selectedWork.downloadEnabled === false ? "不可下载" : "允许下载"}</span>
              </div>
              <div className="work-prompt-panel">
                <span>公开提示词</span>
                <p>{selectedWork.prompt || "该作品暂未公开提示词。"}</p>
              </div>
              {selectedWork.gallerySummary ? <p className="muted-text">{productCopy(selectedWork.gallerySummary)}</p> : null}
              <details className="params-panel">
                <summary>同款参数快照</summary>
                <ParamSnapshot params={selectedWork.params} />
              </details>
              <div className="case-action-buttons">
                {workPreviewUrl(selectedWork) ? (
                  <Button variant="ghost" onClick={() => openExternalUrl(workPreviewUrl(selectedWork))}>
                    <Icon name="view" />
                    预览
                  </Button>
                ) : null}
                <Button variant="ghost" onClick={() => copyPrompt(selectedWork)}>
                  <Icon name="copy" />
                  复制提示词
                </Button>
                <Button variant="ghost" onClick={() => toggleFavoriteWork(selectedWork)} disabled={Boolean(busy)}>
                  <Icon name="badge" />
                  {selectedWork.favorited ? "取消收藏" : "收藏作品"}
                </Button>
                <Button variant="ghost" onClick={() => downloadGalleryWork(selectedWork)} disabled={Boolean(busy) || selectedWork.downloadEnabled === false}>
                  <Icon name="download" />
                  下载
                </Button>
                <Button onClick={() => rerunGalleryWork(selectedWork)} disabled={Boolean(busy)}>
                  <Icon name="play" />
                  同款创作
                </Button>
              </div>
            </>
          ) : (
            <EmptyBlock title="请选择公开作品" body="点击左侧作品后，可查看预览、提示词、参数快照和同款创作入口。" />
          )}
        </aside>
      </div>
    </section>
  );
}

function ModelTable({ models }: { models: ModelCapability[] }) {
  return (
    <section id="models" className="content-band model-table-section">
      <div className="section-title-row rh-title-row">
        <div>
          <span className="eyebrow">模型</span>
          <h2>可用模型能力</h2>
        </div>
        <span className="section-note">根据类型和用途筛选可用模型，了解点数消耗与能力范围。</span>
      </div>
      {models.length ? (
        <div className="model-table">
          <div className="model-row header">
            <span>模型</span>
            <span>模态</span>
            <span>节点</span>
            <span>点数</span>
          </div>
          {models.map((model) => (
            <div className="model-row" key={model.modelKey}>
              <strong>{model.name}</strong>
              <span>{model.modality}</span>
              <span>{model.nodeType}</span>
              <span>{model.pricePoints || 0}</span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyBlock title="暂无可用模型" body="模型能力正在整理中，请稍后再查看。" />
      )}
    </section>
  );
}

function telegramLink(value?: string) {
  const account = String(value || "").trim();
  if (!account) return "";
  if (/^https?:\/\//i.test(account)) return account;
  return `https://t.me/${account.replace(/^@/, "")}`;
}

function SupportPanel({
  customerService,
  faqs,
  onToast,
  compact = false
}: {
  customerService?: CustomerServiceConfig | null;
  faqs?: FaqItem[];
  onToast: (toast: Toast) => void;
  compact?: boolean;
}) {
  const wechat = customerService?.wechat || "seeFactory-service";
  const telegram = customerService?.telegram || "@seeFactorySupport";
  const email = customerService?.email || "support@seefactory.ai";
  const note = customerService?.note || "添加客服获取创作建议和充值说明";
  const copyValue = (label: string, value?: string) => {
    const text = String(value || "").trim();
    if (!text) {
      onToast({ title: label + " 暂未提供", tone: "danger" });
      return;
    }
    navigator.clipboard?.writeText(text).catch(() => undefined);
    onToast({ title: label + " 已复制", tone: "success" });
  };

  return (
    <section id="help" className={compact ? "content-band support-panel compact" : "workspace-section support-panel"}>
      <div className="section-title-row rh-title-row">
        <div>
          <span className="eyebrow">帮助中心</span>
          <h2>帮助与客服</h2>
        </div>
        <span className="section-note">通过下方渠道联系 seeFactory 支持团队。</span>
      </div>
      <div className="support-layout">
        <article className="support-card primary">
          <span>客服说明</span>
          <h3>{note}</h3>
          <p>生成失败、充值到账、Workflow 模板购买、公开案例反馈和账号异常，都可以先通过下方渠道联系人工处理。</p>
        </article>
        <article className="support-card">
          <Icon name="copy" />
          <span>微信客服</span>
          <strong>{wechat}</strong>
          <button onClick={() => copyValue("微信客服", wechat)}>复制微信</button>
        </article>
        <article className="support-card">
          <Icon name="telegram" />
          <span>Telegram</span>
          <strong>{telegram}</strong>
          <button onClick={() => openExternalUrl(telegramLink(telegram))}>打开 Telegram</button>
        </article>
        <article className="support-card">
          <Icon name="mail" />
          <span>邮箱</span>
          <strong>{email}</strong>
          <button onClick={() => openExternalUrl("mailto:" + email)}>发送邮件</button>
        </article>
        {customerService?.qrCodeUrl ? (
          <article className="support-card qr-card">
            <img src={customerService.qrCodeUrl} alt="客服二维码" loading="lazy" />
            <span>客服二维码</span>
          </article>
        ) : null}
      </div>
      <FaqPanel faqs={faqs || []} />
      <AgreementLinks onToast={onToast} />
    </section>
  );
}

function FaqPanel({ faqs }: { faqs: FaqItem[] }) {
  const grouped = faqs.reduce<Array<{ category: string; items: FaqItem[] }>>((acc, item) => {
    const category = item.category || "常见问题";
    const existing = acc.find((group) => group.category === category);
    if (existing) {
      existing.items.push(item);
    } else {
      acc.push({ category, items: [item] });
    }
    return acc;
  }, []);

  return (
    <div className="faq-panel">
      <div className="section-title-row">
        <div>
          <span className="eyebrow">常见问题</span>
          <h2>常见问题</h2>
        </div>
        <span className="section-note">了解充值、生成、下载和 Workflow 使用中的常见问题。</span>
      </div>
      {grouped.length ? (
        <div className="faq-grid">
          {grouped.map((group, groupIndex) => (
            <article className="faq-group" key={group.category}>
              <span>{group.category}</span>
              {group.items.map((item, itemIndex) => (
                <details key={`${group.category}-${item.question}`} open={groupIndex === 0 && itemIndex === 0}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </article>
          ))}
        </div>
      ) : (
        <EmptyBlock title="暂无帮助问答" body="帮助问答正在整理中，稍后会补充更多说明。" />
      )}
    </div>
  );
}

const agreementTypes: Array<{ type: AgreementType; label: string; note: string }> = [
  { type: "user", label: "用户协议", note: "平台基础使用、账户和内容规则" },
  { type: "privacy", label: "隐私政策", note: "个人信息、登录身份和数据处理说明" },
  { type: "creator", label: "创作者协议", note: "Workflow 发布、开源/闭源和收益规则" },
  { type: "agent", label: "代理说明", note: "代理关系、邀请和平台内收益说明" }
];

function AgreementLinks({ onToast }: { onToast: (toast: Toast) => void }) {
  const [selectedType, setSelectedType] = useState<AgreementType>("user");
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAgreement = (type: AgreementType) => {
    setSelectedType(type);
    setLoading(true);
    setError("");
    apiGet<Agreement>(`/agreements/${type}`)
      .then((data) => {
        setAgreement(data);
        onToast({ title: `${data.title || agreementTypes.find((item) => item.type === type)?.label || "协议"} 已打开`, tone: "info" });
      })
      .catch((err) => {
        const message = err.message || "协议暂未发布";
        setAgreement(null);
        setError(message);
        onToast({ title: message, tone: "danger" });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="agreement-panel">
      <div className="section-title-row">
        <div>
          <span className="eyebrow">协议</span>
          <h2>协议与规则</h2>
        </div>
        <span className="section-note">查看当前已生效的服务条款与隐私相关说明。</span>
      </div>
      <div className="agreement-link-grid">
        {agreementTypes.map((item) => (
          <button key={item.type} className={selectedType === item.type ? "active" : ""} onClick={() => loadAgreement(item.type)} disabled={loading}>
            <strong>{item.label}</strong>
            <span>{item.note}</span>
          </button>
        ))}
      </div>
      {loading ? <LoadingBlock title="正在读取协议正文" /> : null}
      {error ? <p className="danger-text">{error}</p> : null}
      {agreement ? (
        <article className="agreement-viewer">
          <div className="section-title-row">
            <div>
              <span className="eyebrow">{agreementTypes.find((item) => item.type === agreement.type)?.label || "协议"}</span>
              <h3>{agreement.title}</h3>
            </div>
            <span className="section-note">版本 {agreement.version || "--"} · {formatDate(agreement.publishedAt || agreement.updatedAt)}</span>
          </div>
          <pre>{agreement.contentMarkdown || "该协议暂无正文。"}</pre>
          {agreement.externalUrl ? (
            <Button variant="ghost" onClick={() => openExternalUrl(agreement.externalUrl)}>
              <Icon name="view" />
              打开外部协议链接
            </Button>
          ) : null}
        </article>
      ) : null}
    </div>
  );
}

function PricingHelp({
  customerService,
  faqs,
  rechargePolicy,
  onToast
}: {
  customerService?: CustomerServiceConfig | null;
  faqs?: FaqItem[];
  rechargePolicy?: RechargePolicy | null;
  onToast: (toast: Toast) => void;
}) {
  const pointRate = Number(rechargePolicy?.pointRate || 7);
  const minAmount = formatCnyFromCents(rechargePolicy?.minAmountCents ?? 100);
  const maxAmount = formatCnyFromCents(rechargePolicy?.maxAmountCents ?? 999900);
  const customAmountText = rechargePolicy?.allowCustomAmount === false ? "当前不开放自填金额" : "支持自填充值金额";
  const payPerGenerationText = rechargePolicy?.allowPayPerGeneration === false ? "本次生成直付暂不开放" : "支持余额不足时按本次生成补足";

  return (
    <>
      <section id="pricing" className="content-band pricing-grid pricing-runway">
        <article>
          <span className="eyebrow">钱包</span>
          <h2>桌面端只支持 Crypto 充值</h2>
          <p>移动端按所在平台支付，桌面端通过 Crypto 充值点数。</p>
        </article>
        <article>
          <span className="eyebrow">点数</span>
          <h2>1 CNY = {formatPoints(pointRate)} 点</h2>
          <p>{customAmountText}，单次充值范围 {minAmount} - {maxAmount}。{payPerGenerationText}。</p>
          <p>模板购买扣模板费，后续运行只扣模型节点点数。Workflow 运行采用预估冻结和实际结算。</p>
        </article>
        <article>
          <span className="eyebrow">支持</span>
          <h2>暂未开放在线客服</h2>
          <p>你仍可以通过页面已展示的联系方式获得支持。</p>
        </article>
      </section>
      <SupportPanel customerService={customerService} faqs={faqs} onToast={onToast} compact />
    </>
  );
}

function PublicHome({
  data,
  authed,
  onStart,
  onLogin,
  onToast,
  pendingAction,
  onRequireAuthAction,
  onActionConsumed,
  onOpenDashboard
}: {
  data: ReturnType<typeof usePublicData>;
  authed: boolean;
  onStart: () => void;
  onLogin: () => void;
  onToast: (toast: Toast) => void;
  pendingAction?: PendingPublicAction | null;
  onRequireAuthAction?: (action: PendingPublicAction) => void;
  onActionConsumed?: () => void;
  onOpenDashboard?: (tab: string, path?: string) => void;
}) {
  const scrollToShowcase = () => document.getElementById("showcase")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const publicSection = publicSectionFromPath();
  useEffect(() => {
    if (!publicSection || data.loading) return;
    window.setTimeout(() => {
      document.getElementById(publicSection)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, [data.loading, publicSection]);

  useEffect(() => {
    if (!authed || !pendingAction) return;
    onActionConsumed?.();
    if (pendingAction.type.includes("gallery") && pendingAction.workId) {
      onOpenDashboard?.("works", "/dashboard/works/" + encodeURIComponent(pendingAction.workId));
    } else if (pendingAction.type.includes("case") && pendingAction.caseId) {
      onOpenDashboard?.("cases", workflowCasePath(pendingAction.caseId));
    }
  }, [authed, pendingAction]);

  return (
    <>
      <Hero appConfig={data.appConfig} tools={data.tools} onStart={onStart} onShowcase={scrollToShowcase} />
      {data.loading ? <LoadingBlock title="正在加载创作内容" /> : null}
      {data.error ? <EmptyBlock title="部分内容暂时不可用" body={data.error} /> : null}
      <HomeChannelStrip tools={data.tools} cases={data.cases} galleryWorks={data.galleryWorks} onStart={onStart} />
      <ToolMatrix tools={data.tools} />
      <HomeCaseDeck cases={data.cases} authed={authed} onLogin={onLogin} onToast={onToast} onOpenDashboard={onOpenDashboard} />
      <HomeGalleryPreview works={data.galleryWorks} authed={authed} onLogin={onLogin} onToast={onToast} onOpenDashboard={onOpenDashboard} />
      <HomeModelStrip models={data.models} />
      <HomePricingBlock rechargePolicy={data.rechargePolicy} onStart={onStart} />
      <SupportPanel customerService={data.customerService} faqs={data.faqs} onToast={onToast} compact />
    </>
  );
}

type DashboardNavItem = { key: string; label: string; icon: string };

type DashboardCommandItem = {
  id: string;
  kind: string;
  label: string;
  description: string;
  icon: string;
  tab: string;
  path?: string;
  keywords: string;
};

function dashboardContext(active: string, counts: { tools: number; cases: number; models: number; components: number }) {
  const contexts: Record<string, { title: string; body: string; stat: string }> = {
    overview: { title: "总览当前创作能力", body: "先搜索工具或 Workflow，再进入创作、作品、钱包等高频入口。", stat: `${counts.tools} 工具 · ${counts.models} 模型` },
    create: { title: "选择工具并开始生成", body: "先确认工具和模式，再填写提示词、比例、分辨率或素材输入。", stat: `${counts.tools} 个工具` },
    works: { title: "管理生成资产", body: "筛选、下载、发布、再次生成和分享作品都在这里完成。", stat: "作品库" },
    showcase: { title: "查看公开作品", body: "从公开作品复制提示词，或用同款参数重新创作。", stat: "广场" },
    workflow: { title: "编排可复用流程", body: "拖入组件、绑定模型、预览运行表单，再发布为开源或闭源模板。", stat: `${counts.components} 组件` },
    cases: { title: "浏览 Workflow 案例", body: "开源案例可克隆导出，闭源案例购买后获得永久运行权。", stat: `${counts.cases} 案例` },
    purchases: { title: "运行已购模板", body: "已购买的闭源 Workflow 会沉淀在这里，后续运行只消耗模型节点点数。", stat: "已购" },
    runs: { title: "追踪运行记录", body: "查看 Workflow 运行状态、节点结果、中间产物和失败原因。", stat: "运行" },
    models: { title: "查看模型能力", body: "可用模型、比例、分辨率和精度以实时能力为准。", stat: `${counts.models} 模型` },
    wallet: { title: "管理点数钱包", body: "桌面端使用 Crypto 充值，点数流水会记录生成、回退和收益。", stat: "点数" },
    income: { title: "查看创作者收益", body: "模板购买收益会进入平台内收益余额，按规则冻结后可用。", stat: "收益" },
    pricing: { title: "确认价格规则", body: "查看点数兑换、充值范围、支付说明和生成计费规则。", stat: "价格" },
    help: { title: "获得帮助", body: "查看常见问题、客服渠道和已发布协议。", stat: "帮助" },
    account: { title: "管理账户信息", body: "查看登录身份、账户状态、点数余额和协议入口。", stat: "账户" }
  };
  return contexts[active] || contexts.overview;
}

function dashboardActionItems(active: string): Array<{ label: string; icon: string; tab: string; path?: string }> {
  const presets: Record<string, Array<{ label: string; icon: string; tab: string; path?: string }>> = {
    overview: [
      { label: "开始创作", icon: "image", tab: "create" },
      { label: "打开作品库", icon: "gallery", tab: "works" },
      { label: "编排 Workflow", icon: "nodes", tab: "workflow" }
    ],
    create: [
      { label: "查看作品", icon: "gallery", tab: "works" },
      { label: "模型能力", icon: "nodes", tab: "models" },
      { label: "充值点数", icon: "wallet", tab: "wallet" }
    ],
    works: [
      { label: "再次创作", icon: "image", tab: "create" },
      { label: "公开广场", icon: "gallery", tab: "showcase" },
      { label: "编排 Workflow", icon: "nodes", tab: "workflow" }
    ],
    workflow: [
      { label: "案例市场", icon: "gallery", tab: "cases" },
      { label: "已购模板", icon: "badge", tab: "purchases" },
      { label: "运行记录", icon: "list", tab: "runs" }
    ],
    wallet: [
      { label: "价格说明", icon: "wallet", tab: "pricing" },
      { label: "开始创作", icon: "image", tab: "create" },
      { label: "帮助中心", icon: "mail", tab: "help" }
    ]
  };
  return presets[active] || [
    { label: "开始创作", icon: "image", tab: "create" },
    { label: "我的作品", icon: "gallery", tab: "works" },
    { label: "Workflow", icon: "nodes", tab: "workflow" }
  ];
}

function dashboardCommandItems({
  nav,
  tools,
  cases,
  models,
  components
}: {
  nav: DashboardNavItem[];
  tools: Tool[];
  cases: CaseContent[];
  models: ModelCapability[];
  components: ComponentDefinition[];
}) {
  const navItems: DashboardCommandItem[] = nav.map((item) => ({
    id: `nav:${item.key}`,
    kind: "页面",
    label: item.label,
    description: "打开控制台页面",
    icon: item.icon,
    tab: item.key,
    keywords: `${item.label} ${item.key}`
  }));
  const toolItems: DashboardCommandItem[] = tools.map((tool) => ({
    id: `tool:${tool.toolKey}`,
    kind: "工具",
    label: tool.name,
    description: productCopy(tool.description || tool.category, "打开创作工具"),
    icon: tool.category === "video" || tool.outputTypes?.includes("video") ? "video" : "image",
    tab: "create",
    path: tool.toolKey ? "/dashboard/tool/" + encodeURIComponent(tool.toolKey) : dashboardPathForTab("create"),
    keywords: `${tool.name} ${tool.toolKey} ${tool.category || ""} ${(tool.outputTypes || []).join(" ")} ${productCopy(tool.description || "")}`
  }));
  const caseItems: DashboardCommandItem[] = cases.filter((item) => item.caseType === "workflow").map((item) => ({
    id: `case:${item.id}`,
    kind: "Workflow",
    label: item.title,
    description: productCopy(item.summary || item.category, "打开 Workflow 案例"),
    icon: "nodes",
    tab: "cases",
    path: workflowCasePath(item.id),
    keywords: `${item.title} ${productCopy(item.summary || "")} ${productCopy(item.category || "")} ${(item.tags || []).map((tag) => productCopy(tag)).join(" ")} ${item.licenseMode || ""}`
  }));
  const modelItems: DashboardCommandItem[] = models.map((model) => ({
    id: `model:${model.id}`,
    kind: "模型",
    label: model.name || model.modelKey,
    description: `${model.modality || model.nodeType || "模型"} · ${model.status || "可用"}`,
    icon: "nodes",
    tab: "models",
    keywords: `${model.name || ""} ${model.modelKey} ${model.modality} ${model.nodeType} ${model.capabilityKey}`
  }));
  const componentItems: DashboardCommandItem[] = components.map((component) => ({
    id: `component:${component.id}`,
    kind: "组件",
    label: componentTitle(component),
    description: productCopy(component.description || componentCategoryLabel(component)),
    icon: "nodes",
    tab: "workflow",
    keywords: `${componentTitle(component)} ${component.componentKey} ${component.category || ""} ${component.modelKey || ""} ${productCopy(component.description || "")}`
  }));
  return navItems.concat(toolItems, caseItems, modelItems, componentItems);
}

function DashboardCommandStrip({
  active,
  nav,
  tools,
  cases,
  models,
  components,
  onNavigate
}: {
  active: string;
  nav: DashboardNavItem[];
  tools: Tool[];
  cases: CaseContent[];
  models: ModelCapability[];
  components: ComponentDefinition[];
  onNavigate: (tab: string, path?: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const counts = {
    tools: tools.length,
    cases: cases.filter((item) => item.caseType === "workflow").length,
    models: models.length,
    components: components.length
  };
  const context = dashboardContext(active, counts);
  const allItems = dashboardCommandItems({ nav, tools, cases, models, components });
  const normalizedQuery = query.trim().toLowerCase();
  const results = (normalizedQuery
    ? allItems.filter((item) => item.keywords.toLowerCase().includes(normalizedQuery) || item.label.toLowerCase().includes(normalizedQuery))
    : allItems.filter((item) => item.tab === active || ["create", "works", "workflow"].includes(item.tab))
  ).slice(0, 7);
  const actions = dashboardActionItems(active);
  const runItem = (item: DashboardCommandItem) => {
    setQuery("");
    setFocused(false);
    onNavigate(item.tab, item.path);
  };

  return (
    <section className="dashboard-command-strip">
      <div className="dashboard-command-search">
        <Icon name="search" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 140)}
          placeholder="搜索工具、Workflow、模型或页面"
          aria-label="搜索控制台内容"
        />
        {query ? (
          <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => setQuery("")}>
            清空
          </button>
        ) : null}
        {focused ? (
          <div className="dashboard-command-results">
            {results.length ? results.map((item) => (
              <button key={item.id} type="button" onMouseDown={(event) => { event.preventDefault(); runItem(item); }}>
                <Icon name={item.icon} />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.kind} · {item.description}</small>
                </span>
              </button>
            )) : (
              <div className="dashboard-command-empty">没有匹配结果，试试搜索工具名称、模型名称或 Workflow 标题。</div>
            )}
          </div>
        ) : null}
      </div>
      <div className="dashboard-command-actions">
        {actions.map((action) => (
          <button key={`${action.tab}-${action.label}`} type="button" onClick={() => onNavigate(action.tab, action.path)}>
            <Icon name={action.icon} />
            {action.label}
          </button>
        ))}
      </div>
      <div className="dashboard-context-card">
        <span>{context.stat}</span>
        <strong>{context.title}</strong>
        <small>{context.body}</small>
      </div>
    </section>
  );
}

function DashboardShell({
  appConfig,
  tools,
  cases,
  models,
  components,
  customerService,
  faqs,
  rechargePolicy,
  active,
  onNavigate,
  onLogout,
  onToast
}: {
  appConfig?: PublicAppConfig | null;
  tools: Tool[];
  cases: CaseContent[];
  models: ModelCapability[];
  components: ComponentDefinition[];
  customerService?: CustomerServiceConfig | null;
  faqs?: FaqItem[];
  rechargePolicy?: RechargePolicy | null;
  active: string;
  onNavigate: (tab: string, path?: string) => void;
  onLogout: () => void;
  onToast: (toast: Toast) => void;
}) {
  const routeToolKey = currentDashboardToolKey();
  const routeWorkId = currentDashboardWorkId();
  const routeWorkflowId = currentDashboardWorkflowId();
  const routeWorkflowMode = currentDashboardWorkflowMode();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem(sidebarCollapsedKey) === "true");
  const navGroups: Array<{
    title: string;
    items: DashboardNavItem[];
  }> = [
    {
      title: "创作",
      items: [
        { key: "overview", label: "工作台", icon: "panel" },
        { key: "create", label: "创作工具", icon: "image" },
        { key: "works", label: "我的作品", icon: "gallery" },
        { key: "showcase", label: "公开广场", icon: "gallery" }
      ]
    },
    {
      title: "Workflow",
      items: [
        { key: "workflow", label: "Workflow", icon: "nodes" },
        { key: "cases", label: "案例市场", icon: "gallery" },
        { key: "purchases", label: "已购模板", icon: "badge" },
        { key: "runs", label: "运行记录", icon: "list" }
      ]
    },
    {
      title: "能力与资产",
      items: [
        { key: "models", label: "模型能力", icon: "nodes" },
        { key: "wallet", label: "钱包", icon: "wallet" },
        { key: "income", label: "创作者收益", icon: "wallet" },
        { key: "pricing", label: "价格说明", icon: "wallet" }
      ]
    },
    {
      title: "账户",
      items: [
        { key: "help", label: "帮助中心", icon: "mail" },
        { key: "account", label: "账户设置", icon: "user" }
      ]
    }
  ];
  const nav = navGroups.flatMap((group) => group.items);
  const title = nav.find((item) => item.key === active)?.label || "工作台";
  const handleSidebarCollapse = () => {
    setSidebarCollapsed((value) => {
      const next = !value;
      localStorage.setItem(sidebarCollapsedKey, String(next));
      return next;
    });
  };

  return (
    <div className={`dashboard-shell rh-dashboard-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className={`sidebar rh-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-head">
          <Logo appConfig={appConfig} />
          <button
            className="icon-button sidebar-collapse-button"
            type="button"
            aria-label={sidebarCollapsed ? "展开侧边导航" : "折叠侧边导航"}
            title={sidebarCollapsed ? "展开侧边导航" : "折叠侧边导航"}
            onClick={handleSidebarCollapse}
          >
            <Icon name={sidebarCollapsed ? "panel" : "close"} />
          </button>
        </div>
        <div className="side-nav">
          {navGroups.map((group) => (
            <div className="side-nav-group" key={group.title}>
              <span className="side-nav-title">{group.title}</span>
              {group.items.map((item) => (
                <button
                  key={item.key}
                  className={active === item.key ? "active" : ""}
                  title={item.label}
                  aria-label={item.label}
                  onClick={() => onNavigate(item.key)}
                >
                  <Icon name={item.icon} />
                  <span className="side-nav-label">{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
        <Button variant="ghost" onClick={onLogout}>
          <Icon name="logout" />
          <span className="side-nav-label">退出登录</span>
        </Button>
      </aside>
      <main className="workspace rh-workspace">
        <header className="workspace-head rh-workspace-head">
          <div>
            <span className="eyebrow">创作工作台</span>
            <h1>{title}</h1>
          </div>
          <Button variant="primary" onClick={() => onNavigate("workflow")}>
            <Icon name="plus" />
            新建 Workflow
          </Button>
        </header>
        <DashboardCommandStrip
          active={active}
          nav={nav}
          tools={tools}
          cases={cases}
          models={models}
          components={components}
          onNavigate={onNavigate}
        />
        {active === "overview" ? <Overview tools={tools} cases={cases} models={models} components={components} /> : null}
        {active === "create" ? <CreatePanel tools={tools} initialToolKey={routeToolKey} onToast={onToast} /> : null}
        {active === "works" ? <WorksPanel tools={tools} initialWorkId={routeWorkId} onToast={onToast} onOpenWorkflowCase={(caseId) => onNavigate("cases", workflowCasePath(caseId))} /> : null}
        {active === "showcase" ? <GalleryPanel tools={tools} authed onLogin={() => undefined} onToast={onToast} /> : null}
        {active === "workflow" ? <WorkflowConsole components={components} tools={tools} models={models} workflowPolicy={appConfig?.workflowPolicy} initialWorkflowId={routeWorkflowId} initialRouteMode={routeWorkflowMode} onToast={onToast} /> : null}
        {active === "cases" ? <WorkflowCasePanel initialCases={cases} onOpenPurchases={() => onNavigate("purchases")} onToast={onToast} /> : null}
        {active === "purchases" ? <PurchasedTemplates onToast={onToast} /> : null}
        {active === "income" ? <IncomePanel /> : null}
        {active === "runs" ? <RunsPanel onToast={onToast} /> : null}
        {active === "models" ? <ModelTable models={models} /> : null}
        {active === "pricing" ? <PricingHelp customerService={customerService} faqs={faqs} rechargePolicy={rechargePolicy} onToast={onToast} /> : null}
        {active === "wallet" ? <WalletPanel onToast={onToast} /> : null}
        {active === "help" ? <SupportPanel customerService={customerService} faqs={faqs} onToast={onToast} /> : null}
        {active === "account" ? <AccountPanel onToast={onToast} /> : null}
      </main>
    </div>
  );
}

function Overview({
  tools,
  cases,
  models,
  components
}: {
  tools: Tool[];
  cases: CaseContent[];
  models: ModelCapability[];
  components: ComponentDefinition[];
}) {
  const workflowCases = cases.filter((item) => item.caseType === "workflow");
  const featuredTools = tools.slice(0, 4);
  const featuredCases = workflowCases.slice(0, 4);
  const modelPreview = models.slice(0, 5);
  const componentPreview = components.slice(0, 5);
  const onlineModelCount = models.filter((item) => !item.status || ["enabled", "active", "online", "available"].includes(item.status)).length || models.length;
  const linearComponentCount = components.filter((item) => item.allowedInLinear !== false).length;

  return (
    <div className="overview-page">
      <section className="overview-hero-panel">
        <div className="overview-hero-copy">
          <span className="eyebrow">seeFactory Console</span>
          <h2>从单次生成到可复用工作流的创作工作台</h2>
          <p>这里展示当前账号可使用的工具、公开案例、模型能力与 Workflow 组件。生成参数、点数消耗和可用能力会随平台规则实时更新。</p>
        </div>
        <div className="overview-hero-stack" aria-label="当前工作台状态">
          <span>{tools.length} 个创作工具</span>
          <span>{workflowCases.length} 个 Workflow 案例</span>
          <span>{onlineModelCount} 个在线模型</span>
        </div>
      </section>

      <section className="overview-metrics">
        <div className="metric-card overview-metric-card">
          <span>可用工具</span>
          <strong>{tools.length}</strong>
          <small>可用状态、排序和模型范围会随平台规则更新</small>
        </div>
        <div className="metric-card overview-metric-card">
          <span>公开 Workflow</span>
          <strong>{workflowCases.length}</strong>
          <small>可浏览、购买或运行的公开模板</small>
        </div>
        <div className="metric-card overview-metric-card">
          <span>在线模型</span>
          <strong>{onlineModelCount}</strong>
          <small>模型能力、比例和精度由服务端下发</small>
        </div>
        <div className="metric-card overview-metric-card">
          <span>线性组件</span>
          <strong>{linearComponentCount}</strong>
          <small>可用于拼装简易 Workflow 的组件</small>
        </div>
      </section>

      <section className="overview-panels">
        <article className="wide-panel overview-list-panel">
          <div className="card-topline">
            <span>创作入口</span>
            <small>可用工具</small>
          </div>
          <h3>当前可用工具</h3>
          <ul className="overview-list">
            {featuredTools.length ? featuredTools.map((tool) => (
              <li key={tool.toolKey}>
                <Icon name={tool.category?.toLowerCase().includes("video") ? "video" : "image"} />
                <div>
                  <strong>{tool.name}</strong>
                  <small>{productCopy(tool.description || tool.category, "可用于生成内容的创作工具")}</small>
                </div>
                <b>{typeof tool.cost === "number" ? `${tool.cost} 点` : "按规则计费"}</b>
              </li>
            )) : <li className="overview-empty-line">可用创作工具上线后会显示在这里。</li>}
          </ul>
        </article>

        <article className="wide-panel overview-list-panel">
          <div className="card-topline">
            <span>案例市场</span>
            <small>Workflow</small>
          </div>
          <h3>公开 Workflow 案例</h3>
          <ul className="overview-list">
            {featuredCases.length ? featuredCases.map((item) => (
              <li key={item.id}>
                <Icon name="nodes" />
                <div>
                  <strong>{item.title}</strong>
                  <small>{productCopy(item.summary || item.category, "公开 Workflow 案例")}</small>
                </div>
                <b>{item.licenseMode === "closed_paid" ? `${item.pricePoints || 0} 点` : "免费"}</b>
              </li>
            )) : <li className="overview-empty-line">公开 Workflow 案例上线后会显示在这里。</li>}
          </ul>
        </article>

        <article className="wide-panel overview-capability-panel">
          <div className="card-topline">
            <span>模型能力</span>
            <small>{models.length} 项</small>
          </div>
          <h3>已同步模型</h3>
          <div className="overview-chip-cloud">
            {modelPreview.length ? modelPreview.map((model) => (
              <span key={model.id}>{model.name || model.modelKey}</span>
            )) : <span>暂无可用模型</span>}
          </div>
        </article>

        <article className="wide-panel overview-capability-panel">
          <div className="card-topline">
            <span>组件能力</span>
            <small>{components.length} 项</small>
          </div>
          <h3>可编排组件</h3>
          <div className="overview-chip-cloud">
            {componentPreview.length ? componentPreview.map((component) => (
              <span key={component.id}>{component.displayName || component.label || component.componentKey}</span>
            )) : <span>暂无可用组件</span>}
          </div>
        </article>
      </section>
    </div>
  );
}

function toolModeKey(mode?: ToolMode) {
  return String(mode?.modeKey || mode?.key || mode?.id || "").trim();
}

function enabledToolModes(tool: Tool) {
  return Array.isArray(tool.modes) ? tool.modes.filter((mode) => mode && mode.enabled !== false) : [];
}

function selectedToolMode(tool: Tool, modeKey?: string) {
  const modes = enabledToolModes(tool);
  if (!modes.length) return undefined;
  const requested = String(modeKey || "").trim();
  if (requested) return modes.find((mode) => toolModeKey(mode) === requested) || modes[0];
  return modes.find((mode) => mode.default) || modes[0];
}

function toolModeFields(tool: Tool, mode?: ToolMode) {
  const source = Array.isArray(mode?.fields) ? mode?.fields : tool.fields;
  return (source || []).map((field) => String(field || "").trim()).filter(Boolean);
}

function toolModeAssetSlots(tool: Tool, mode?: ToolMode) {
  const source = Array.isArray(mode?.assetSlots) ? mode?.assetSlots : tool.assetSlots;
  return (source || [])
    .filter((slot) => slot && typeof slot === "object")
    .map((slot) => ({
      ...slot,
      slotKey: String(slot.slotKey || slot.key || slot.name || "").trim()
    }))
    .filter((slot) => slot.slotKey);
}

function toolModeOptions(tool: Tool, mode?: ToolMode) {
  const modeOptions = mode?.options && typeof mode.options === "object" ? mode.options : {};
  const next: Record<string, unknown> = {
    ...(tool.options || {}),
    ...modeOptions
  };
  if (Array.isArray(mode?.allowedModels) && mode.allowedModels.length) next.models = mode.allowedModels;
  if (mode?.defaultModelKey) next.defaultModelKey = mode.defaultModelKey;
  return next;
}

function toolOptionStrings(tool: Tool, mode: ToolMode | undefined, key: string) {
  const value = toolModeOptions(tool, mode)[key];
  return Array.isArray(value) ? unique(value.map((item) => String(item || "").trim())) : [];
}

function toolRatioResolutionMap(tool: Tool, mode?: ToolMode) {
  const value = toolModeOptions(tool, mode).ratioResolutionMap;
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string[]>>((map, [ratio, list]) => {
    if (Array.isArray(list)) map[ratio] = unique(list.map((item) => String(item || "").trim()));
    if (typeof list === "string") map[ratio] = unique(list.split(/[,，\s]+/).map((item) => item.trim()));
    return map;
  }, {});
}

function toolOutputKind(tool: Tool, mode?: ToolMode) {
  const text = `${mode?.outputType || ""} ${(tool.outputTypes || []).join(" ")} ${tool.category || ""} ${tool.toolKey} ${tool.name}`.toLowerCase();
  if (/video|视频/.test(text)) return "video";
  if (/audio|音频|voice|music/.test(text)) return "audio";
  return "image";
}

function toolRunForm(tool: Tool, modeKey: string | undefined, values: Record<string, WorkflowRunValue>): WorkflowRunForm {
  const mode = selectedToolMode(tool, modeKey);
  const fields = toolModeFields(tool, mode);
  const outputKind = toolOutputKind(tool, mode);
  const options = toolModeOptions(tool, mode);
  const ratioMap = toolRatioResolutionMap(tool, mode);
  const runFields: WorkflowRunField[] = [];

  runFields.push({
    key: "prompt",
    label: "提示词",
    type: "textarea",
    required: true,
    placeholder: "描述你要生成的内容、主体、风格、构图和限制。"
  });

  if (fields.includes("style")) {
    runFields.push({
      key: "style",
      label: "风格",
      type: "select",
      required: true,
      options: toolOptionStrings(tool, mode, "styles"),
      defaultValue: toolOptionStrings(tool, mode, "styles")[0] || ""
    });
  }

  if (fields.includes("ratio")) {
    const ratios = toolOptionStrings(tool, mode, "ratios").length
      ? toolOptionStrings(tool, mode, "ratios")
      : Object.keys(ratioMap);
    runFields.push({
      key: "ratio",
      label: "比例",
      type: "select",
      required: true,
      options: ratios,
      defaultValue: ratios[0] || ""
    });
  }

  if (fields.includes("resolution")) {
    const ratio = String(values.ratio || Object.keys(ratioMap)[0] || "").trim();
    const resolutionOptions = ratio && ratioMap[ratio]?.length
      ? ratioMap[ratio]
      : toolOptionStrings(tool, mode, "resolutions");
    runFields.push({
      key: "resolution",
      label: outputKind === "video" ? "视频精度" : "图像分辨率",
      type: "select",
      required: true,
      options: resolutionOptions,
      defaultValue: resolutionOptions[0] || ""
    });
  }

  if (fields.includes("duration")) {
    const durations = toolOptionStrings(tool, mode, "durations");
    runFields.push({
      key: "duration",
      label: "生成时长",
      type: "select",
      required: true,
      options: durations,
      defaultValue: durations[0] || ""
    });
  }

  if (fields.includes("model")) {
    const models = toolOptionStrings(tool, mode, "models");
    runFields.push({
      key: "model",
      label: "模型",
      type: "select",
      required: true,
      options: models,
      defaultValue: String(options.defaultModelKey || models[0] || "")
    });
  }

  const slots = toolModeAssetSlots(tool, mode);
  if (slots.length) {
    for (const slot of slots) {
      const type = String(slot.type || "image").toLowerCase() as "image" | "video" | "audio" | "file";
      runFields.push({
        key: `inputAssets.${slot.slotKey}`,
        slotKey: slot.slotKey,
        label: slot.label || slot.name || slot.slotKey || "素材",
        type,
        assetType: type,
        required: slot.required !== false,
        minCount: Number(slot.minCount ?? (slot.required === false ? 0 : 1)),
        maxCount: Number(slot.maxCount ?? (slot.multiple ? 6 : 1)),
        acceptTypes: Array.isArray(slot.acceptTypes) ? slot.acceptTypes : [type]
      });
    }
  } else if (fields.includes("upload") || fields.includes("multiUpload")) {
    const maxCount = fields.includes("multiUpload") ? 6 : 1;
    runFields.push({
      key: "inputAssetIds",
      label: "输入素材",
      type: "image",
      assetType: "image",
      required: true,
      minCount: fields.includes("multiUpload") ? 2 : 1,
      maxCount,
      multiple: maxCount > 1,
      acceptTypes: ["image"]
    });
  }

  return {
    schemaVersion: "seeFactory.toolRunForm.v1",
    fields: runFields
  };
}

function taskIsActive(task?: GenerationTask | null) {
  return ["queued", "processing"].includes(String(task?.status || ""));
}

function generationPreviewUrl(task?: GenerationTask | null, work?: Work | null) {
  return work?.resultUrls?.[0] || work?.coverUrl || task?.resultUrls?.[0] || task?.coverUrl || "";
}

function CreatePanel({
  tools,
  initialToolKey = "",
  onToast
}: {
  tools: Tool[];
  initialToolKey?: string;
  onToast: (toast: Toast) => void;
}) {
  const [selectedToolKey, setSelectedToolKey] = useState(() => initialToolKey || tools[0]?.toolKey || "");
  const [selectedModeKey, setSelectedModeKey] = useState("");
  const [values, setValues] = useState<Record<string, WorkflowRunValue>>({});
  const [uploadState, setUploadState] = useState<WorkflowRunUploadState>({});
  const [activeTask, setActiveTask] = useState<GenerationTask | null>(null);
  const [activeWork, setActiveWork] = useState<Work | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [loadingWorks, setLoadingWorks] = useState(false);
  const [busy, setBusy] = useState<"" | "submit" | "cancel" | "download" | "publish">("");
  const [error, setError] = useState("");

  const selectedTool = tools.find((tool) => tool.toolKey === selectedToolKey) || tools[0];
  const selectedMode = selectedTool ? selectedToolMode(selectedTool, selectedModeKey) : undefined;
  const actualModeKey = selectedMode ? toolModeKey(selectedMode) : "";
  const runForm = selectedTool ? toolRunForm(selectedTool, actualModeKey, values) : undefined;
  const previewUrl = generationPreviewUrl(activeTask, activeWork);

  const resetForTool = (tool: Tool, modeKey = "") => {
    const mode = selectedToolMode(tool, modeKey);
    const nextForm = toolRunForm(tool, toolModeKey(mode), {});
    setValues(initialWorkflowRunValues(nextForm));
    setUploadState({});
    setActiveTask(null);
    setActiveWork(null);
    setError("");
  };

  const loadWorks = (toolKey = selectedTool?.toolKey) => {
    setLoadingWorks(true);
    const query = toolKey ? `?toolKey=${encodeURIComponent(toolKey)}&pageSize=8` : "?pageSize=8";
    apiGet<PageData<Work>>(`/works${query}`, { auth: true })
      .then((data) => setWorks(data.list || []))
      .catch((err) => setError(err.message || "作品库加载失败"))
      .finally(() => setLoadingWorks(false));
  };

  useEffect(() => {
    if (!selectedToolKey && tools[0]) {
      setSelectedToolKey(tools[0].toolKey);
    }
  }, [tools, selectedToolKey]);

  useEffect(() => {
    if (!initialToolKey || !tools.length) return;
    const targetTool = tools.find((tool) => tool.toolKey === initialToolKey);
    if (!targetTool || targetTool.toolKey === selectedToolKey) return;
    const mode = selectedToolMode(targetTool);
    const modeKey = toolModeKey(mode);
    setSelectedToolKey(targetTool.toolKey);
    setSelectedModeKey(modeKey);
    resetForTool(targetTool, modeKey);
    loadWorks(targetTool.toolKey);
  }, [initialToolKey, tools, selectedToolKey]);

  useEffect(() => {
    if (!selectedTool) return;
    const mode = selectedToolMode(selectedTool, selectedModeKey);
    setSelectedModeKey(toolModeKey(mode));
    resetForTool(selectedTool, toolModeKey(mode));
    loadWorks(selectedTool.toolKey);
  }, [selectedTool?.toolKey]);

  useEffect(() => {
    if (!activeTask?.id || !taskIsActive(activeTask)) return undefined;
    const timer = window.setInterval(() => {
      apiGet<GenerationTask>(`/generation-tasks/${activeTask.id}`, { auth: true })
        .then((task) => {
          setActiveTask(task);
          if (!taskIsActive(task) && activeWork?.id) {
            apiGet<Work>(`/works/${activeWork.id}`, { auth: true })
              .then((work) => {
                setActiveWork(work);
                loadWorks(selectedTool?.toolKey);
              })
              .catch(() => undefined);
          }
        })
        .catch((err) => setError(err.message || "生成任务同步失败"));
    }, 5000);
    return () => window.clearInterval(timer);
  }, [activeTask?.id, activeTask?.status, activeWork?.id, selectedTool?.toolKey]);

  if (!tools.length) {
    return (
      <div className="workspace-section">
        <EmptyBlock title="暂无可用创作工具" body="创作工具正在整理中，请稍后再试。" />
      </div>
    );
  }
  if (!selectedTool || !runForm) {
    return (
      <div className="workspace-section">
        <EmptyBlock title="请选择创作工具" body="工具列表同步后即可打开参数表单并提交生成任务。" />
      </div>
    );
  }

  const modes = enabledToolModes(selectedTool);

  const updateValue = (key: string, value: WorkflowRunValue) => {
    if (!selectedTool) return;
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (key === "ratio") {
        const nextForm = toolRunForm(selectedTool, actualModeKey, next);
        const resolutionField = nextForm.fields?.find((field) => field.key === "resolution");
        const options = resolutionField?.options || [];
        const currentResolution = String(next.resolution || "");
        if (options.length && !options.some((option) => fieldOptionValue(option) === currentResolution)) {
          next.resolution = fieldOptionValue(options[0]);
        }
      }
      return next;
    });
  };

  const changeTool = (toolKey: string) => {
    const tool = tools.find((item) => item.toolKey === toolKey);
    if (!tool) return;
    setSelectedToolKey(tool.toolKey);
    const mode = selectedToolMode(tool);
    setSelectedModeKey(toolModeKey(mode));
    resetForTool(tool, toolModeKey(mode));
    loadWorks(tool.toolKey);
  };

  const changeMode = (modeKey: string) => {
    if (!selectedTool) return;
    setSelectedModeKey(modeKey);
    resetForTool(selectedTool, modeKey);
  };

  const submitGeneration = () => {
    if (!selectedTool || !runForm) return;
    if (isWorkflowUploadBusy(uploadState)) {
      onToast({ title: "素材仍在上传中，请稍后提交。", tone: "danger" });
      return;
    }
    const payloadResult = buildWorkflowRunPayload(runForm, values);
    if (!payloadResult.ok) {
      onToast({ title: payloadResult.message, tone: "danger" });
      return;
    }
    const input = payloadResult.payload.input as Record<string, unknown>;
    const prompt = String(input.prompt || "").trim();
    if (!prompt) {
      onToast({ title: "请填写提示词。", tone: "danger" });
      return;
    }
    setBusy("submit");
    setError("");
    apiPost<GenerationSubmitResult>("/generation-tasks", {
      toolKey: selectedTool.toolKey,
      modeKey: actualModeKey || undefined,
      prompt,
      params: payloadResult.payload.params,
      inputAssetIds: input.inputAssetIds,
      inputAssets: input.inputAssets
    }, { auth: true })
      .then((result) => {
        setActiveTask(result.task);
        setActiveWork(result.work);
        onToast({ title: `已提交生成任务：${result.task.id.slice(-6)}`, tone: "success" });
        loadWorks(selectedTool.toolKey);
      })
      .catch((err) => {
        const message = err.message || "生成任务提交失败";
        setError(message);
        onToast({ title: message, tone: "danger" });
      })
      .finally(() => setBusy(""));
  };

  const cancelGeneration = () => {
    if (!activeTask?.id) return;
    setBusy("cancel");
    apiPost<GenerationTask>(`/generation-tasks/${activeTask.id}/cancel`, {}, { auth: true })
      .then((task) => {
        setActiveTask(task);
        onToast({ title: "已取消生成任务，点数将按规则回退。", tone: "success" });
        loadWorks(selectedTool?.toolKey);
      })
      .catch((err) => onToast({ title: err.message || "取消任务失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  const downloadWork = (work?: Work | null) => {
    if (!work?.id) return;
    setBusy("download");
    apiGet<DownloadUrl>(`/works/${work.id}/download-url`, { auth: true })
      .then((data) => {
        if (data.url) {
          openExternalUrl(data.url);
          onToast({ title: data.signed ? "已生成临时下载链接" : "已打开下载链接", tone: "success" });
        } else {
          onToast({ title: "该作品暂无下载地址。", tone: "danger" });
        }
      })
      .catch((err) => onToast({ title: err.message || "下载失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  const publishWork = (work?: Work | null) => {
    if (!work?.id) return;
    setBusy("publish");
    const path = work.galleryVisible ? `/works/${work.id}/unpublish-gallery` : `/works/${work.id}/publish-gallery`;
    apiPost<Work>(path, {}, { auth: true })
      .then((next) => {
        setActiveWork((current) => current?.id === next.id ? next : current);
        setWorks((current) => current.map((item) => item.id === next.id ? next : item));
        onToast({ title: next.galleryVisible ? "作品已发布到广场" : "作品已取消公开", tone: "success" });
      })
      .catch((err) => onToast({ title: err.message || "作品公开状态更新失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  return (
    <div className="create-studio workspace-section">
      <aside className="create-tool-list">
        <div className="draft-head">
          <h3>创作工具</h3>
          <span>{tools.length} 个</span>
        </div>
        {tools.map((tool) => (
          <button key={tool.toolKey} className={selectedTool?.toolKey === tool.toolKey ? "active" : ""} onClick={() => changeTool(tool.toolKey)}>
            <Icon name={tool.category === "video" || tool.outputTypes?.includes("video") ? "video" : "image"} />
            <strong>{tool.name}</strong>
            <small>{tool.cost || 0} 点 · {(tool.outputTypes || [tool.category || "image"]).map(contentTypeLabel).join(" / ")}</small>
          </button>
        ))}
      </aside>

      <section className="create-main-panel">
        <div className="create-heading">
          <div>
            <span className="eyebrow">工具运行</span>
            <h2>{selectedTool?.name}</h2>
            <p>{productCopy(selectedTool?.description, "该工具正在补充说明，仍可进入工作台查看可用参数。")}</p>
          </div>
          <div className="create-status-pill">
            <span>{selectedTool?.cost || 0} 点</span>
            <strong>{activeTask ? paymentStatusLabel(activeTask.status) : "待提交"}</strong>
          </div>
        </div>

        {modes.length > 1 ? (
          <div className="segmented">
            {modes.map((mode) => (
              <button key={toolModeKey(mode)} className={actualModeKey === toolModeKey(mode) ? "active" : ""} onClick={() => changeMode(toolModeKey(mode))}>
                {mode.label || toolModeKey(mode)}
              </button>
            ))}
          </div>
        ) : null}

        {error ? <p className="danger-text">{error}</p> : null}

        <WorkflowRunFormFields
          runForm={runForm}
          values={values}
          disabled={busy === "submit" || taskIsActive(activeTask)}
          uploadState={uploadState}
          onChange={updateValue}
          onUploadStateChange={(key, state) => setUploadState((current) => ({ ...current, [key]: state }))}
          onToast={onToast}
        />

        <div className="case-action-buttons">
          <Button onClick={submitGeneration} disabled={Boolean(busy) || taskIsActive(activeTask) || isWorkflowUploadBusy(uploadState)}>
            <Icon name="play" />
            {busy === "submit" ? "提交中" : "开始生成"}
          </Button>
          {taskIsActive(activeTask) ? (
            <Button variant="ghost" onClick={cancelGeneration} disabled={Boolean(busy)}>
              <Icon name="close" />
              {busy === "cancel" ? "取消中" : "取消任务"}
            </Button>
          ) : null}
        </div>

        <div className="generation-result-panel">
          {activeTask || activeWork ? (
            <>
              <div className="order-head">
                <span>生成结果</span>
                <strong>{paymentStatusLabel(activeTask?.status || activeWork?.status)}</strong>
              </div>
              <div className="mini-meta">
                <span>任务 {activeTask?.id?.slice(-8) || activeWork?.generationTaskId?.slice(-8) || "--"}</span>
                <span>{activeTask?.costPoints || selectedTool?.cost || 0} 点</span>
                <span>{formatDate(activeTask?.createdAt || activeWork?.createdAt)}</span>
              </div>
              {previewUrl ? (
                <div className="generation-preview">
                  {isVideoUrl(previewUrl) || activeWork?.contentType === "video" ? (
                    <video src={previewUrl} controls preload="metadata" />
                  ) : (
                    <img src={previewUrl} alt="生成结果预览" loading="lazy" />
                  )}
                </div>
              ) : (
                <EmptyBlock title={taskIsActive(activeTask) ? "生成处理中" : "暂无结果"} body={taskIsActive(activeTask) ? "任务正在排队或生成中，页面会自动同步状态。" : activeTask?.failureReason || activeWork?.failureReason || "生成完成后会在这里显示预览。"} />
              )}
              {activeTask?.failureReason || activeWork?.failureReason ? <p className="danger-text">{activeTask?.failureReason || activeWork?.failureReason}</p> : null}
              <div className="case-action-buttons">
                {previewUrl ? (
                  <Button variant="ghost" onClick={() => openExternalUrl(previewUrl)}>
                    <Icon name="view" />
                    预览
                  </Button>
                ) : null}
                {activeWork?.status === "success" ? (
                  <>
                    <Button variant="ghost" onClick={() => downloadWork(activeWork)} disabled={Boolean(busy)}>
                      <Icon name="download" />
                      {busy === "download" ? "获取中" : "下载"}
                    </Button>
                    <Button variant="ghost" onClick={() => publishWork(activeWork)} disabled={Boolean(busy)}>
                      <Icon name="gallery" />
                      {busy === "publish" ? "同步中" : activeWork.galleryVisible ? "取消公开" : "发布广场"}
                    </Button>
                  </>
                ) : null}
              </div>
            </>
          ) : (
            <EmptyBlock title="尚未提交生成" body="选择工具、填写提示词和参数后，生成结果会在这里预览并进入作品库。" />
          )}
        </div>
      </section>

      <aside className="recent-work-panel">
        <div className="draft-head">
          <h3>最近作品</h3>
          <button onClick={() => loadWorks(selectedTool?.toolKey)} disabled={loadingWorks}>
            {loadingWorks ? "同步中" : "刷新"}
          </button>
        </div>
        {works.length ? (
          <div className="recent-work-list">
            {works.map((work) => {
              const url = work.resultUrls?.[0] || work.coverUrl || "";
              return (
                <button key={work.id} className={activeWork?.id === work.id ? "active" : ""} onClick={() => setActiveWork(work)}>
                  {url ? (
                    isVideoUrl(url) || work.contentType === "video" ? <video src={url} preload="metadata" /> : <img src={url} alt={work.title || "作品"} loading="lazy" />
                  ) : (
                    <span className="case-cover-placeholder">无预览</span>
                  )}
                  <strong>{work.title || work.prompt?.slice(0, 24) || "未命名作品"}</strong>
                  <small>{work.status || "queued"} · {formatDate(work.createdAt)}</small>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyBlock title="暂无作品" body="该工具生成过的作品会出现在这里。" />
        )}
      </aside>
    </div>
  );
}

function workPreviewUrl(work?: Work | null) {
  return work?.resultUrls?.[0] || work?.coverUrl || "";
}

function workStatusLabel(status?: string) {
  return paymentStatusLabel(status || "queued");
}

function workTitle(work: Work) {
  return work.title || work.galleryTitle || work.prompt?.slice(0, 32) || "未命名作品";
}

function WorksPanel({
  tools,
  initialWorkId = "",
  onToast,
  onOpenWorkflowCase
}: {
  tools: Tool[];
  initialWorkId?: string;
  onToast: (toast: Toast) => void;
  onOpenWorkflowCase: (caseId: string) => void;
}) {
  const [items, setItems] = useState<Work[]>([]);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [toolFilter, setToolFilter] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  const loadWorks = () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ pageSize: "36" });
    if (statusFilter) params.set("status", statusFilter);
    if (toolFilter) params.set("toolKey", toolFilter);
    if (favoriteOnly) params.set("favorited", "true");
    apiGet<PageData<Work>>(`/works?${params.toString()}`, { auth: true })
      .then((data) => {
        const list = data.list || [];
        setItems(list);
        setSelectedWork((current) => {
          const targetId = initialWorkId || current?.id || "";
          if (targetId && list.some((item) => item.id === targetId)) {
            return list.find((item) => item.id === targetId) || current;
          }
          return list[0] || null;
        });
      })
      .catch((err) => setError(err.message || "作品库加载失败"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWorks();
  }, [statusFilter, toolFilter, favoriteOnly, initialWorkId]);

  useEffect(() => {
    if (!initialWorkId || selectedWork?.id === initialWorkId) return;
    apiGet<Work>(`/works/${initialWorkId}`, { auth: true })
      .then((work) => {
        setSelectedWork(work);
        setItems((current) => current.some((item) => item.id === work.id) ? current.map((item) => item.id === work.id ? work : item) : [work, ...current]);
      })
      .catch((err) => onToast({ title: err.message || "作品详情加载失败", tone: "danger" }));
  }, [initialWorkId, selectedWork?.id]);

  const refreshSelected = (workId: string) => {
    return apiGet<Work>(`/works/${workId}`, { auth: true }).then((work) => {
      setSelectedWork(work);
      setItems((current) => current.map((item) => item.id === work.id ? work : item));
      return work;
    });
  };

  const downloadWork = (work: Work | null) => {
    if (!work?.id) return;
    setBusy(`download:${work.id}`);
    apiGet<DownloadUrl>(`/works/${work.id}/download-url`, { auth: true })
      .then((data) => {
        if (data.url) {
          openExternalUrl(data.url);
          onToast({ title: data.signed ? "已生成临时下载链接" : "已打开下载链接", tone: "success" });
        } else {
          onToast({ title: "该作品暂无下载地址。", tone: "danger" });
        }
      })
      .catch((err) => onToast({ title: err.message || "下载失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  const toggleGallery = (work: Work | null) => {
    if (!work?.id) return;
    setBusy(`gallery:${work.id}`);
    const path = work.galleryVisible ? `/works/${work.id}/unpublish-gallery` : `/works/${work.id}/publish-gallery`;
    apiPost<Work>(path, {}, { auth: true })
      .then((next) => {
        setSelectedWork(next);
        setItems((current) => current.map((item) => item.id === next.id ? next : item));
        onToast({ title: next.galleryVisible ? "作品已发布到广场" : "作品已取消公开", tone: "success" });
      })
      .catch((err) => onToast({ title: err.message || "作品公开状态更新失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  const createShareTicket = (work: Work | null) => {
    if (!work?.id) return;
    setBusy(`share:${work.id}`);
    apiPost<ShareTicket>(`/works/${work.id}/share-ticket`, {}, { auth: true })
      .then((data) => {
        const absoluteUrl = new URL(data.shareUrl, window.location.origin).toString();
        setShareUrl(absoluteUrl);
        navigator.clipboard?.writeText(absoluteUrl).catch(() => undefined);
        onToast({ title: "分享链接已生成并复制", tone: "success" });
        refreshSelected(work.id).catch(() => undefined);
      })
      .catch((err) => onToast({ title: err.message || "分享链接生成失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  const rerunWork = (work: Work | null) => {
    if (!work?.id || !work.toolKey || !work.prompt) {
      onToast({ title: "该作品缺少再次生成所需参数。", tone: "danger" });
      return;
    }
    setBusy(`rerun:${work.id}`);
    apiPost<GenerationSubmitResult>("/generation-tasks", {
      toolKey: work.toolKey,
      modeKey: work.modeKey,
      prompt: work.prompt,
      params: work.params || {},
      inputAssets: work.inputAssets || {}
    }, { auth: true })
      .then((result) => {
        onToast({ title: `已创建再次生成任务：${result.task.id.slice(-6)}`, tone: "success" });
        loadWorks();
      })
      .catch((err) => onToast({ title: err.message || "再次生成失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  const toggleFavoriteWork = (work: Work | null) => {
    if (!work?.id) return;
    setBusy(`favorite:${work.id}`);
    const request = work.favorited
      ? apiDelete<Work>(`/works/${work.id}/favorite`, { auth: true })
      : apiPost<Work>(`/works/${work.id}/favorite`, {}, { auth: true });
    request
      .then((next) => {
        setSelectedWork(next);
        setItems((current) => current.map((item) => item.id === next.id ? next : item));
        onToast({ title: next.favorited ? "已收藏作品" : "已取消收藏", tone: "success" });
        if (favoriteOnly && !next.favorited) loadWorks();
      })
      .catch((err) => onToast({ title: err.message || "收藏操作失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  const deleteWork = (work: Work | null) => {
    if (!work?.id) return;
    setBusy(`delete:${work.id}`);
    apiDelete<boolean>(`/works/${work.id}`, { auth: true })
      .then(() => {
        onToast({ title: "作品已删除", tone: "success" });
        setSelectedWork(null);
        loadWorks();
      })
      .catch((err) => onToast({ title: err.message || "删除失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  const clearFailedWorks = () => {
    setBusy("clear-failed");
    apiPost<{ deleted?: number }>("/works/clear-failed", {}, { auth: true })
      .then((data) => {
        onToast({ title: `已清理 ${data.deleted || 0} 条失败作品`, tone: "success" });
        loadWorks();
      })
      .catch((err) => onToast({ title: err.message || "清理失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  if (loading) return <LoadingBlock title="正在同步作品库" />;
  if (error) {
    return (
      <div className="workspace-section">
        <div className="wide-panel">
          <h2>我的作品</h2>
          <p>{error}</p>
          <Button variant="ghost" onClick={loadWorks}>
            <Icon name="refresh" />
            重新同步
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="works-library workspace-section">
      <aside className="works-filter-panel">
        <div className="draft-head">
          <h3>作品筛选</h3>
          <button onClick={loadWorks} disabled={Boolean(busy)}>刷新</button>
        </div>
        <label>
          <span>状态</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">全部状态</option>
            <option value="success">成功</option>
            <option value="queued">排队中</option>
            <option value="processing">处理中</option>
            <option value="failed">失败</option>
            <option value="canceled">已取消</option>
          </select>
        </label>
        <label>
          <span>工具</span>
          <select value={toolFilter} onChange={(event) => setToolFilter(event.target.value)}>
            <option value="">全部工具</option>
            {tools.map((tool) => (
              <option value={tool.toolKey} key={tool.toolKey}>{tool.name}</option>
            ))}
          </select>
        </label>
        <button className={favoriteOnly ? "active" : ""} onClick={() => setFavoriteOnly((value) => !value)}>
          <Icon name="badge" />
          只看收藏
        </button>
        <Button variant="ghost" onClick={clearFailedWorks} disabled={Boolean(busy)}>
          <Icon name="close" />
          {busy === "clear-failed" ? "清理中" : "清理失败作品"}
        </Button>
        <div className="metric-card compact">
          <span>当前列表</span>
          <strong>{items.length}</strong>
        </div>
      </aside>

      <section className="works-grid-panel">
        {items.length ? (
          <div className="works-grid">
            {items.map((work) => {
              const url = workPreviewUrl(work);
              return (
                <button key={work.id} className={selectedWork?.id === work.id ? "active" : ""} onClick={() => { setSelectedWork(work); setShareUrl(""); }}>
                  {url ? (
                    isVideoUrl(url) || work.contentType === "video" ? <video src={url} preload="metadata" /> : <img src={url} alt={workTitle(work)} loading="lazy" />
                  ) : (
                    <span className="case-cover-placeholder">无预览</span>
                  )}
                  <strong>{workTitle(work)}</strong>
                  <small>{workStatusLabel(work.status)} · {work.toolKey || "创作工具"} · {formatDate(work.createdAt)}</small>
                  <span>{work.galleryVisible ? "已公开" : work.lockedUntilPurchase ? "锁定" : work.isIntermediateOutput ? "中间结果" : "私有"}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyBlock title="暂无作品" body="提交生成或运行 Workflow 后，图片、视频和中间结果都会进入作品库。" />
        )}
      </section>

      <aside className="work-detail-panel">
        {selectedWork ? (
          <>
            <div className="section-title-row">
              <div>
              <span className="eyebrow">作品详情</span>
                <h2>{workTitle(selectedWork)}</h2>
              </div>
              <span className="section-note">{workStatusLabel(selectedWork.status)}</span>
            </div>
            {workPreviewUrl(selectedWork) ? (
              <div className="generation-preview">
                {isVideoUrl(workPreviewUrl(selectedWork)) || selectedWork.contentType === "video" ? (
                  <video src={workPreviewUrl(selectedWork)} controls preload="metadata" />
                ) : (
                  <img src={workPreviewUrl(selectedWork)} alt={workTitle(selectedWork)} loading="lazy" />
                )}
              </div>
            ) : null}
            <div className="mini-meta">
              <span>{selectedWork.toolKey || "创作工具"}</span>
              <span>{selectedWork.modeKey || "默认模式"}</span>
              <span>{Number(selectedWork.likeCount || 0)} 收藏</span>
              <span>{selectedWork.galleryVisible ? "广场公开" : "私有"}</span>
              {selectedWork.isTrialOutput ? <span>试运行</span> : null}
              {selectedWork.isIntermediateOutput ? <span>中间结果</span> : null}
            </div>
            {selectedWork.lockedUntilPurchase ? <p className="danger-text">该试运行作品需要购买对应 Workflow 后才能下载或发布。</p> : null}
            {selectedWork.lockedUntilPurchase ? (
              <div className="locked-work-card">
                <div>
                  <strong>试运行作品待解锁</strong>
                  <p>该作品来自闭源付费 Workflow 试运行。购买对应模板后，可下载、分享并发布到广场。</p>
                </div>
                <Button
                  onClick={() => {
                    if (!selectedWork.sourceCaseContentId) {
                      onToast({ title: "未找到对应 Workflow 模板", tone: "danger" });
                      return;
                    }
                    onOpenWorkflowCase(selectedWork.sourceCaseContentId);
                  }}
                  disabled={!selectedWork.sourceCaseContentId}
                >
                  <Icon name="wallet" />
                  购买解锁
                </Button>
              </div>
            ) : null}
            {selectedWork.failureReason ? <p className="danger-text">{selectedWork.failureReason}</p> : null}
            <div className="work-prompt-panel">
              <span>提示词</span>
              <p>{selectedWork.prompt || "无提示词记录"}</p>
            </div>
            <details className="params-panel">
              <summary>生成参数</summary>
              <ParamSnapshot params={selectedWork.params} />
            </details>
            {shareUrl ? (
              <div className="copy-box">
                <span>{shareUrl}</span>
                <button onClick={() => navigator.clipboard?.writeText(shareUrl)}>复制</button>
              </div>
            ) : null}
            <div className="case-action-buttons">
              {workPreviewUrl(selectedWork) ? (
                <Button variant="ghost" onClick={() => openExternalUrl(workPreviewUrl(selectedWork))}>
                  <Icon name="view" />
                  预览
                </Button>
              ) : null}
              <Button variant="ghost" onClick={() => downloadWork(selectedWork)} disabled={Boolean(busy) || selectedWork.status !== "success" || selectedWork.lockedUntilPurchase}>
                <Icon name="download" />
                下载
              </Button>
              <Button variant="ghost" onClick={() => toggleFavoriteWork(selectedWork)} disabled={Boolean(busy)}>
                <Icon name="badge" />
                {selectedWork.favorited ? "取消收藏" : "收藏作品"}
              </Button>
              <Button variant="ghost" onClick={() => toggleGallery(selectedWork)} disabled={Boolean(busy) || selectedWork.status !== "success" || selectedWork.lockedUntilPurchase}>
                <Icon name="gallery" />
                {selectedWork.galleryVisible ? "取消公开" : "发布广场"}
              </Button>
              <Button variant="ghost" onClick={() => createShareTicket(selectedWork)} disabled={Boolean(busy) || selectedWork.status !== "success" || selectedWork.lockedUntilPurchase}>
                <Icon name="copy" />
                分享链接
              </Button>
              <Button variant="ghost" onClick={() => rerunWork(selectedWork)} disabled={Boolean(busy) || !selectedWork.toolKey || !selectedWork.prompt}>
                <Icon name="play" />
                再次生成
              </Button>
              <Button variant="quiet" onClick={() => deleteWork(selectedWork)} disabled={Boolean(busy)}>
                <Icon name="close" />
                删除
              </Button>
            </div>
          </>
        ) : (
          <EmptyBlock title="请选择作品" body="点击左侧作品卡片查看提示词、参数、下载和公开状态。" />
        )}
      </aside>
    </div>
  );
}

function componentTitle(component: ComponentDefinition) {
  return component.displayName || component.label || component.componentKey;
}

function componentKind(component: ComponentDefinition) {
  const text = `${component.category || ""} ${component.componentKey || ""} ${component.modelKey || ""}`.toLowerCase();
  if (/video|视频|i2v|t2v/.test(text)) return "video";
  if (/audio|voice|music|音频|音乐/.test(text)) return "audio";
  if (/image|photo|picture|图像|图片|生图/.test(text)) return "image";
  return "utility";
}

function componentCategoryLabel(component: ComponentDefinition) {
  const kind = componentKind(component);
  if (kind === "video") return "视频";
  if (kind === "image") return "图像";
  if (kind === "audio") return "音频";
  return component.category || "通用";
}

function schemaOptions(schema: Record<string, unknown> | undefined, key: string) {
  const source = schema as any;
  const field = source?.properties?.[key] || source?.[key];
  const options = Array.isArray(field?.enum) ? field.enum : Array.isArray(field?.oneOf) ? field.oneOf.map((item: any) => item?.const || item?.value) : [];
  return options.map((item: unknown) => String(item || "").trim()).filter(Boolean);
}

function unique(values: string[]) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function ratioOptionsFor(component: ComponentDefinition) {
  const fromMap = Object.keys(component.ratioResolutionMap || {});
  const fromSchema = schemaOptions(component.inputSchema, "ratio");
  if (fromMap.length) return fromMap;
  if (fromSchema.length) return fromSchema;
  return componentKind(component) === "video" ? ["16:9", "9:16", "1:1", "4:3", "3:4"] : ["1:1", "16:9", "9:16", "4:3", "3:4"];
}

function defaultRatioFor(component: ComponentDefinition) {
  const ratios = ratioOptionsFor(component);
  const preferred = componentKind(component) === "video" ? "16:9" : "1:1";
  return ratios.includes(preferred) ? preferred : ratios[0] || preferred;
}

function resolutionOptionsFor(component: ComponentDefinition, ratio = defaultRatioFor(component)) {
  const byRatio = component.ratioResolutionMap?.[ratio] || [];
  const fromMap = Object.values(component.ratioResolutionMap || {}).flat();
  const fromSchema = schemaOptions(component.inputSchema, "resolution").concat(schemaOptions(component.inputSchema, "size"));
  return unique(byRatio.length ? byRatio : fromMap.length ? fromMap : fromSchema.length ? fromSchema : componentKind(component) === "image" ? ["1024x1024"] : []);
}

function qualityOptionsFor(component: ComponentDefinition) {
  const fromSchema = schemaOptions(component.inputSchema, "quality").concat(schemaOptions(component.inputSchema, "resolution"));
  const options = component.videoQualityOptions?.length ? component.videoQualityOptions : fromSchema;
  return unique(options.length ? options : componentKind(component) === "video" ? ["720P"] : []);
}

function resolveToolForComponent(component: ComponentDefinition, tools: Tool[]) {
  const kind = componentKind(component);
  const modelKey = String(component.modelKey || "").toLowerCase();
  return (
    tools.find((tool) => String(tool.toolKey || "").toLowerCase().includes(modelKey) && modelKey) ||
    tools.find((tool) => (tool.outputTypes || []).some((type) => String(type).toLowerCase() === kind)) ||
    tools.find((tool) => String(tool.category || "").toLowerCase().includes(kind)) ||
    tools.find((tool) => String(tool.toolKey || "").toLowerCase().includes(kind)) ||
    tools[0]
  );
}

function configuredModelKeysForTool(tool?: Tool | null) {
  if (!tool) return [];
  const modes = enabledToolModes(tool);
  const fromTool = Array.isArray(tool.options?.models) ? tool.options?.models : [];
  const fromModes = modes.flatMap((mode) => {
    const options = toolModeOptions(tool, mode);
    return ([] as unknown[]).concat(mode.allowedModels || [], options.models || [], options.defaultModelKey || mode.defaultModelKey || []);
  });
  return unique(fromTool.concat(fromModes).map((item) => String(item || "").trim()));
}

function modelMatchesComponent(model: ModelCapability, component: ComponentDefinition) {
  const kind = componentKind(component);
  const modelText = `${model.modelKey || ""} ${model.name || ""} ${model.modality || ""} ${model.nodeType || ""} ${model.capabilityKey || ""}`.toLowerCase();
  const outputs = (model.outputModalities || []).map((item) => String(item).toLowerCase());
  if (kind === "image") return outputs.includes("image") || model.modality === "image" || /image|photo|picture|text_to_image/.test(modelText);
  if (kind === "video") return outputs.includes("video") || model.modality === "video" || /video|text_to_video|image_to_video/.test(modelText);
  if (kind === "audio") return outputs.includes("audio") || model.modality === "audio" || /audio|voice|music/.test(modelText);
  return true;
}

function modelOptionsForNode(node: WorkflowEditorNode, tool: Tool | undefined, models: ModelCapability[]) {
  const enabledModels = models.filter((model) => !model.status || ["online", "available", "enabled", "active"].includes(String(model.status).toLowerCase()));
  const configuredKeys = configuredModelKeysForTool(tool);
  if (configuredKeys.length) {
    const configured = enabledModels.filter((model) => configuredKeys.includes(model.modelKey));
    if (configured.length) return configured;
  }
  const matched = enabledModels.filter((model) => modelMatchesComponent(model, node.component));
  return matched.length ? matched : enabledModels;
}

function editorNodeKey() {
  return `editor_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function createEditorNode(component: ComponentDefinition, overrides: Partial<WorkflowEditorNode> = {}): WorkflowEditorNode {
  const kind = componentKind(component);
  return {
    nodeKey: overrides.nodeKey || editorNodeKey(),
    component,
    upstreamNodeKeys: Array.isArray(overrides.upstreamNodeKeys) ? overrides.upstreamNodeKeys : [],
    promptTemplate: overrides.promptTemplate || "{{prompt}}",
    toolKey: overrides.toolKey || "",
    modelKey: overrides.modelKey || component.modelKey || "",
    costPoints: overrides.costPoints,
    exposePrompt: overrides.exposePrompt ?? true,
    exposeRatio: overrides.exposeRatio ?? true,
    exposeResolution: overrides.exposeResolution ?? kind === "image",
    exposeQuality: overrides.exposeQuality ?? kind === "video",
    exposeUpload: overrides.exposeUpload ?? false
  };
}

function normalizeWorkflowNodeLinks(nodes: WorkflowEditorNode[]) {
  const previousKeys = new Set<string>();
  return nodes.map((node) => {
    const upstreamNodeKeys = unique(node.upstreamNodeKeys || []).filter((key) => previousKeys.has(key));
    previousKeys.add(node.nodeKey);
    return { ...node, upstreamNodeKeys };
  });
}

function exposedFieldsForNode(node: WorkflowEditorNode) {
  const fields = [];
  if (node.exposePrompt) fields.push("prompt");
  if (node.exposeRatio) fields.push("ratio");
  if (node.exposeResolution) fields.push("resolution");
  if (node.exposeQuality) fields.push("quality");
  if (node.exposeUpload) fields.push("inputAssetIds");
  return fields;
}

function buildWorkflowGraph(selectedNodes: WorkflowEditorNode[], tools: Tool[]): WorkflowGraph {
  const nodeIdByKey = new Map(selectedNodes.map((editorNode, index) => [editorNode.nodeKey, `node_${index + 1}`]));
  const nodes = selectedNodes.map((editorNode, index) => {
    const component = editorNode.component;
    const tool = editorNode.toolKey
      ? tools.find((item) => item.toolKey === editorNode.toolKey) || resolveToolForComponent(component, tools)
      : resolveToolForComponent(component, tools);
    const kind = componentKind(component);
    const ratio = defaultRatioFor(component);
    const resolution = resolutionOptionsFor(component, ratio)[0] || "";
    const quality = qualityOptionsFor(component)[0] || "";
    const params: Record<string, unknown> = {
      modelKey: editorNode.modelKey || component.modelKey || "",
      ratio
    };
    if (kind === "video") params.quality = quality || "720P";
    if (kind === "image") params.resolution = resolution || "1024x1024";

    return {
      id: `node_${index + 1}`,
      type: component.componentKey,
      label: componentTitle(component),
      componentKey: component.componentKey,
      toolKey: tool?.toolKey || "",
      modelKey: editorNode.modelKey || component.modelKey || "",
      modeKey: kind === "video" ? "text_to_video" : kind === "image" ? "text_to_image" : "utility",
      x: 120 + index * 260,
      y: 180,
      config: {
        componentKey: component.componentKey,
        toolKey: tool?.toolKey || "",
        modelKey: editorNode.modelKey || component.modelKey || "",
        modeKey: kind === "video" ? "text_to_video" : kind === "image" ? "text_to_image" : "utility",
        promptTemplate: editorNode.promptTemplate || "{{prompt}}",
        params,
        costPoints: Number(editorNode.costPoints ?? tool?.cost ?? 5),
        exposedFields: exposedFieldsForNode(editorNode)
      }
    };
  });
  const edges = selectedNodes.flatMap((editorNode, index) => {
    const target = nodeIdByKey.get(editorNode.nodeKey);
    if (!target) return [];
    const allowedPreviousKeys = new Set(selectedNodes.slice(0, index).map((node) => node.nodeKey));
    const upstreamKeys = unique(editorNode.upstreamNodeKeys || []).filter((key) => allowedPreviousKeys.has(key));
    return upstreamKeys.map((sourceKey) => ({
      id: `edge_${nodeIdByKey.get(sourceKey)}_${target}`,
      source: nodeIdByKey.get(sourceKey),
      target,
      sourceHandle: "output",
      targetHandle: "input"
    }));
  });
  return {
    schemaVersion: "seeFactory.workflow.v1",
    nodes,
    edges
  };
}

function buildWorkflowRunForm(selectedNodes: WorkflowEditorNode[]) {
  const promptExposed = selectedNodes.some((node) => node.exposePrompt);
  const ratioNodes = selectedNodes.filter((node) => node.exposeRatio);
  const resolutionNodes = selectedNodes.filter((node) => node.exposeResolution);
  const qualityNodes = selectedNodes.filter((node) => node.exposeQuality);
  const uploadNodes = selectedNodes.filter((node) => node.exposeUpload);
  const ratios = unique(ratioNodes.flatMap((node) => ratioOptionsFor(node.component)));
  const resolutions = unique(resolutionNodes.flatMap((node) => resolutionOptionsFor(node.component)));
  const qualities = unique(qualityNodes.flatMap((node) => qualityOptionsFor(node.component)));
  const fields: Array<Record<string, unknown>> = [];
  if (promptExposed) {
    fields.push({
      key: "prompt",
      label: "提示词",
      type: "textarea",
      required: true,
      placeholder: "描述你希望这个 Workflow 生成的主体、风格、场景和细节"
    });
  }
  if (ratios.length) fields.push({ key: "ratio", label: "比例", type: "select", options: ratios, defaultValue: ratios[0], required: false });
  if (resolutions.length) {
    fields.push({ key: "resolution", label: "图像分辨率", type: "select", options: resolutions, defaultValue: resolutions[0], required: false });
  }
  if (qualities.length) fields.push({ key: "quality", label: "视频精度", type: "select", options: qualities, defaultValue: qualities[0], required: false });
  if (uploadNodes.length) {
    fields.push({
      key: "inputAssetIds",
      label: "输入素材",
      type: "upload",
      assetType: componentKind(uploadNodes[0].component) === "video" ? "video" : "image",
      maxCount: Math.min(6, Math.max(1, uploadNodes.length)),
      required: true,
      help: "素材会先上传到 OSS，再作为 Workflow 输入资产参与生成。"
    });
  }
  return {
    schemaVersion: "seeFactory.runForm.v1",
    fields,
    nodes: selectedNodes.map((node, index) => ({
      nodeId: `node_${index + 1}`,
      componentKey: node.component.componentKey,
      label: componentTitle(node.component),
      category: componentKind(node.component),
      exposedFields: exposedFieldsForNode(node)
    }))
  };
}

function validateWorkflowGraph(graph: WorkflowGraph, mode: "open_free" | "closed_paid", pricePoints: number, policy?: WorkflowPublishPolicy): WorkflowValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const executableNodes = graph.nodes.filter((node) => String(node.toolKey || (node.config as any)?.toolKey || "").trim());
  const nodeIds = new Set(graph.nodes.map((node) => String(node.id || "").trim()).filter(Boolean));
  if (!graph.nodes.length) errors.push("请先从左侧添加至少一个组件。");
  if (!executableNodes.length) errors.push("Workflow 至少需要一个可运行的生成节点。");
  graph.edges.forEach((edge, index) => {
    const source = String(edge.source || edge.from || "").trim();
    const target = String(edge.target || edge.to || "").trim();
    if (!source || !target) {
      errors.push(`第 ${index + 1} 条连线缺少 source 或 target。`);
    } else {
      if (!nodeIds.has(source)) errors.push(`第 ${index + 1} 条连线的 source 不存在：${source}。`);
      if (!nodeIds.has(target)) errors.push(`第 ${index + 1} 条连线的 target 不存在：${target}。`);
      if (source === target) errors.push(`第 ${index + 1} 条连线不能连接节点自身。`);
    }
  });
  if (graph.nodes.length > 1 && graph.edges.length === 0) warnings.push("当前 Workflow 没有连线，将按多个独立节点运行；如需顺序或合流，请在节点设置中选择上游节点。");
  if (policy?.maxGraphNodes && graph.nodes.length > policy.maxGraphNodes) errors.push(`当前 Workflow 最多允许 ${policy.maxGraphNodes} 个节点。`);
  if (policy?.maxGraphModelNodes && executableNodes.length > policy.maxGraphModelNodes) errors.push(`当前 Workflow 最多允许 ${policy.maxGraphModelNodes} 个 AI 模型节点。`);
  const missingModels = graph.nodes.filter((node) => !String(node.modelKey || (node.config as any)?.modelKey || "").trim());
  if (missingModels.length) warnings.push(`${missingModels.length} 个节点未绑定模型，将使用对应工具的默认模型。`);
  if (mode === "closed_paid") {
    const minPrice = Number(policy?.priceMinPoints);
    const maxPrice = Number(policy?.priceMaxPoints);
    if (!Number.isFinite(pricePoints) || pricePoints < 1) {
      errors.push("闭源付费 Workflow 的模板售价必须大于 0 点。");
    } else if (Number.isFinite(minPrice) && pricePoints < minPrice) {
      errors.push(`闭源付费 Workflow 售价不能低于 ${minPrice} 点。`);
    } else if (Number.isFinite(maxPrice) && pricePoints > maxPrice) {
      errors.push(`闭源付费 Workflow 售价不能高于 ${maxPrice} 点。`);
    }
  }
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    estimatedPoints: graph.nodes.reduce((sum, node) => sum + Number((node.config as any)?.costPoints || 0), 0),
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length
  };
}

function parseTags(value: string) {
  return unique(value.split(/[,，\s]+/).slice(0, 12));
}

function nodesFromWorkflowGraph(graph: WorkflowGraph | undefined, components: ComponentDefinition[], tools: Tool[] = []) {
  const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
  const restored = nodes.map((node: any, index) => {
    const config = node?.config && typeof node.config === "object" ? node.config : {};
    const componentKey = String(node?.componentKey || node?.type || config.componentKey || `imported.node.${index + 1}`);
    const found = components.find((component) => component.componentKey === componentKey);
    const component = found || {
      id: componentKey,
      componentKey,
      displayName: String(node?.label || node?.name || config.label || componentKey),
      label: String(node?.label || node?.name || config.label || componentKey),
      category: String(node?.category || config.category || "imported"),
      description: "从导入文件或历史草稿恢复的节点。",
      modelKey: String(node?.modelKey || config.modelKey || ""),
      ratioResolutionMap: {},
      videoQualityOptions: []
    } satisfies ComponentDefinition;
    const exposed = Array.isArray(config.exposedFields) ? config.exposedFields.map((item: unknown) => String(item)) : [];
    const toolKey = String(node?.toolKey || config.toolKey || "");
    const tool = toolKey ? tools.find((item) => item.toolKey === toolKey) : undefined;
    return createEditorNode(component, {
      nodeKey: `imported_${index}_${componentKey}`,
      promptTemplate: String(config.promptTemplate || node?.promptTemplate || "{{prompt}}"),
      toolKey,
      modelKey: String(node?.modelKey || config.modelKey || component.modelKey || ""),
      costPoints: Number(config.costPoints ?? tool?.cost ?? 5),
      exposePrompt: exposed.length ? exposed.includes("prompt") : true,
      exposeRatio: exposed.length ? exposed.includes("ratio") : true,
      exposeResolution: exposed.includes("resolution"),
      exposeQuality: exposed.includes("quality"),
      exposeUpload: exposed.includes("inputAssetIds") || exposed.includes("inputAssets")
    });
  });
  const nodeIdToEditorKey = new Map(nodes.map((node: any, index) => [
    String(node?.id || node?.nodeId || `node_${index + 1}`).trim(),
    restored[index]?.nodeKey
  ]));
  const incoming = new Map<string, string[]>();
  const edges = Array.isArray(graph?.edges) ? graph?.edges || [] : [];
  edges.forEach((edge: any) => {
    const sourceKey = nodeIdToEditorKey.get(String(edge?.source || edge?.from || edge?.sourceNodeId || "").trim());
    const targetKey = nodeIdToEditorKey.get(String(edge?.target || edge?.to || edge?.targetNodeId || "").trim());
    if (!sourceKey || !targetKey) return;
    incoming.set(targetKey, [...(incoming.get(targetKey) || []), sourceKey]);
  });
  return normalizeWorkflowNodeLinks(restored.map((node, index) => {
    const upstreamNodeKeys = incoming.get(node.nodeKey);
    if (upstreamNodeKeys?.length) return { ...node, upstreamNodeKeys };
    if (!edges.length && index > 0) return { ...node, upstreamNodeKeys: [restored[index - 1].nodeKey] };
    return node;
  }));
}

function downloadJsonFile(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function safeFileStem(value: string) {
  return value.trim().replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "-").slice(0, 48) || "workflow";
}

function WorkflowConsole({
  components,
  tools,
  models,
  workflowPolicy,
  initialWorkflowId = "",
  initialRouteMode = "editor",
  onToast
}: {
  components: ComponentDefinition[];
  tools: Tool[];
  models: ModelCapability[];
  workflowPolicy?: WorkflowPublishPolicy;
  initialWorkflowId?: string;
  initialRouteMode?: "editor" | "run";
  onToast: (toast: Toast) => void;
}) {
  const [mode, setMode] = useState<"open_free" | "closed_paid">("open_free");
  const [selectedNodes, setSelectedNodes] = useState<WorkflowEditorNode[]>([]);
  const [activeNodeKey, setActiveNodeKey] = useState("");
  const [dragComponentKey, setDragComponentKey] = useState("");
  const [dragNodeKey, setDragNodeKey] = useState("");
  const [canvasDropActive, setCanvasDropActive] = useState(false);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [draft, setDraft] = useState<WorkflowDraft | null>(null);
  const [title, setTitle] = useState("我的 seeFactory Workflow");
  const [summary, setSummary] = useState("把常用多步骤创作链路沉淀为可复用 Workflow。");
  const [category, setCategory] = useState("视觉创作");
  const [tags, setTags] = useState("workflow, AI创作");
  const [pricePoints, setPricePoints] = useState(35);
  const [trialEnabled, setTrialEnabled] = useState(true);
  const [trialLimitPerUser, setTrialLimitPerUser] = useState(1);
  const [testPrompt, setTestPrompt] = useState("");
  const [busy, setBusy] = useState("");
  const [validation, setValidation] = useState<WorkflowValidation | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowDraft[]>([]);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [publishedCases, setPublishedCases] = useState<CaseContent[]>([]);
  const [publishedLoading, setPublishedLoading] = useState(false);
  const [publishedBusyId, setPublishedBusyId] = useState("");
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const loadWorkflows = () => {
    setWorkflowLoading(true);
    apiGet<WorkflowDraft[]>("/workflows", { auth: true })
      .then((items) => setWorkflows(items || []))
      .catch((err) => onToast({ title: err instanceof Error ? err.message : "Workflow 草稿列表加载失败", tone: "danger" }))
      .finally(() => setWorkflowLoading(false));
  };

  const loadPublishedCases = () => {
    setPublishedLoading(true);
    return apiGet<PageData<CaseContent>>("/workflow-cases/mine?pageSize=12", { auth: true })
      .then((data) => setPublishedCases(data.list || []))
      .catch((err) => onToast({ title: err instanceof Error ? err.message : "我的发布列表加载失败", tone: "danger" }))
      .finally(() => setPublishedLoading(false));
  };

  useEffect(() => {
    setSelectedNodes((current) => (current.length ? current : components.slice(0, Math.min(3, components.length)).map((component) => createEditorNode(component))));
  }, [components]);

  useEffect(() => {
    loadWorkflows();
    loadPublishedCases();
  }, []);

  const graph = buildWorkflowGraph(selectedNodes, tools);
  const currentValidation = validation || validateWorkflowGraph(graph, mode, pricePoints, workflowPolicy);
  const activeNode = selectedNodes.find((node) => node.nodeKey === activeNodeKey) || selectedNodes[0] || null;
  const activeNodeIndex = activeNode ? selectedNodes.findIndex((node) => node.nodeKey === activeNode.nodeKey) : -1;
  const upstreamCandidates = activeNodeIndex > 0 ? selectedNodes.slice(0, activeNodeIndex) : [];
  const activeTool = activeNode
    ? activeNode.toolKey
      ? tools.find((item) => item.toolKey === activeNode.toolKey) || resolveToolForComponent(activeNode.component, tools)
      : resolveToolForComponent(activeNode.component, tools)
    : undefined;
  const activeModelOptions = activeNode ? modelOptionsForNode(activeNode, activeTool, models) : [];
  const visualEdges = selectedNodes.flatMap((targetNode, targetIndex) => {
    const sourceKeys = unique(targetNode.upstreamNodeKeys || []);
    return sourceKeys
      .map((sourceKey) => {
        const sourceIndex = selectedNodes.findIndex((node) => node.nodeKey === sourceKey);
        if (sourceIndex < 0 || sourceIndex >= targetIndex) return null;
        const count = Math.max(1, selectedNodes.length);
        return {
          id: `${sourceKey}_${targetNode.nodeKey}`,
          sourceIndex,
          targetIndex,
          sourceX: ((sourceIndex + 0.72) / count) * 100,
          targetX: ((targetIndex + 0.28) / count) * 100,
          rowOffset: Math.min(16, Math.abs(targetIndex - sourceIndex) * 3)
        };
      })
      .filter(Boolean) as Array<{ id: string; sourceIndex: number; targetIndex: number; sourceX: number; targetX: number; rowOffset: number }>;
  });
  const priceMinPoints = Math.max(1, Number(workflowPolicy?.priceMinPoints || 1));
  const priceMaxPoints = Number.isFinite(Number(workflowPolicy?.priceMaxPoints)) ? Math.max(priceMinPoints, Number(workflowPolicy?.priceMaxPoints)) : undefined;
  const trialLimitMaxPerUser = Math.max(0, Number(workflowPolicy?.trialLimitMaxPerUser ?? 0));
  const workflowNodeLimit = Number.isFinite(Number(workflowPolicy?.maxGraphNodes)) ? Math.max(1, Number(workflowPolicy?.maxGraphNodes)) : 0;
  const commissionRatePercent = Number.isFinite(Number(workflowPolicy?.commissionRate)) ? Math.round(Number(workflowPolicy?.commissionRate) * 100) : undefined;

  const insertComponent = (component: ComponentDefinition, index?: number) => {
    setSelectedNodes((current) => {
      if (workflowNodeLimit && current.length >= workflowNodeLimit) {
        onToast({ title: `当前发布策略最多允许 ${workflowNodeLimit} 个节点。`, tone: "info" });
        return current;
      }
      const next = [...current];
      const target = typeof index === "number" ? Math.max(0, Math.min(index, next.length)) : next.length;
      const upstreamNodeKeys = target > 0 && next[target - 1] ? [next[target - 1].nodeKey] : [];
      const nextNode = createEditorNode(component, { upstreamNodeKeys });
      setActiveNodeKey(nextNode.nodeKey);
      next.splice(target, 0, nextNode);
      return normalizeWorkflowNodeLinks(next);
    });
    setValidation(null);
  };

  const addComponent = (component: ComponentDefinition) => {
    insertComponent(component);
  };

  const removeNode = (nodeKey: string) => {
    setSelectedNodes((current) => normalizeWorkflowNodeLinks(current
      .filter((node) => node.nodeKey !== nodeKey)
      .map((node) => ({ ...node, upstreamNodeKeys: (node.upstreamNodeKeys || []).filter((key) => key !== nodeKey) }))));
    if (activeNodeKey === nodeKey) setActiveNodeKey("");
    setValidation(null);
  };

  const updateNode = (nodeKey: string, patch: Partial<WorkflowEditorNode>) => {
    setSelectedNodes((current) => current.map((node) => node.nodeKey === nodeKey ? { ...node, ...patch } : node));
    setValidation(null);
  };

  const duplicateNode = (nodeKey: string) => {
    setSelectedNodes((current) => {
      if (workflowNodeLimit && current.length >= workflowNodeLimit) {
        onToast({ title: `当前发布策略最多允许 ${workflowNodeLimit} 个节点。`, tone: "info" });
        return current;
      }
      const index = current.findIndex((node) => node.nodeKey === nodeKey);
      if (index < 0) return current;
      const source = current[index];
      const copy = createEditorNode(source.component, {
        upstreamNodeKeys: [source.nodeKey],
        promptTemplate: source.promptTemplate,
        toolKey: source.toolKey,
        modelKey: source.modelKey,
        costPoints: source.costPoints,
        exposePrompt: source.exposePrompt,
        exposeRatio: source.exposeRatio,
        exposeResolution: source.exposeResolution,
        exposeQuality: source.exposeQuality,
        exposeUpload: source.exposeUpload
      });
      const next = [...current];
      next.splice(index + 1, 0, copy);
      setActiveNodeKey(copy.nodeKey);
      return normalizeWorkflowNodeLinks(next);
    });
    setValidation(null);
  };

  const moveNode = (nodeKey: string, direction: -1 | 1) => {
    setSelectedNodes((current) => {
      const index = current.findIndex((node) => node.nodeKey === nodeKey);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return normalizeWorkflowNodeLinks(next);
    });
    setValidation(null);
  };

  const dropNodeOn = (targetNodeKey: string) => {
    if (!dragNodeKey || dragNodeKey === targetNodeKey) return;
    setSelectedNodes((current) => {
      const from = current.findIndex((node) => node.nodeKey === dragNodeKey);
      const to = current.findIndex((node) => node.nodeKey === targetNodeKey);
      if (from < 0 || to < 0) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return normalizeWorkflowNodeLinks(next);
    });
    setDragNodeKey("");
    setValidation(null);
  };

  const toggleUpstreamNode = (sourceNodeKey: string) => {
    if (!activeNode) return;
    const currentKeys = activeNode.upstreamNodeKeys || [];
    const upstreamNodeKeys = currentKeys.includes(sourceNodeKey)
      ? currentKeys.filter((key) => key !== sourceNodeKey)
      : [...currentKeys, sourceNodeKey];
    updateNode(activeNode.nodeKey, { upstreamNodeKeys });
  };

  const autoLinkLinear = () => {
    setSelectedNodes((current) => current.map((node, index) => ({
      ...node,
      upstreamNodeKeys: index > 0 ? [current[index - 1].nodeKey] : []
    })));
    setValidation(null);
    onToast({ title: "已按当前顺序整理为线性链路", tone: "success" });
  };

  const clearWorkflowLinks = () => {
    setSelectedNodes((current) => current.map((node) => ({ ...node, upstreamNodeKeys: [] })));
    setValidation(null);
    onToast({ title: "已清空节点连接，可重新选择上游输入", tone: "info" });
  };

  const handleCanvasDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!dragComponentKey) return;
    event.preventDefault();
    setCanvasDropActive(true);
  };

  const handleCanvasDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (!dragComponentKey) return;
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setCanvasDropActive(false);
  };

  const handleCanvasDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!dragComponentKey) return;
    event.preventDefault();
    const component = components.find((item) => item.componentKey === dragComponentKey);
    setCanvasDropActive(false);
    setDragComponentKey("");
    if (!component) return;
    insertComponent(component);
  };

  const persistDraft = async () => {
    const payload = {
      title,
      description: summary,
      coverUrl: "",
      graph,
      editorMode: "graph"
    };
    const saved = draft?.id
      ? await apiPut<WorkflowDraft>(`/workflows/${draft.id}/draft`, payload, { auth: true })
      : await apiPost<WorkflowDraft>("/workflows", payload, { auth: true });
    setDraft(saved);
    setWorkflows((items) => [saved, ...items.filter((item) => item.id !== saved.id)]);
    return saved;
  };

  const validateServerDraft = async (workflowId: string) => {
    return apiPost<WorkflowValidation>(`/workflows/${workflowId}/validate`, { graph }, { auth: true });
  };

  const estimateServerDraft = async (workflowId: string) => {
    return apiPost<WorkflowValidation>(`/workflows/${workflowId}/estimate`, { graph }, { auth: true });
  };

  const validateAndEstimateServerDraft = async (workflowId: string) => {
    const serverValidation = await validateServerDraft(workflowId);
    if (!serverValidation.valid) return serverValidation;
    return estimateServerDraft(workflowId);
  };

  const saveDraft = async () => {
    setBusy("save");
    try {
      const nextValidation = validateWorkflowGraph(graph, mode, pricePoints, workflowPolicy);
      setValidation(nextValidation);
      if (!nextValidation.valid) {
        onToast({ title: nextValidation.errors[0] || "Workflow 校验未通过", tone: "danger" });
        return;
      }
      const saved = await persistDraft();
      const serverValidation = await validateAndEstimateServerDraft(saved.id);
      setValidation(serverValidation);
      onToast({
        title: serverValidation.valid ? `草稿已保存，预估 ${serverValidation.estimatedPoints} 点：${saved.title}` : serverValidation.errors[0] || "草稿已保存，但运行校验未通过",
        tone: serverValidation.valid ? "success" : "danger"
      });
    } catch (err) {
      onToast({ title: err instanceof Error ? err.message : "草稿保存失败", tone: "danger" });
    } finally {
      setBusy("");
    }
  };

  const validateDraft = async () => {
    setBusy("validate");
    try {
      const nextValidation = validateWorkflowGraph(graph, mode, pricePoints, workflowPolicy);
      setValidation(nextValidation);
      if (!nextValidation.valid) {
        onToast({ title: nextValidation.errors[0] || "Workflow 校验未通过", tone: "danger" });
        return;
      }
      const saved = await persistDraft();
      const serverValidation = await validateAndEstimateServerDraft(saved.id);
      setValidation(serverValidation);
      onToast({
        title: serverValidation.valid ? `Workflow 已通过运行校验，预计运行 ${serverValidation.estimatedPoints} 点。` : serverValidation.errors[0] || "运行校验未通过",
        tone: serverValidation.valid ? "success" : "danger"
      });
    } catch (err) {
      onToast({ title: err instanceof Error ? err.message : "Workflow 校验失败", tone: "danger" });
    } finally {
      setBusy("");
    }
  };

  const publishWorkflow = async () => {
    setBusy("publish");
    try {
      const nextValidation = validateWorkflowGraph(graph, mode, pricePoints, workflowPolicy);
      setValidation(nextValidation);
      if (!nextValidation.valid) throw new Error(nextValidation.errors[0] || "Workflow 校验未通过");
      if (mode === "closed_paid" && trialLimitPerUser > trialLimitMaxPerUser) {
        throw new Error(`购买前试运行次数不能超过 ${trialLimitMaxPerUser} 次。`);
      }
      const saved = await persistDraft();
      const serverValidation = await validateAndEstimateServerDraft(saved.id);
      setValidation(serverValidation);
      if (!serverValidation.valid) throw new Error(serverValidation.errors[0] || "运行校验未通过");
      const result = await apiPost<{ workflow?: WorkflowDraft; case?: CaseContent }>(
        `/workflows/${saved.id}/publish-case`,
        {
          title,
          summary,
          coverUrl: "",
          tags: parseTags(tags),
          category,
          licenseMode: mode,
          pricePoints: mode === "closed_paid" ? pricePoints : 0,
          trialEnabled: mode === "closed_paid" && trialEnabled,
          trialLimitPerUser: mode === "closed_paid" ? trialLimitPerUser : 0,
          runForm: buildWorkflowRunForm(selectedNodes),
          publishAgreementAccepted: true
        },
        { auth: true }
      );
      setDraft(result.workflow || saved);
      loadWorkflows();
      loadPublishedCases();
      onToast({ title: result.case?.title ? `已发布到案例广场：${result.case.title}` : "Workflow 已发布到案例广场", tone: "success" });
    } catch (err) {
      onToast({ title: err instanceof Error ? err.message : "Workflow 发布失败", tone: "danger" });
    } finally {
      setBusy("");
    }
  };

  const openWorkflow = (workflow: WorkflowDraft, announce = true) => {
    setDraft(workflow);
    setTitle(workflow.title || "我的 seeFactory Workflow");
    setSummary(workflow.description || "");
    const restoredNodes = nodesFromWorkflowGraph(workflow.graph, components, tools);
    setSelectedNodes(restoredNodes);
    setActiveNodeKey(restoredNodes[0]?.nodeKey || "");
    setValidation(null);
    if (announce) onToast({ title: `已打开草稿：${workflow.title}`, tone: "info" });
  };

  useEffect(() => {
    if (!initialWorkflowId || draft?.id === initialWorkflowId) return;
    const existing = workflows.find((workflow) => workflow.id === initialWorkflowId);
    if (existing) {
      openWorkflow(existing, false);
      return;
    }
    setWorkflowLoading(true);
    apiGet<WorkflowDraft>(`/workflows/${initialWorkflowId}`, { auth: true })
      .then((workflow) => {
        openWorkflow(workflow, false);
        setWorkflows((items) => [workflow, ...items.filter((item) => item.id !== workflow.id)]);
        if (initialRouteMode === "run") {
          onToast({ title: "已打开 Workflow 运行入口，请填写试运行提示词后提交运行。", tone: "info" });
        }
      })
      .catch((err) => onToast({ title: err instanceof Error ? err.message : "Workflow 草稿详情加载失败", tone: "danger" }))
      .finally(() => setWorkflowLoading(false));
  }, [initialWorkflowId, initialRouteMode, draft?.id, workflows, components, tools]);

  const stopPublishedCase = async (caseContent: CaseContent) => {
    setPublishedBusyId(caseContent.id);
    try {
      await apiPost<CaseContent>(`/workflow-cases/${caseContent.id}/delete`, {}, { auth: true });
      await loadPublishedCases();
      onToast({ title: "已停止公开展示和新增购买，已购用户权益仍保留。", tone: "success" });
    } catch (err) {
      onToast({ title: err instanceof Error ? err.message : "停止公开失败", tone: "danger" });
    } finally {
      setPublishedBusyId("");
    }
  };

  const hidePublishedCase = async (caseContent: CaseContent) => {
    setPublishedBusyId(`hide:${caseContent.id}`);
    try {
      await apiPost<CaseContent>(`/workflow-cases/${caseContent.id}/hide`, {}, { auth: true });
      await loadPublishedCases();
      onToast({ title: "已隐藏展示，公开广场不再展示该 Workflow，已购用户权益仍保留。", tone: "success" });
    } catch (err) {
      onToast({ title: err instanceof Error ? err.message : "隐藏展示失败", tone: "danger" });
    } finally {
      setPublishedBusyId("");
    }
  };

  const exportWorkflow = async () => {
    setBusy("export");
    try {
      const target = draft || (await persistDraft());
      const manifest = await apiGet<Record<string, unknown>>(`/workflows/${target.id}/export`, { auth: true });
      downloadJsonFile(`${safeFileStem(target.title)}.seeflow`, manifest);
      onToast({ title: "流程文件已导出", tone: "success" });
    } catch (err) {
      onToast({ title: err instanceof Error ? err.message : "Workflow 导出失败", tone: "danger" });
    } finally {
      setBusy("");
    }
  };

  const importWorkflowFile = async (file: File | null) => {
    if (!file) return;
    setBusy("import");
    try {
      const text = await file.text();
      const manifest = JSON.parse(text);
      const imported = await apiPost<WorkflowDraft>("/workflows/import", { manifest }, { auth: true });
      setDraft(imported);
      setTitle(imported.title || "导入的 Workflow");
      setSummary(imported.description || "");
      const restoredNodes = nodesFromWorkflowGraph(imported.graph, components, tools);
      setSelectedNodes(restoredNodes);
      setActiveNodeKey(restoredNodes[0]?.nodeKey || "");
      setValidation(null);
      loadWorkflows();
      onToast({ title: `已导入为私有草稿：${imported.title}`, tone: "success" });
    } catch (err) {
      onToast({ title: err instanceof Error ? err.message : "请选择有效的流程文件", tone: "danger" });
    } finally {
      setBusy("");
      if (importInputRef.current) importInputRef.current.value = "";
    }
  };

  const runWorkflowTest = async () => {
    const prompt = testPrompt.trim();
    if (!prompt) {
      onToast({ title: "请先填写试运行提示词。", tone: "danger" });
      return;
    }
    setBusy("run");
    try {
      const nextValidation = validateWorkflowGraph(graph, mode, pricePoints, workflowPolicy);
      setValidation(nextValidation);
      if (!nextValidation.valid) throw new Error(nextValidation.errors[0] || "Workflow 校验未通过");
      const saved = await persistDraft();
      const serverValidation = await validateAndEstimateServerDraft(saved.id);
      setValidation(serverValidation);
      if (!serverValidation.valid) throw new Error(serverValidation.errors[0] || "运行校验未通过");
      const result = await apiPost<{ run?: WorkflowRun; nodes?: Array<Record<string, unknown>> }>(
        `/workflows/${saved.id}/run`,
        {
          input: { prompt },
          params: { prompt }
        },
        { auth: true }
      );
      onToast({
        title: result.run?.id ? `已提交试运行：${result.run.id.slice(-6)}` : "已提交 Workflow 试运行",
        tone: "success"
      });
    } catch (err) {
      onToast({ title: err instanceof Error ? err.message : "Workflow 试运行失败", tone: "danger" });
    } finally {
      setBusy("");
    }
  };

  const runFormPreview = buildWorkflowRunForm(selectedNodes);
  const exposedRunFields = Array.isArray(runFormPreview.fields) ? runFormPreview.fields : [];
  const toolBoundCount = selectedNodes.filter((node) => {
    const tool = node.toolKey ? tools.find((item) => item.toolKey === node.toolKey) : resolveToolForComponent(node.component, tools);
    return Boolean(tool?.toolKey);
  }).length;
  const modelBoundCount = selectedNodes.filter((node) => String(node.modelKey || node.component.modelKey || "").trim()).length;
  const uploadFieldCount = selectedNodes.filter((node) => node.exposeUpload).length;

  return (
    <div className="workflow-console">
      <div className="component-column">
        <h2>组件</h2>
        {components.length ? (
          components.map((component) => (
            <button
              key={component.componentKey}
              draggable
              onClick={() => addComponent(component)}
              onDragStart={() => setDragComponentKey(component.componentKey)}
              onDragEnd={() => {
                setDragComponentKey("");
                setCanvasDropActive(false);
              }}
            >
              <Icon name="nodes" />
              <span>{componentTitle(component)}</span>
              <small>{componentCategoryLabel(component)}</small>
            </button>
          ))
        ) : (
          <div className="component-empty">
            <Icon name="empty" />
            <span>暂无组件定义</span>
            <small>暂无可用组件，请稍后再创建 Workflow。</small>
          </div>
        )}
        <div className="workflow-drafts">
          <div className="draft-head">
            <h3>我的草稿</h3>
            <button onClick={loadWorkflows} disabled={workflowLoading || Boolean(busy)}>
              {workflowLoading ? "同步中" : "刷新"}
            </button>
          </div>
          {workflows.length ? (
            workflows.slice(0, 8).map((workflow) => (
              <button key={workflow.id} className={draft?.id === workflow.id ? "active" : ""} onClick={() => openWorkflow(workflow)}>
                <Icon name="list" />
                <span>{workflow.title}</span>
                <small>{paymentStatusLabel(workflow.status || "draft")}</small>
              </button>
            ))
          ) : (
            <div className="component-empty">
              <Icon name="empty" />
              <span>暂无草稿</span>
              <small>保存或导入 Workflow 后会出现在这里。</small>
            </div>
          )}
        </div>
        <div className="workflow-published">
          <div className="draft-head">
            <h3>我的发布</h3>
            <button onClick={loadPublishedCases} disabled={publishedLoading || Boolean(busy)}>
              {publishedLoading ? "同步中" : "刷新"}
            </button>
          </div>
          {publishedCases.length ? (
            publishedCases.slice(0, 12).map((item) => {
              const lifecycle = workflowCaseLifecycle(item);
              const hidden = Boolean(!item.deletedByAuthorAt && (item.public === false || item.visibility === "hidden" || item.listingStatus === "hidden"));
              const stopped = Boolean(item.deletedByAuthorAt);
              const hideBusy = publishedBusyId === `hide:${item.id}`;
              const stopBusy = publishedBusyId === item.id;
              return (
                <article className="published-case" key={item.id}>
                  <div>
                    <span className={`lifecycle ${lifecycle.tone}`}>{lifecycle.label}</span>
                    <strong>{item.title}</strong>
                    <small>{item.licenseMode === "closed_paid" ? `${item.pricePoints || 0} 点` : "开源免费"} · 购 {item.purchaseCount || 0} · 跑 {item.runCount || 0}</small>
                  </div>
                  <div className="published-actions">
                    <button
                      className="link-muted"
                      onClick={() => hidePublishedCase(item)}
                      disabled={hideBusy || hidden || stopped || item.disabled}
                    >
                      {hideBusy ? "处理中" : hidden ? "已隐藏" : "隐藏展示"}
                    </button>
                  <button
                    className="link-danger"
                    onClick={() => stopPublishedCase(item)}
                    disabled={stopBusy || stopped || item.disabled}
                  >
                    {publishedBusyId === item.id ? "处理中" : stopped ? "已停止" : "停止公开"}
                  </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="component-empty">
              <Icon name="empty" />
              <span>暂无发布案例</span>
              <small>发布后的 Workflow 会在这里治理生命周期。</small>
            </div>
          )}
        </div>
      </div>
      <div className="canvas-panel">
        <div className="canvas-head">
          <div>
            <span className="eyebrow">低代码 Workflow</span>
            <h2>从组件库编排可发布、可购买、可运行的创作链路</h2>
          </div>
          <div className="segmented">
            <button className={mode === "open_free" ? "active" : ""} onClick={() => setMode("open_free")}>
              开源免费
            </button>
            <button className={mode === "closed_paid" ? "active" : ""} onClick={() => setMode("closed_paid")}>
              闭源付费
            </button>
          </div>
        </div>
        <div className="workflow-toolbar">
          <input
            ref={importInputRef}
            type="file"
            accept=".seeflow,application/json"
            onChange={(event) => importWorkflowFile(event.target.files?.[0] || null)}
          />
          <Button variant="ghost" onClick={() => importInputRef.current?.click()} disabled={Boolean(busy)}>
            <Icon name="upload" />
            导入流程文件
          </Button>
          <Button variant="ghost" onClick={exportWorkflow} disabled={Boolean(busy) || !selectedNodes.length}>
            <Icon name="download" />
            导出当前草稿
          </Button>
          <Button variant="ghost" onClick={autoLinkLinear} disabled={Boolean(busy) || selectedNodes.length < 2}>
            <Icon name="nodes" />
            线性串联
          </Button>
          <Button variant="ghost" onClick={clearWorkflowLinks} disabled={Boolean(busy) || !visualEdges.length}>
            <Icon name="x" />
            清空连接
          </Button>
        </div>

        <div className="workflow-form">
          <label>
            <span>案例标题</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：商品海报一键生成 Workflow" />
          </label>
          <label>
            <span>案例分类</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="视觉创作">视觉创作</option>
              <option value="商品营销">商品营销</option>
              <option value="短视频">短视频</option>
              <option value="头像写真">头像写真</option>
              <option value="设计素材">设计素材</option>
            </select>
          </label>
          <label className="field-wide">
            <span>案例摘要</span>
            <textarea value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="说明这个 Workflow 适合什么场景、输入什么、会输出什么。" />
          </label>
          <label>
            <span>标签</span>
            <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="用逗号分隔，例如 商品图, 海报, 16:9" />
          </label>
          <label className="field-wide">
            <span>试运行提示词</span>
            <textarea value={testPrompt} onChange={(event) => setTestPrompt(event.target.value)} placeholder="填写一次真实试运行的提示词。试运行会冻结并消耗对应模型节点点数。" />
          </label>
          {mode === "closed_paid" ? (
            <>
              <label>
                <span>模板售价点数</span>
                <input type="number" min={priceMinPoints} max={priceMaxPoints} value={pricePoints} onChange={(event) => setPricePoints(Number(event.target.value || 0))} />
                <small>
                  {priceMaxPoints ? `允许范围 ${priceMinPoints} - ${priceMaxPoints} 点` : `最低 ${priceMinPoints} 点`}
                  {commissionRatePercent !== undefined ? ` · 平台抽佣 ${commissionRatePercent}%` : ""}
                </small>
              </label>
              <label>
                <span>试运行次数</span>
                <input type="number" min={0} max={trialLimitMaxPerUser} value={trialLimitPerUser} onChange={(event) => setTrialLimitPerUser(Number(event.target.value || 0))} />
                <small>当前最多可开放每人试运行 {trialLimitMaxPerUser} 次。</small>
              </label>
              <label className="check-field">
                <input type="checkbox" checked={trialEnabled} onChange={(event) => setTrialEnabled(event.target.checked)} />
                <span>开放购买前试运行</span>
              </label>
            </>
          ) : null}
        </div>

        <div className="workflow-publish-summary">
          <article>
            <span>发布模式</span>
            <strong>{mode === "closed_paid" ? "闭源付费" : "开源免费"}</strong>
            <small>{mode === "closed_paid" ? `售价 ${pricePoints} 点，购买后开放运行权` : "开放流程图，可克隆或导出流程文件"}</small>
          </article>
          <article>
            <span>节点完整度</span>
            <strong>{toolBoundCount}/{selectedNodes.length || 0} 工具 · {modelBoundCount}/{selectedNodes.length || 0} 模型</strong>
            <small>{selectedNodes.length ? "未选择模型的节点会使用对应工具默认模型" : "请先从组件库添加节点"}</small>
          </article>
          <article>
            <span>运行表单</span>
            <strong>{exposedRunFields.length} 个字段</strong>
            <small>{uploadFieldCount ? `包含 ${uploadFieldCount} 个素材输入节点` : "当前没有开放素材上传字段"}</small>
          </article>
        </div>

        <div className="workflow-runform-preview">
          <div>
            <span className="eyebrow">运行表单预览</span>
            <strong>运行者将看到的参数</strong>
          </div>
          {exposedRunFields.length ? (
            <div className="runform-chip-list">
              {exposedRunFields.map((field) => (
                <span key={String(field.key)}>
                  {String(field.label || field.key)}
                  {field.required ? <small>必填</small> : null}
                </span>
              ))}
            </div>
          ) : (
            <p>当前没有开放运行参数；如果要发布为可复用案例，建议至少开放提示词字段。</p>
          )}
        </div>

        <div
          className={canvasDropActive ? "workflow-drop-zone active" : "workflow-drop-zone"}
          onDragOver={handleCanvasDragOver}
          onDragLeave={handleCanvasDragLeave}
          onDrop={handleCanvasDrop}
        >
        {selectedNodes.length ? (
          <div className="workflow-canvas-shell">
            <div className="workflow-canvas-controls">
              <button onClick={() => setCanvasZoom((value) => Math.max(0.7, Number((value - 0.1).toFixed(2))))}>缩小</button>
              <span>{Math.round(canvasZoom * 100)}%</span>
              <button onClick={() => setCanvasZoom((value) => Math.min(1.35, Number((value + 0.1).toFixed(2))))}>放大</button>
              <button onClick={() => setCanvasZoom(1)}>适配</button>
            </div>
            <div className="workflow-canvas-viewport">
              <div className="workflow-canvas-scale" style={{ transform: `scale(${canvasZoom})` }}>
                <svg className="workflow-edge-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  {visualEdges.map((edge) => {
                    const midX = (edge.sourceX + edge.targetX) / 2;
                    const sourceY = 44 - edge.rowOffset / 4;
                    const targetY = 56 + edge.rowOffset / 4;
                    return (
                      <path
                        key={edge.id}
                        d={`M ${edge.sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${edge.targetX} ${targetY}`}
                      />
                    );
                  })}
                </svg>
                <div className="canvas-lanes" style={{ gridTemplateColumns: `repeat(${Math.min(Math.max(selectedNodes.length, 1), 5)}, minmax(190px, 1fr))` }}>
                  {selectedNodes.map((node, index) => {
                    const component = node.component;
                    const tool = node.toolKey ? tools.find((item) => item.toolKey === node.toolKey) : resolveToolForComponent(component, tools);
                    const upstreamLabels = (node.upstreamNodeKeys || [])
                      .map((key) => selectedNodes.find((item) => item.nodeKey === key))
                      .filter(Boolean)
                      .map((item) => componentTitle((item as WorkflowEditorNode).component));
                    return (
                    <div
                      className={`lane ${activeNode?.nodeKey === node.nodeKey ? "selected" : ""} ${dragNodeKey === node.nodeKey ? "dragging" : ""}`}
                      key={node.nodeKey}
                      draggable
                      onClick={() => setActiveNodeKey(node.nodeKey)}
                      onDragStart={() => setDragNodeKey(node.nodeKey)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => dropNodeOn(node.nodeKey)}
                      onDragEnd={() => setDragNodeKey("")}
                    >
                      <i className="node-port input" aria-hidden="true" />
                      <i className="node-port output" aria-hidden="true" />
                      <span>{componentCategoryLabel(component)} · {tool?.toolKey || "未映射工具"}</span>
                      <div className={index === 0 ? "flow-node active" : index === selectedNodes.length - 1 ? "flow-node accent" : "flow-node"}>
                        {componentTitle(component)}
                      </div>
                      <small>{node.modelKey || component.modelKey || "使用工具默认模型"}</small>
                      <small>{upstreamLabels.length ? `输入来自：${upstreamLabels.join("、")}` : index === 0 ? "起始节点" : "未选择上游节点"}</small>
                      <div className="node-actions">
                        <button className="node-remove" onClick={(event) => { event.stopPropagation(); moveNode(node.nodeKey, -1); }} disabled={index === 0}>
                          上移
                        </button>
                        <button className="node-remove" onClick={(event) => { event.stopPropagation(); moveNode(node.nodeKey, 1); }} disabled={index === selectedNodes.length - 1}>
                          下移
                        </button>
                        <button className="node-remove" onClick={(event) => { event.stopPropagation(); duplicateNode(node.nodeKey); }}>
                          复制
                        </button>
                        <button className="node-remove" onClick={(event) => { event.stopPropagation(); removeNode(node.nodeKey); }}>
                          移除
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyBlock title="暂无可用组件" body="组件库暂时为空，请稍后再创建 Workflow。" />
        )}
        </div>

        {activeNode ? (
          <div className="node-config-panel">
            <div className="section-title-row">
              <div>
                <span className="eyebrow">节点设置</span>
                <h2>{componentTitle(activeNode.component)}</h2>
              </div>
              <span className="section-note">{componentCategoryLabel(activeNode.component)}</span>
            </div>
            <div className="node-config-grid">
              <label>
                <span>绑定工具</span>
                <select
                  value={activeNode.toolKey || resolveToolForComponent(activeNode.component, tools)?.toolKey || ""}
                  onChange={(event) => updateNode(activeNode.nodeKey, { toolKey: event.target.value })}
                >
                  <option value="">自动匹配工具</option>
                  {tools.map((tool) => (
                    <option value={tool.toolKey} key={tool.toolKey}>
                      {tool.name} · {tool.toolKey}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>可用模型</span>
                <select
                  value={activeNode.modelKey || ""}
                  onChange={(event) => updateNode(activeNode.nodeKey, { modelKey: event.target.value })}
                >
                  <option value="">跟随组件或工具默认模型</option>
                  {activeModelOptions.map((model) => (
                    <option value={model.modelKey} key={model.modelKey}>
                      {model.name || model.modelKey} · {model.modality || model.nodeType || "模型"} · {model.pricePoints || 0} 点
                    </option>
                  ))}
                </select>
                {!activeModelOptions.length ? <small>当前节点暂时没有可选模型，可以选择其他组件或稍后再试。</small> : null}
              </label>
              <label>
                <span>节点预估点数</span>
                <input
                  type="number"
                  min={0}
                  value={activeNode.costPoints ?? ""}
                  onChange={(event) => updateNode(activeNode.nodeKey, { costPoints: event.target.value === "" ? undefined : Number(event.target.value) })}
                  placeholder="为空时使用工具点数"
                />
              </label>
              <label className="field-wide">
                <span>Prompt 模板</span>
                <textarea
                  value={activeNode.promptTemplate}
                  onChange={(event) => updateNode(activeNode.nodeKey, { promptTemplate: event.target.value })}
                  placeholder="支持 {{prompt}}、{{ratio}}、{{resolution}}、{{quality}} 等运行表单变量"
                />
              </label>
              <div className="field-wide upstream-fields-grid">
                <span>上游连接</span>
                {upstreamCandidates.length ? upstreamCandidates.map((candidate) => (
                  <label className="check-field" key={candidate.nodeKey}>
                    <input
                      type="checkbox"
                      checked={(activeNode.upstreamNodeKeys || []).includes(candidate.nodeKey)}
                      onChange={() => toggleUpstreamNode(candidate.nodeKey)}
                    />
                    <span>{componentTitle(candidate.component)}</span>
                  </label>
                )) : (
                  <small>当前节点是画布中的起始节点，不需要选择上游输入。</small>
                )}
              </div>
              <div className="field-wide exposed-fields-grid">
                <span>运行者可修改字段</span>
                {[
                  ["exposePrompt", "提示词"],
                  ["exposeRatio", "比例"],
                  ["exposeResolution", "图像分辨率"],
                  ["exposeQuality", "视频精度"],
                  ["exposeUpload", "输入素材"]
                ].map(([key, label]) => (
                  <label className="check-field" key={key}>
                    <input
                      type="checkbox"
                      checked={Boolean(activeNode[key as keyof WorkflowEditorNode])}
                      onChange={(event) => updateNode(activeNode.nodeKey, { [key]: event.target.checked } as Partial<WorkflowEditorNode>)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className={`validation-panel ${currentValidation.valid ? "ok" : "bad"}`}>
          <strong>{currentValidation.valid ? "结构校验可通过" : "需要修复后再发布"}</strong>
          <span>
            {currentValidation.nodeCount} 个节点 / {currentValidation.edgeCount} 条连接 / 预估 {currentValidation.estimatedPoints} 点
            {currentValidation.minPoints !== undefined && currentValidation.maxPoints !== undefined
              ? ` / 区间 ${currentValidation.minPoints}-${currentValidation.maxPoints} 点`
              : ""}
          </span>
          {currentValidation.nodeEstimates?.length ? (
            <div className="estimate-list">
              {currentValidation.nodeEstimates.map((node) => (
                <div key={node.nodeId}>
                  <span>{node.label}</span>
                  <small>{node.toolName || node.toolKey}{node.modelKey ? ` · ${node.modelKey}` : ""}</small>
                  <strong>{node.estimatedPoints} 点</strong>
                </div>
              ))}
            </div>
          ) : null}
          {[...currentValidation.errors, ...currentValidation.warnings].map((message) => (
            <small key={message}>{message}</small>
          ))}
          {draft?.id ? <small>当前草稿：{draft.id}</small> : <small>尚未保存草稿。</small>}
        </div>

        <div className="canvas-footer">
          <Button variant="ghost" onClick={validateDraft} disabled={Boolean(busy)}>
            <Icon name="check" />
            校验
          </Button>
          <Button variant="ghost" onClick={saveDraft} disabled={Boolean(busy)}>
            <Icon name="save" />
            {busy === "save" ? "保存中" : "保存草稿"}
          </Button>
          <Button variant="ghost" onClick={runWorkflowTest} disabled={Boolean(busy)}>
            <Icon name="play" />
            {busy === "run" ? "运行中" : "试运行"}
          </Button>
          <Button onClick={publishWorkflow} disabled={Boolean(busy)}>
            <Icon name="upload" />
            {busy === "publish" ? "发布中" : "发布案例"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function WorkflowCasePanel({
  initialCases,
  onOpenPurchases,
  onToast
}: {
  initialCases: CaseContent[];
  onOpenPurchases: () => void;
  onToast: (toast: Toast) => void;
}) {
  const initialTargetCaseId = currentWorkflowCaseId();
  const initialTargetCase = initialCases.find((item) => item.id === initialTargetCaseId) || initialCases[0] || null;
  const [items, setItems] = useState<CaseContent[]>(initialCases);
  const [selectedCase, setSelectedCase] = useState<CaseContent | null>(initialTargetCase);
  const [status, setStatus] = useState<WorkflowPurchaseStatus | null>(null);
  const [runValues, setRunValues] = useState<Record<string, WorkflowRunValue>>(initialWorkflowRunValues(initialTargetCase?.runForm));
  const [runUploadState, setRunUploadState] = useState<WorkflowRunUploadState>({});
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const loadCases = () => {
    setLoading(true);
    apiGet<PageData<CaseContent>>("/workflow-cases?pageSize=30", { auth: true })
      .then((data) => {
        const list = data.list || [];
        const targetCaseId = currentWorkflowCaseId();
        const targetCase = targetCaseId
          ? list.find((item) => item.id === targetCaseId) || ({ id: targetCaseId, title: "正在同步目标案例" } as CaseContent)
          : null;
        const nextCase = targetCase || (selectedCase && list.some((item) => item.id === selectedCase.id) ? selectedCase : list[0] || null);
        setItems(list);
        setSelectedCase(nextCase);
        if (nextCase) {
          openCase(nextCase);
        }
        setError("");
      })
      .catch((err) => setError(err.message || "Workflow 案例加载失败"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCases();
  }, []);

  const openCase = (item: CaseContent) => {
    setSelectedCase(item);
    setStatus(null);
    setRunValues(initialWorkflowRunValues(item.runForm));
    setRunUploadState({});
    setDetailLoading(true);
    Promise.all([
      apiGet<CaseContent>(`/workflow-cases/${item.id}`, { auth: true }),
      apiGet<WorkflowPurchaseStatus>(`/workflow-cases/${item.id}/purchase-status`, { auth: true })
    ])
      .then(([detail, purchaseStatus]) => {
        setSelectedCase(detail);
        setStatus(purchaseStatus);
        setRunValues(initialWorkflowRunValues(detail.runForm));
        setRunUploadState({});
      })
      .catch((err) => onToast({ title: err.message || "案例详情加载失败", tone: "danger" }))
      .finally(() => setDetailLoading(false));
  };

  const runCase = (kind: "run" | "trial") => {
    if (!selectedCase) return;
    if (isWorkflowUploadBusy(runUploadState)) {
      onToast({ title: "素材仍在上传中，请稍后运行。", tone: "danger" });
      return;
    }
    const payloadResult = buildWorkflowRunPayload(selectedCase.runForm, runValues);
    if (!payloadResult.ok) {
      onToast({ title: payloadResult.message, tone: "danger" });
      return;
    }
    setBusy(kind);
    const path = kind === "trial" ? `/workflow-cases/${selectedCase.id}/trial-run` : `/workflow-cases/${selectedCase.id}/run`;
    apiPost<{ run?: WorkflowRun }>(path, payloadResult.payload, { auth: true })
      .then((data) => {
        onToast({
          title: data.run?.id ? `已提交${kind === "trial" ? "试运行" : "正式运行"}：${data.run.id.slice(-6)}` : "已提交 Workflow 运行",
          tone: "success"
        });
        openCase(selectedCase);
      })
      .catch((err) => onToast({ title: err.message || "Workflow 运行失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  const purchaseCase = () => {
    if (!selectedCase) return;
    setBusy("purchase");
    apiPost<WorkflowPurchase>(`/workflow-cases/${selectedCase.id}/purchase`, {}, { auth: true })
      .then(() => {
        onToast({ title: "已购买该 Workflow，历史试运行作品将自动解锁。", tone: "success" });
        openCase(selectedCase);
      })
      .catch((err) => onToast({ title: err.message || "购买失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  const cloneCase = () => {
    if (!selectedCase) return;
    setBusy("clone");
    apiPost<WorkflowDraft>(`/workflow-cases/${selectedCase.id}/clone`, {}, { auth: true })
      .then((workflow) => onToast({ title: `已克隆为私有草稿：${workflow.title}`, tone: "success" }))
      .catch((err) => onToast({ title: err.message || "克隆失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  const exportCase = () => {
    if (!selectedCase) return;
    setBusy("export-case");
    apiGet<Record<string, unknown>>(`/workflow-cases/${selectedCase.id}/export`, { auth: true })
      .then((manifest) => {
        downloadJsonFile(`${safeFileStem(selectedCase.title)}.seeflow`, manifest);
        onToast({ title: "已导出开源 Workflow 案例", tone: "success" });
      })
      .catch((err) => onToast({ title: err.message || "导出失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  const canRun = workflowCanRun(status || selectedCase);
  const canTrial = selectedCase?.licenseMode === "closed_paid" && Boolean(status?.trialEnabled) && Number(status?.trialRemaining || 0) > 0 && !status?.purchased;
  const uploadBusy = isWorkflowUploadBusy(runUploadState);
  const selectedLifecycle = workflowCaseLifecycle(status || selectedCase);
  const selectedLifecycleNote = workflowLifecycleNote(status || selectedCase, Boolean(status?.purchased));

  if (loading) return <LoadingBlock title="正在同步 Workflow 案例广场" />;
  if (error) {
    return (
      <div className="workspace-section">
        <div className="wide-panel">
          <h2>Workflow 案例广场</h2>
          <p>{error}</p>
          <Button variant="ghost" onClick={loadCases}>
            <Icon name="refresh" />
            重新同步
          </Button>
        </div>
      </div>
    );
  }
  if (!items.length) return <EmptyBlock title="暂无公开 Workflow 案例" body="发布免费公开或付费闭源 Workflow 后会出现在这里。" />;

  return (
    <div className="case-action-layout workspace-section">
      <div className="case-action-list">
        {items.map((item) => (
          <button key={item.id} className={selectedCase?.id === item.id ? "active" : ""} onClick={() => openCase(item)}>
            <span>{item.licenseMode === "closed_paid" ? "闭源" : "开源"}</span>
            <strong>{item.title}</strong>
            <small>{item.pricePoints || 0} 点 · 运行 {item.runCount || 0}</small>
          </button>
        ))}
      </div>

      <div className="case-action-detail">
        {selectedCase ? (
          <>
            <div className="section-title-row">
              <div>
          <span className="eyebrow">Workflow 案例</span>
                <h2>{selectedCase.title}</h2>
              </div>
              <span className="section-note">{selectedCase.licenseMode === "closed_paid" ? "闭源付费" : "开源免费"}</span>
            </div>
            <p>{productCopy(selectedCase.summary, "该 Workflow 暂未填写摘要。")}</p>
            <div className="mini-meta">
              <span>{selectedCase.pricePoints || 0} 点</span>
              <span>{status?.purchased ? "已购买" : selectedCase.purchaseRequired ? "需购买" : "免费运行"}</span>
              <span className={`lifecycle ${selectedLifecycle.tone}`}>{selectedLifecycle.label}</span>
              <span>试运行 {status?.trialRemaining ?? selectedCase.trialRemaining ?? 0} 次</span>
              <span>购买 {selectedCase.purchaseCount || 0}</span>
              <span>克隆 {selectedCase.cloneCount || 0}</span>
            </div>
            <div className={status?.purchased ? "workflow-entitlement-card purchased" : "workflow-entitlement-card"}>
              <div>
                <strong>
                  {selectedCase.licenseMode === "closed_paid"
                    ? status?.purchased
                      ? "已购买该 Workflow"
                      : "购买后权益"
                    : "开源免费权益"}
                </strong>
                <p>
                  {selectedCase.licenseMode === "closed_paid"
                    ? status?.purchased
                      ? "你已获得该发布版本的永久运行权，历史试运行作品会自动解锁下载和发布；购买不包含流程图、克隆或导出权限。"
                      : "购买后获得该发布版本的永久运行权；后续运行仍按模型节点扣点，不会开放流程图、克隆或流程文件导出。"
                    : "开源免费案例允许登录后运行、克隆为私有草稿，并导出公开流程文件。"}
                </p>
                {selectedLifecycleNote ? <p className="workflow-lifecycle-note">{selectedLifecycleNote}</p> : null}
              </div>
              {selectedCase.licenseMode === "closed_paid" && status?.purchased ? (
                <Button variant="ghost" onClick={onOpenPurchases}>
                  <Icon name="badge" />
                  进入已购模板库
                </Button>
              ) : null}
            </div>
            {detailLoading ? <LoadingBlock title="正在同步案例权益" /> : null}
            {!canRun && status ? <p className="danger-text">{workflowBlockedReason(status) || "该 Workflow 当前不可运行。"}</p> : null}
            <WorkflowRunFormFields
              runForm={selectedCase.runForm}
              values={runValues}
              disabled={Boolean(busy)}
              uploadState={runUploadState}
              onChange={(key, value) => setRunValues((current) => ({ ...current, [key]: value }))}
              onUploadStateChange={(key, state) => setRunUploadState((current) => ({ ...current, [key]: state }))}
              onToast={onToast}
            />
            <div className="case-action-buttons">
              {selectedCase.licenseMode === "closed_paid" && !status?.purchased ? (
                <Button onClick={purchaseCase} disabled={Boolean(busy)}>
                  <Icon name="wallet" />
                  {busy === "purchase" ? "购买中" : `购买 ${selectedCase.pricePoints || 0} 点`}
                </Button>
              ) : null}
              {canTrial ? (
                <Button variant="ghost" onClick={() => runCase("trial")} disabled={Boolean(busy) || uploadBusy}>
                  <Icon name="play" />
                  {busy === "trial" ? "提交中" : "试运行"}
                </Button>
              ) : null}
              <Button variant="ghost" onClick={() => runCase("run")} disabled={Boolean(busy) || uploadBusy || !canRun || status?.disabled}>
                <Icon name="play" />
                {busy === "run" ? "提交中" : "正式运行"}
              </Button>
              {selectedCase.licenseMode === "open_free" ? (
                <>
                  <Button variant="ghost" onClick={cloneCase} disabled={Boolean(busy)}>
                    <Icon name="copy" />
                    克隆草稿
                  </Button>
                  <Button variant="ghost" onClick={exportCase} disabled={Boolean(busy)}>
                    <Icon name="download" />
                    导出流程文件
                  </Button>
                </>
              ) : null}
            </div>
            {selectedCase.licenseMode === "closed_paid" && !status?.purchased ? (
              <p className="muted-text">闭源付费案例购买后仅获得运行权，不会开放流程图、克隆或导出权限。</p>
            ) : null}
          </>
        ) : (
          <EmptyBlock title="请选择 Workflow 案例" body="选择案例后可查看购买状态、试运行次数和可执行动作。" />
        )}
      </div>
    </div>
  );
}

function PurchasedTemplates({ onToast }: { onToast: (toast: Toast) => void }) {
  const [items, setItems] = useState<WorkflowPurchase[]>([]);
  const [runValuesById, setRunValuesById] = useState<Record<string, Record<string, WorkflowRunValue>>>({});
  const [runUploadStateById, setRunUploadStateById] = useState<Record<string, WorkflowRunUploadState>>({});
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    apiGet<PageData<WorkflowPurchase>>("/workflow-purchases?pageSize=30", { auth: true })
      .then((data) => {
        const list = data.list || [];
        setItems(list);
        setRunValuesById((current) => {
          const next = { ...current };
          for (const item of list) {
            if (!next[item.id]) {
              next[item.id] = initialWorkflowRunValues(item.case?.runForm || item.version?.runForm);
            }
          }
          return next;
        });
        setError("");
      })
      .catch((err) => {
        setError(err.message || "已购模板库加载失败");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const runTemplate = (item: WorkflowPurchase) => {
    if (!workflowCanRun(item)) {
      onToast({ title: workflowBlockedReason(item) || "该模板已暂停运行", tone: "danger" });
      return;
    }
    const runForm = item.case?.runForm || item.version?.runForm;
    if (isWorkflowUploadBusy(runUploadStateById[item.id] || {})) {
      onToast({ title: "素材仍在上传中，请稍后运行。", tone: "danger" });
      return;
    }
    const payloadResult = buildWorkflowRunPayload(runForm, runValuesById[item.id] || initialWorkflowRunValues(runForm));
    if (!payloadResult.ok) {
      onToast({ title: payloadResult.message, tone: "danger" });
      return;
    }
    setRunningId(item.id);
    apiPost<{ run?: { id?: string } }>(`/workflow-cases/${item.caseContentId}/run`, payloadResult.payload, { auth: true })
      .then((data) => {
        onToast({ title: data.run?.id ? `已提交运行 ${data.run.id.slice(-6)}` : "已提交 Workflow 运行", tone: "success" });
      })
      .catch((err) => onToast({ title: err.message || "Workflow 运行失败", tone: "danger" }))
      .finally(() => setRunningId(""));
  };

  if (loading) return <LoadingBlock title="正在同步已购模板" />;
  if (error) {
    return (
      <div className="workspace-section">
        <div className="wide-panel">
          <h2>已购模板库</h2>
          <p>{error}</p>
          <Button variant="ghost" onClick={load}>
            <Icon name="refresh" />
            重新同步
          </Button>
        </div>
      </div>
    );
  }
  if (!items.length) {
    return (
      <div className="workspace-section">
        <EmptyBlock title="已购模板库为空" body="购买闭源 Workflow 后会出现在这里，并永久保留运行权益。" />
      </div>
    );
  }

  return (
    <div className="tool-grid workspace-section">
      {items.map((item) => {
        const runForm = item.case?.runForm || item.version?.runForm;
        const values = runValuesById[item.id] || initialWorkflowRunValues(runForm);
        const uploadState = runUploadStateById[item.id] || {};
        const uploadBusy = isWorkflowUploadBusy(uploadState);
        const lifecycleSource = workflowPurchaseLifecycleSource(item);
        const lifecycle = workflowCaseLifecycle(lifecycleSource);
        const lifecycleNote = workflowLifecycleNote(lifecycleSource, true);
        return (
          <article className="tool-card" key={item.id}>
            <div className="card-topline">
              <Icon name={workflowCanRun(item) ? "badge" : "alert"} />
              <span>{workflowCanRun(item) ? "可运行" : "暂停运行"}</span>
            </div>
            <h3>{item.case?.title || item.version?.title || "Workflow 模板"}</h3>
            <p>{productCopy(item.case?.summary || item.version?.summary || workflowBlockedReason(item), "已购买的闭源模板，可继续调度运行。")}</p>
            <div className="mini-meta">
              <span>作者 {workflowPurchaseCreatorName(item)}</span>
              <span>{workflowPurchaseVersionLabel(item)}</span>
              <span>{item.pricePoints || 0} 点</span>
              <span>{item.purchasedAt ? formatDate(item.purchasedAt) : "永久权益"}</span>
              <span>{workflowPurchaseLastRunText(item)}</span>
              {item.hasReplacementModel || item.replacementAvailable ? <span>存在替代模型</span> : null}
              <span className={`lifecycle ${lifecycle.tone}`}>{lifecycle.label}</span>
            </div>
            {lifecycleNote ? <p className="workflow-lifecycle-note">{lifecycleNote}</p> : null}
            {!workflowCanRun(item) && workflowBlockedReason(item) ? <p className="danger-text">{workflowBlockedReason(item)}</p> : null}
            <WorkflowRunFormFields
              runForm={runForm}
              values={values}
              disabled={runningId === item.id || !workflowCanRun(item)}
              uploadState={uploadState}
              onChange={(key, value) => setRunValuesById((current) => ({
                ...current,
                [item.id]: {
                  ...(current[item.id] || initialWorkflowRunValues(runForm)),
                  [key]: value
                }
              }))}
              onUploadStateChange={(key, state) => setRunUploadStateById((current) => ({
                ...current,
                [item.id]: {
                  ...(current[item.id] || {}),
                  [key]: state
                }
              }))}
              onToast={onToast}
            />
            <Button variant="ghost" disabled={runningId === item.id || uploadBusy || !workflowCanRun(item)} onClick={() => runTemplate(item)}>
              <Icon name="play" />
              {runningId === item.id ? "提交中" : "运行模板"}
            </Button>
          </article>
        );
      })}
    </div>
  );
}

function summarizeWorkflowIncome(items: WorkflowIncome[]) {
  return items.reduce(
    (summary, item) => {
      const grossPoints = Number(item.grossPoints || 0);
      const platformFeePoints = Number(item.platformFeePoints || 0);
      const incomePoints = Number(item.incomePoints || 0);
      const availablePoints = item.status === "available" ? Number(item.availablePoints || incomePoints || 0) : 0;
      const frozenPoints = item.status === "available" ? 0 : incomePoints;
      return {
        totalGrossPoints: summary.totalGrossPoints + grossPoints,
        totalPlatformFeePoints: summary.totalPlatformFeePoints + platformFeePoints,
        totalIncomePoints: summary.totalIncomePoints + incomePoints,
        availablePoints: summary.availablePoints + availablePoints,
        frozenPoints: summary.frozenPoints + frozenPoints,
        availableCount: summary.availableCount + (item.status === "available" ? 1 : 0),
        frozenCount: summary.frozenCount + (item.status === "available" ? 0 : 1)
      };
    },
    {
      totalGrossPoints: 0,
      totalPlatformFeePoints: 0,
      totalIncomePoints: 0,
      availablePoints: 0,
      frozenPoints: 0,
      availableCount: 0,
      frozenCount: 0
    }
  );
}

function IncomePanel() {
  const [items, setItems] = useState<WorkflowIncome[]>([]);
  const [creatorSummary, setCreatorSummary] = useState<WorkflowCreatorIncomeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fallbackSummary = summarizeWorkflowIncome(items);
  const incomeSummary = creatorSummary?.income || fallbackSummary;
  const purchaseSummary = creatorSummary?.purchases || {};
  const runSummary = creatorSummary?.runs || {};
  const caseSummary = creatorSummary?.cases || {};

  useEffect(() => {
    Promise.all([
      apiGet<WorkflowCreatorIncomeSummary>("/workflow-creator-income/summary", { auth: true }),
      apiGet<PageData<WorkflowIncome>>("/workflow-creator-income?pageSize=30", { auth: true })
    ])
      .then(([summaryData, incomeData]) => {
        setCreatorSummary(summaryData);
        setItems(incomeData.list || []);
        setError("");
      })
      .catch((err) => setError(err.message || "创作者收益加载失败"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingBlock title="正在同步创作者收益" />;
  if (error) return <EmptyBlock title="创作者收益暂不可用" body={error} />;

  return (
    <div className="workspace-grid income-layout">
      <div className="metric-card">
        <span>应得收益</span>
        <strong>{formatPoints(incomeSummary.totalIncomePoints)}</strong>
      </div>
      <div className="metric-card">
        <span>可用点数</span>
        <strong>{formatPoints(incomeSummary.availablePoints)}</strong>
      </div>
      <div className="metric-card">
        <span>冻结点数</span>
        <strong>{formatPoints(incomeSummary.frozenPoints)}</strong>
      </div>
      <div className="metric-card">
        <span>平台抽佣</span>
        <strong>{formatPoints(incomeSummary.totalPlatformFeePoints)}</strong>
      </div>
      <div className="metric-card">
        <span>模板购买</span>
        <strong>{formatPoints(purchaseSummary.totalCount)}</strong>
      </div>
      <div className="metric-card">
        <span>运行次数</span>
        <strong>{formatPoints(runSummary.totalCount)}</strong>
      </div>
      <div className="metric-card">
        <span>购买用户</span>
        <strong>{formatPoints(purchaseSummary.uniqueBuyerCount)}</strong>
      </div>
      <div className="metric-card">
        <span>已发布案例</span>
        <strong>{formatPoints(caseSummary.totalCount)}</strong>
      </div>
      <div className="wide-panel income-policy-card">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">创作者收益</span>
            <h2>创作者平台内收益</h2>
          </div>
          <span className="section-note">{formatPoints(incomeSummary.availableCount)} 笔可用 · {formatPoints(incomeSummary.frozenCount)} 笔冻结</span>
        </div>
        <p>闭源 Workflow 模板被购买后，收益先冻结 72 小时；到期后转为可用平台内点数，可用于生成或购买模板，不开放提现、转赠、退款或兑换现金。</p>
        <div className="income-insight-grid">
          <span>正式运行 {formatPoints(runSummary.formalCount)} 次</span>
          <span>试运行 {formatPoints(runSummary.trialCount)} 次</span>
          <span>成功 {formatPoints(runSummary.successCount)} 次</span>
          <span>失败 {formatPoints(runSummary.failedCount)} 次</span>
          <span>公开中 {formatPoints(caseSummary.listedCount)} 个</span>
          <span>隐藏 {formatPoints(caseSummary.hiddenCount)} 个</span>
        </div>
        <p>这里仅展示购买数、运行数、收益和脱敏汇总，不展示运行者输入、上传素材、节点私有输出或私有作品。</p>
      </div>
      <div className="model-table wide-panel income-table">
        <div className="model-row header">
          <span>收益</span>
          <span>平台抽佣</span>
          <span>状态</span>
          <span>时间</span>
        </div>
        {items.length ? items.map((item) => (
          <div className="model-row" key={item.id}>
            <strong>{formatPoints(item.incomePoints)} 点</strong>
            <span>{formatPoints(item.platformFeePoints)} 点</span>
            <span>{item.status === "available" ? "可用" : "冻结中"}</span>
            <span>{item.status === "available" ? formatDate(item.settledAt) : formatDate(item.frozenUntil)}</span>
          </div>
        )) : (
          <div className="model-row empty-row">
            <span>暂无收益流水</span>
            <span>发布闭源付费 Workflow 并产生购买后，这里会显示冻结和可用记录。</span>
          </div>
        )}
      </div>
    </div>
  );
}

function RunsPanel({ onToast }: { onToast: (toast: Toast) => void }) {
  const [items, setItems] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);
  const [nodes, setNodes] = useState<WorkflowRunNode[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [busyWorkId, setBusyWorkId] = useState("");
  const [runBusy, setRunBusy] = useState("");

  const loadRuns = () => {
    setLoading(true);
    apiGet<PageData<WorkflowRun>>("/workflow-runs?pageSize=30", { auth: true })
      .then((data) => {
        setItems(data.list || []);
        setError("");
      })
      .catch((err) => setError(err.message || "运行记录加载失败"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const openRun = (item: WorkflowRun) => {
    setSelectedRun(item);
    setNodes([]);
    setDetailError("");
    setDetailLoading(true);
    apiGet<{ run: WorkflowRun; nodes: WorkflowRunNode[] }>(`/workflow-runs/${item.id}`, { auth: true })
      .then((data) => {
        setSelectedRun(data.run || item);
        setNodes(data.nodes || []);
      })
      .catch((err) => setDetailError(err.message || "运行详情加载失败"))
      .finally(() => setDetailLoading(false));
  };

  const openWork = (workId: string) => {
    if (!workId) return;
    setBusyWorkId(`open:${workId}`);
    apiGet<Work>(`/works/${workId}`, { auth: true })
      .then((work) => {
        const targetUrl = work.resultUrls?.[0] || work.coverUrl;
        if (targetUrl) {
          openExternalUrl(targetUrl);
        } else {
          onToast({ title: "该作品暂无可预览结果。", tone: "danger" });
        }
      })
      .catch((err) => onToast({ title: err.message || "作品详情加载失败", tone: "danger" }))
      .finally(() => setBusyWorkId(""));
  };

  const downloadWork = (workId: string) => {
    if (!workId) return;
    setBusyWorkId(`download:${workId}`);
    apiGet<DownloadUrl>(`/works/${workId}/download-url`, { auth: true })
      .then((data) => {
        if (data.url) {
          openExternalUrl(data.url);
          onToast({ title: data.signed ? "已生成临时下载链接" : "已打开下载链接", tone: "success" });
        } else {
          onToast({ title: "该作品暂无可下载地址。", tone: "danger" });
        }
      })
      .catch((err) => onToast({ title: err.message || "下载链接获取失败", tone: "danger" }))
      .finally(() => setBusyWorkId(""));
  };

  const cancelRun = (run: WorkflowRun) => {
    if (!["queued", "processing"].includes(String(run.status))) return;
    setRunBusy(`cancel:${run.id}`);
    apiPost<{ run: WorkflowRun; nodes: WorkflowRunNode[] }>(`/workflow-runs/${run.id}/cancel`, {}, { auth: true })
      .then((data) => {
        setSelectedRun(data.run);
        setNodes(data.nodes || []);
        setItems((current) => current.map((item) => item.id === run.id ? data.run : item));
        onToast({ title: "Workflow 已取消，未消耗的点数会自动退回。", tone: "success" });
        loadRuns();
      })
      .catch((err) => onToast({ title: err.message || "取消 Workflow 失败", tone: "danger" }))
      .finally(() => setRunBusy(""));
  };

  if (loading) return <LoadingBlock title="正在同步运行记录" />;
  if (error) return <EmptyBlock title="运行记录暂不可用" body={error} />;
  if (!items.length) return <EmptyBlock title="暂无运行记录" body="运行工具或 Workflow 后会在这里看到状态、冻结点数和结算结果。" />;

  return (
    <div className="runs-layout workspace-section">
      <div className="model-table">
        <div className="model-row header">
          <span>运行 ID</span>
          <span>状态</span>
          <span>点数</span>
          <span>操作</span>
        </div>
        {items.map((item) => (
          <div className={`model-row ${selectedRun?.id === item.id ? "active" : ""}`} key={item.id}>
            <strong>{item.id.slice(-8)}</strong>
            <span>{item.isTrial ? "试运行" : item.status}</span>
            <span>{item.actualPoints || item.settledPoints || item.estimatedPoints || 0} 点</span>
            <button className="row-action" onClick={() => openRun(item)}>
              查看节点
            </button>
          </div>
        ))}
      </div>

      <div className="run-detail-panel">
        {selectedRun ? (
          <>
            <div className="section-title-row">
              <div>
                <span className="eyebrow">Workflow 运行</span>
                <h2>{selectedRun.id.slice(-8)}</h2>
              </div>
              <div className="inline-actions">
                {["queued", "processing"].includes(String(selectedRun.status)) ? (
                  <Button variant="ghost" onClick={() => cancelRun(selectedRun)} disabled={Boolean(runBusy)}>
                    <Icon name="close" />
                    {runBusy ? "取消中" : "取消运行"}
                  </Button>
                ) : null}
                <Button variant="ghost" onClick={() => openRun(selectedRun)} disabled={detailLoading}>
                  <Icon name="refresh" />
                  刷新
                </Button>
              </div>
            </div>
            <div className="mini-meta">
              <span>{selectedRun.status}</span>
              <span>预估 {selectedRun.estimatedPoints || 0} 点</span>
              <span>结算 {selectedRun.settledPoints || selectedRun.actualPoints || 0} 点</span>
              <span>释放 {selectedRun.releasedPoints || 0} 点</span>
              <span>{formatDate(selectedRun.createdAt)}</span>
            </div>
            {selectedRun.failureReason ? <p className="danger-text">{selectedRun.failureReason}</p> : null}
            {detailLoading ? <LoadingBlock title="正在同步节点状态" /> : null}
            {detailError ? <p className="danger-text">{detailError}</p> : null}
            {!detailLoading && !detailError && nodes.length ? (
              <div className="run-node-list">
                {nodes.map((node) => {
                  const workId = workflowNodeWorkId(node);
                  const previewUrl = workflowNodeCoverUrl(node);
                  const resultUrls = workflowNodeResultUrls(node);
                  const workLocked = Boolean(node.workLockedUntilPurchase);
                  const workDownloadAllowed = node.workDownloadEnabled !== false && !workLocked;
                  return (
                    <article key={node.id} className={`run-node ${node.status || "queued"}`}>
                      <div>
                        <strong>{node.label || node.nodeId || "Workflow 节点"}</strong>
                        <span>{node.componentKey || "component"} · {node.status || "queued"}</span>
                      </div>
                      <div className="mini-meta">
                        <span>{node.costPoints || 0} 点</span>
                        <span>{node.isTerminalOutput ? "最终输出" : node.isIntermediateOutput ? "中间结果" : "辅助节点"}</span>
                        {workId ? <span>作品 {workId.slice(-8)}</span> : null}
                        {node.workIsTrialOutput ? <span>试运行产物</span> : null}
                        {workLocked ? <span>购买后解锁</span> : null}
                        {node.workDownloadEnabled === false ? <span>不可下载</span> : null}
                        {node.generationTaskId ? <span>任务 {node.generationTaskId.slice(-8)}</span> : null}
                        {resultUrls.length ? <span>{resultUrls.length} 个结果</span> : null}
                      </div>
                      {previewUrl ? (
                        <div className="node-output-preview">
                          {isVideoUrl(previewUrl) ? (
                            <video src={previewUrl} controls preload="metadata" />
                          ) : (
                            <img src={previewUrl} alt={`${node.label || "Workflow 节点"}输出预览`} loading="lazy" />
                          )}
                        </div>
                      ) : null}
                      {workId ? (
                        <div className="run-node-actions">
                          <Button variant="ghost" onClick={() => openWork(workId)} disabled={Boolean(busyWorkId)}>
                            <Icon name="view" />
                            {busyWorkId === `open:${workId}` ? "打开中" : "查看作品"}
                          </Button>
                          <Button variant="ghost" onClick={() => downloadWork(workId)} disabled={Boolean(busyWorkId) || !workDownloadAllowed}>
                            <Icon name="download" />
                            {workLocked ? "购买后下载" : busyWorkId === `download:${workId}` ? "获取中" : "下载"}
                          </Button>
                        </div>
                      ) : null}
                      {workLocked ? <p className="danger-text">该试运行节点作品需要购买对应 Workflow 后才能下载或发布。</p> : null}
                      {!workLocked && node.workDownloadEnabled === false ? <p className="danger-text">该节点作品已关闭下载权限。</p> : null}
                      {node.errorMessage ? <p className="danger-text">{node.errorMessage}</p> : null}
                      {node.input?.prompt ? <p className="node-prompt">{String(node.input.prompt)}</p> : null}
                    </article>
                  );
                })}
              </div>
            ) : null}
            {!detailLoading && !detailError && !nodes.length ? (
              <EmptyBlock title="暂无节点明细" body="运行刚创建时节点可能还在排队，稍后刷新即可同步。" />
            ) : null}
          </>
        ) : (
          <EmptyBlock title="选择一条运行记录" body="点击左侧记录查看节点状态、消耗点数、作品和错误摘要。" />
        )}
      </div>
    </div>
  );
}

function WalletPanel({ onToast }: { onToast: (toast: Toast) => void }) {
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [policy, setPolicy] = useState<RechargePolicy | null>(null);
  const [rechargeOptions, setRechargeOptions] = useState<WalletRechargeOptions | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [amountCny, setAmountCny] = useState("20");
  const [selectedChain, setSelectedChain] = useState("");
  const [selectedToken, setSelectedToken] = useState("");
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [cryptoOrder, setCryptoOrder] = useState<CryptoPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"" | "create" | "sync">("");
  const [error, setError] = useState("");

  const chains = rechargeOptions?.chains || [];
  const chainOption = chains.find((item) => item.chain === selectedChain) || chains[0];
  const tokenOptions = chainOption?.tokens || [];
  const pointRate = Number(policy?.pointRate || balance?.pointRate || 7);
  const amountCents = Math.round(Number(amountCny || 0) * 100);
  const previewPoints = Math.max(0, Math.floor((amountCents / 100) * pointRate));
  const minAmountCents = Number(policy?.minAmountCents ?? 100);
  const maxAmountCents = Number(policy?.maxAmountCents ?? 999900);
  const depositAddress = cryptoOrder?.depositAddress || cryptoOrder?.bridgeDepositAddress || "";
  const canCreate = !busy && policy?.allowCustomAmount !== false && Boolean(selectedChain && selectedToken) && amountCents >= minAmountCents && amountCents <= maxAmountCents;

  const loadWallet = (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    Promise.all([
      settle(apiGet<CreditBalance>("/credits/balance", { auth: true })),
      settle(apiGet<RechargePolicy>("/credits/recharge-settings")),
      settle(apiGet<WalletRechargeOptions>("/wallet/recharge-options")),
      settle(apiGet<PageData<CreditTransaction>>("/credits/transactions?pageSize=12", { auth: true }))
    ])
      .then(([balanceResult, policyResult, optionsResult, txResult]) => {
        if (balanceResult.ok) setBalance(balanceResult.value);
        if (policyResult.ok) setPolicy(policyResult.value);
        if (txResult.ok) setTransactions(txResult.value.list || []);
        if (optionsResult.ok) {
          setRechargeOptions(optionsResult.value);
          const firstChain = optionsResult.value.chains?.[0];
          if (!selectedChain && firstChain) {
            setSelectedChain(firstChain.chain);
            setSelectedToken(firstChain.tokens?.[0]?.token || "");
          }
        }
        const errors = [
          balanceResult.ok ? "" : `余额：${balanceResult.reason.message}`,
          policyResult.ok ? "" : `充值信息：${policyResult.reason.message}`,
          optionsResult.ok ? "" : `支付路线：${optionsResult.reason.message}`,
          txResult.ok ? "" : `点数流水：${txResult.reason.message}`
        ].filter(Boolean);
        setError(errors.join("；"));
      })
      .finally(() => !silent && setLoading(false));
  };

  useEffect(() => {
    loadWallet();
  }, []);

  useEffect(() => {
    if (!cryptoOrder?.id || !["pending", "processing"].includes(String(cryptoOrder.status))) return undefined;
    const timer = window.setInterval(() => {
      syncCryptoOrder(true);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [cryptoOrder?.id, cryptoOrder?.status]);

  const handleChainChange = (chain: string) => {
    const nextChain = chains.find((item) => item.chain === chain);
    setSelectedChain(chain);
    setSelectedToken(nextChain?.tokens?.[0]?.token || "");
  };

  const createRechargeOrder = async () => {
    if (!canCreate) {
      onToast({ title: `充值金额需在 ${formatCnyFromCents(minAmountCents)} - ${formatCnyFromCents(maxAmountCents)} 之间`, tone: "danger" });
      return;
    }
    setBusy("create");
    setError("");
    try {
      const order = await apiPost<PaymentOrder>("/credits/recharge-orders", {
        amountCents,
        clientRuntime: "h5-google"
      }, { auth: true });
      const crypto = await apiPost<CryptoPayment>("/payments/crypto-orders", {
        paymentOrderId: order.id,
        payChain: selectedChain,
        payToken: selectedToken
      }, { auth: true });
      setPaymentOrder(order);
      setCryptoOrder(crypto);
      onToast({ title: "Crypto 充值订单已创建，请按页面地址完成转账。", tone: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "创建充值订单失败";
      setError(message);
      onToast({ title: message, tone: "danger" });
    } finally {
      setBusy("");
    }
  };

  const syncCryptoOrder = async (silent = false) => {
    if (!cryptoOrder?.id) return;
    const wasPaid = cryptoOrder.status === "paid";
    if (!silent) setBusy("sync");
    try {
      const latest = await apiGet<CryptoPayment>(`/payments/crypto-orders/${cryptoOrder.id}`, { auth: true });
      setCryptoOrder(latest);
      if (paymentOrder?.id) {
        apiGet<PaymentOrder>(`/payments/orders/${paymentOrder.id}`, { auth: true }).then(setPaymentOrder).catch(() => undefined);
      }
      if (latest.status === "paid") {
        loadWallet(true);
        if (!wasPaid) onToast({ title: "充值已到账，点数余额已刷新。", tone: "success" });
      } else if (!silent) {
        onToast({ title: `当前订单状态：${paymentStatusLabel(latest.status)}`, tone: "info" });
      }
    } catch (err) {
      if (!silent) onToast({ title: err instanceof Error ? err.message : "同步订单失败", tone: "danger" });
    } finally {
      if (!silent) setBusy("");
    }
  };

  const copyAddress = async () => {
    if (!depositAddress) return;
    await navigator.clipboard?.writeText(depositAddress);
    onToast({ title: "收款地址已复制", tone: "success" });
  };

  if (loading) return <LoadingBlock title="正在同步点数钱包" />;

  return (
    <div className="workspace-grid">
      <div className="metric-card">
        <span>可用点数</span>
        <strong>{formatPoints(balance?.availableBalance ?? balance?.balance)}</strong>
      </div>
      <div className="metric-card">
        <span>冻结点数</span>
        <strong>{formatPoints(balance?.frozenBalance)}</strong>
      </div>
      <div className="metric-card">
        <span>固定兑换</span>
        <strong>1 CNY = {formatPoints(pointRate)} 点</strong>
      </div>
      <div className="wide-panel">
        <h2>Crypto 充值</h2>
        <p>桌面端仅开放 Crypto 支付。输入人民币充值金额后，系统会生成稳定币收款地址；暂不提供提现和退款入口。</p>
        {error ? <p className="danger-text">{error}</p> : null}
        <div className="wallet-layout">
          <section className="wallet-form">
            <label>
              <span>充值金额（CNY）</span>
              <input type="number" min={minAmountCents / 100} max={maxAmountCents / 100} step="1" value={amountCny} onChange={(event) => setAmountCny(event.target.value)} />
            </label>
            <label>
              <span>支付链</span>
              <select value={selectedChain} onChange={(event) => handleChainChange(event.target.value)}>
                {chains.map((item) => (
                  <option key={item.chain} value={item.chain}>
                    {item.label || item.chain} {item.network ? `· ${item.network}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>支付代币</span>
              <select value={selectedToken} onChange={(event) => setSelectedToken(event.target.value)}>
                {tokenOptions.map((item) => (
                  <option key={`${selectedChain}-${item.token}`} value={item.token}>
                    {item.token} {item.bridgeCurrency ? `· ${item.bridgeCurrency}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <div className="wallet-preview">
              <span>预计入账</span>
              <strong>{formatPoints(previewPoints)} 点</strong>
              <small>最终到账以支付订单和点数流水为准。</small>
            </div>
            <div className="wallet-actions">
              <Button onClick={createRechargeOrder} disabled={!canCreate}>
                <Icon name="wallet" />
                {busy === "create" ? "创建中" : "创建充值订单"}
              </Button>
              <Button variant="ghost" onClick={() => loadWallet()} disabled={Boolean(busy)}>
                <Icon name="sync" />
                刷新余额
              </Button>
            </div>
          </section>
          <section className="wallet-order">
            {cryptoOrder ? (
              <>
                <div className="order-head">
                  <span>Crypto 订单</span>
                  <strong>{paymentStatusLabel(cryptoOrder.status)}</strong>
                </div>
                <div className="wallet-kv">
                  <span>主订单</span>
                  <strong>{paymentOrder?.orderNo || paymentOrder?.id?.slice(-10) || cryptoOrder.paymentOrderId?.slice(-10) || "--"}</strong>
                  <span>人民币金额</span>
                  <strong>{formatCnyFromCents(paymentOrder?.amountCents || cryptoOrder.amountCents)}</strong>
                  <span>订单点数</span>
                  <strong>{formatPoints(paymentOrder?.creditedPoints || paymentOrder?.points || cryptoOrder.creditedPoints || cryptoOrder.points)} 点</strong>
                  <span>支付金额</span>
                  <strong>{formatUsdLike(cryptoOrder.payAmount || cryptoOrder.amount, cryptoOrder.payCurrency || cryptoOrder.currency || "USD")}</strong>
                  <span>支付路线</span>
                  <strong>{cryptoOrder.chainName || cryptoOrder.payChain || selectedChain} · {cryptoOrder.payToken || cryptoOrder.token || selectedToken}</strong>
                  <span>过期时间</span>
                  <strong>{formatDate(cryptoOrder.expiresAt)}</strong>
                </div>
                {depositAddress ? (
                  <div className="copy-box">
                    <span>{depositAddress}</span>
                    <button onClick={copyAddress}>复制</button>
                  </div>
                ) : (
                  <p className="danger-text">支付地址尚未返回，请同步订单或联系支持确认收款信息。</p>
                )}
                <div className="wallet-actions">
                  <Button variant="ghost" onClick={() => syncCryptoOrder()} disabled={Boolean(busy)}>
                    <Icon name="sync" />
                    {busy === "sync" ? "同步中" : "同步订单"}
                  </Button>
                </div>
              </>
            ) : (
              <EmptyBlock title="暂无充值订单" body="填写金额并选择支付链、代币后，将创建一笔点数充值订单和对应 Crypto 支付订单。" />
            )}
          </section>
        </div>
      </div>
      <div className="wide-panel">
        <h2>点数流水</h2>
        {transactions.length ? (
          <div className="transaction-list">
            {transactions.map((item, index) => (
              <article key={item.id || `${item.createdAt}-${index}`} className="transaction-row">
                <div>
                  <strong>{creditTransactionLabel(item.type, item.reason)}</strong>
                  <span>{formatDate(item.createdAt)} · {item.refType || "credit"}</span>
                </div>
                <div>
                  <strong className={Number(item.amount || 0) >= 0 ? "positive-text" : "danger-text"}>
                    {Number(item.amount || 0) >= 0 ? "+" : ""}{formatPoints(item.amount)}
                  </strong>
                  <span>余额 {formatPoints(item.balanceAfter)}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyBlock title="暂无点数流水" body="充值、生成、回退、Workflow 收益都会在这里形成记录。" />
        )}
      </div>
    </div>
  );
}

function userIdOf(user?: CurrentUser | null) {
  return String(user?.id || user?._id || "").trim();
}

function AccountPanel({ onToast }: { onToast: (toast: Toast) => void }) {
  const [me, setMe] = useState<AuthMe | null>(null);
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAccount = () => {
    setLoading(true);
    setError("");
    Promise.all([
      settle(apiGet<AuthMe>("/auth/me", { auth: true })),
      settle(apiGet<CreditBalance>("/credits/balance", { auth: true }))
    ])
      .then(([meResult, balanceResult]) => {
        if (meResult.ok) setMe(meResult.value);
        if (balanceResult.ok) setBalance(balanceResult.value);
        const errors = [
          meResult.ok ? "" : `账户信息：${meResult.reason.message}`,
          balanceResult.ok ? "" : `钱包余额：${balanceResult.reason.message}`
        ].filter(Boolean);
        setError(errors.join("；"));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAccount();
  }, []);

  const user = me?.user || null;
  const userId = userIdOf(user);
  const copyUserId = () => {
    if (!userId) return;
    navigator.clipboard?.writeText(userId).catch(() => undefined);
    onToast({ title: "用户 ID 已复制", tone: "success" });
  };

  if (loading) return <LoadingBlock title="正在同步账户信息" />;

  return (
    <div className="workspace-grid account-layout">
      <div className="metric-card">
        <span>可用点数</span>
        <strong>{formatPoints(balance?.availableBalance ?? balance?.balance ?? user?.creditBalance)}</strong>
      </div>
      <div className="metric-card">
        <span>冻结点数</span>
        <strong>{formatPoints(balance?.frozenBalance ?? user?.creditFrozenBalance)}</strong>
      </div>
      <div className="metric-card">
        <span>账户状态</span>
        <strong>{user?.status || (me?.loggedIn ? "active" : "未登录")}</strong>
      </div>
      <div className="metric-card">
        <span>账户角色</span>
        <strong>{user?.role || "user"}</strong>
      </div>

      <div className="wide-panel account-profile-card">
        <div className="account-profile-head">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.nickname || "用户头像"} />
          ) : (
            <div className="account-avatar-fallback">{(user?.nickname || "S").slice(0, 1).toUpperCase()}</div>
          )}
          <div>
            <span className="eyebrow">账户</span>
            <h2>{user?.nickname || "seeFactory 用户"}</h2>
            <p>你可以使用 Google、X 或 Telegram 登录。同一个 Telegram 身份会在网页和小程序中保持一致。</p>
          </div>
        </div>
        {error ? <p className="danger-text">{error}</p> : null}
        <div className="wallet-kv">
          <span>用户 ID</span>
          <strong>{userId || "--"}</strong>
          <span>主身份 ID</span>
          <strong>{user?.primaryIdentityId || "--"}</strong>
          <span>注册时间</span>
          <strong>{formatDate(user?.createdAt)}</strong>
          <span>最后更新</span>
          <strong>{formatDate(user?.updatedAt)}</strong>
        </div>
        <div className="case-action-buttons">
          <Button variant="ghost" onClick={copyUserId} disabled={!userId}>
            <Icon name="copy" />
            复制用户 ID
          </Button>
          <Button variant="ghost" onClick={loadAccount}>
            <Icon name="sync" />
            刷新账户
          </Button>
        </div>
      </div>

      <div className="wide-panel">
        <div className="section-title-row">
          <div>
            <span className="eyebrow">登录身份</span>
            <h2>登录方式</h2>
          </div>
          <span className="section-note">如需调整登录方式，请联系 seeFactory 支持。</span>
        </div>
        <div className="identity-grid">
          {[
            ["Google", "google", "使用 Google 账号快速登录 seeFactory。"],
            ["X", "badge", "使用 X 账号授权登录 seeFactory。"],
            ["Telegram", "telegram", "使用 Telegram 账号登录，并与 Telegram 小程序中的身份保持一致。"]
          ].map(([title, icon, body]) => (
            <article className="identity-card" key={title}>
              <Icon name={icon} />
              <strong>{title}</strong>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="wide-panel">
        <AgreementLinks onToast={onToast} />
      </div>
    </div>
  );
}

function currentShareTicket() {
  const match = window.location.pathname.match(/^\/share\/([^/?#]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : "";
}

const dashboardTabRoutes: Record<string, string> = {
  overview: "/dashboard",
  create: "/dashboard/create",
  works: "/dashboard/works",
  showcase: "/dashboard/showcase",
  workflow: "/dashboard/workflow",
  cases: "/dashboard/workflow-cases",
  purchases: "/dashboard/workflow-purchases",
  income: "/dashboard/workflow-income",
  runs: "/dashboard/workflow-runs",
  models: "/dashboard/models",
  pricing: "/dashboard/pricing",
  wallet: "/dashboard/wallet",
  help: "/dashboard/help",
  account: "/dashboard/account"
};

const dashboardRouteTabs: Record<string, string> = Object.entries(dashboardTabRoutes).reduce<Record<string, string>>(
  (routes, [tab, route]) => {
    routes[route] = tab;
    return routes;
  },
  {
    "/dashboard/purchases": "purchases",
    "/dashboard/cases": "cases",
    "/dashboard/runs": "runs",
    "/dashboard/income": "income",
    "/dashboard/workflows": "workflow",
    "/dashboard/workflow": "workflow",
    "/dashboard/model-capabilities": "models",
    "/dashboard/pricing-help": "pricing"
  }
);

const publicSectionRoutes: Record<string, string> = {
  "/tools": "tools",
  "/cases": "cases",
  "/gallery": "showcase",
  "/showcase": "showcase",
  "/models": "models",
  "/pricing": "pricing",
  "/help": "help"
};

function normalizedPathname(pathname = window.location.pathname) {
  const normalized = pathname.replace(/\/+$/, "");
  return normalized || "/";
}

function decodePathSegment(value = "") {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function pathSegments(pathname = window.location.pathname) {
  return normalizedPathname(pathname).split("/").filter(Boolean);
}

function dashboardTabFromPath(pathname = window.location.pathname) {
  const normalized = normalizedPathname(pathname);
  const exact = dashboardRouteTabs[normalized];
  if (exact) return exact;
  const segments = pathSegments(normalized);
  if (segments[0] !== "dashboard") return "";
  if (segments[1] === "tool" && segments[2]) return "create";
  if (segments[1] === "works" && segments[2]) return "works";
  if (segments[1] === "workflows" && segments[2] && ["editor", "run"].includes(segments[3] || "")) return "workflow";
  return "";
}

function dashboardPathForTab(tab: string) {
  return dashboardTabRoutes[tab] || dashboardTabRoutes.overview;
}

function currentDashboardToolKey(pathname = window.location.pathname) {
  const segments = pathSegments(pathname);
  return segments[0] === "dashboard" && segments[1] === "tool" && segments[2] ? decodePathSegment(segments[2]) : "";
}

function currentDashboardWorkId(pathname = window.location.pathname) {
  const segments = pathSegments(pathname);
  return segments[0] === "dashboard" && segments[1] === "works" && segments[2] ? decodePathSegment(segments[2]) : "";
}

function currentDashboardWorkflowId(pathname = window.location.pathname) {
  const segments = pathSegments(pathname);
  return segments[0] === "dashboard" && segments[1] === "workflows" && segments[2] ? decodePathSegment(segments[2]) : "";
}

function currentDashboardWorkflowMode(pathname = window.location.pathname): "editor" | "run" {
  const segments = pathSegments(pathname);
  return segments[0] === "dashboard" && segments[1] === "workflows" && segments[3] === "run" ? "run" : "editor";
}

function publicSectionFromPath(pathname = window.location.pathname) {
  return publicSectionRoutes[normalizedPathname(pathname)] || "";
}

function workflowCasePath(caseId?: string) {
  const path = dashboardTabRoutes.cases;
  return caseId ? `${path}?caseId=${encodeURIComponent(caseId)}` : path;
}

function currentWorkflowCaseId() {
  return new URLSearchParams(window.location.search).get("caseId") || "";
}

function currentDashboardPath() {
  return `${normalizedPathname()}${window.location.search}${window.location.hash}`;
}

function replaceBrowserPath(path: string) {
  const nextUrl = new URL(path, window.location.origin);
  window.history.replaceState({}, "", `${normalizedPathname(nextUrl.pathname)}${nextUrl.search}${nextUrl.hash}`);
}

function pushBrowserPath(path: string) {
  const nextUrl = new URL(path, window.location.origin);
  const currentPath = `${normalizedPathname()}${window.location.search}${window.location.hash}`;
  const nextPath = `${normalizedPathname(nextUrl.pathname)}${nextUrl.search}${nextUrl.hash}`;
  if (currentPath === nextPath) return;
  window.history.pushState({}, "", path);
}

function ShareWorkPage({
  ticket,
  authed,
  onLogin,
  onOpenDashboard,
  onToast,
  pendingAction,
  onRequireAuthAction,
  onActionConsumed
}: {
  ticket: string;
  authed: boolean;
  onLogin: () => void;
  onOpenDashboard: () => void;
  onToast: (toast: Toast) => void;
  pendingAction?: PendingPublicAction | null;
  onRequireAuthAction?: (action: PendingPublicAction) => void;
  onActionConsumed?: () => void;
}) {
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const loadShareWork = () => {
    setLoading(true);
    setError("");
    apiGet<Work>(`/works/share/${encodeURIComponent(ticket)}`, { auth: authed })
      .then(setWork)
      .catch((err) => setError(err.message || "分享作品不存在或已失效"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadShareWork();
  }, [ticket, authed]);

  const downloadSharedWork = () => {
    if (!work?.id) return;
    if (!authed) {
      if (onRequireAuthAction) {
        onRequireAuthAction({ type: "share-download", workId: work.id, ticket });
      } else {
        onLogin();
      }
      onToast({ title: "请先登录后再下载作品", tone: "info" });
      return;
    }
    if (work.downloadEnabled === false) {
      onToast({ title: "该分享作品已关闭下载权限", tone: "danger" });
      return;
    }
    setBusy("download");
    apiGet<DownloadUrl>(`/works/${work.id}/download-url?shareTicket=${encodeURIComponent(ticket)}`, { auth: true })
      .then((data) => {
        if (data.url) {
          openExternalUrl(data.url);
          onToast({ title: data.signed ? "已生成临时下载链接" : "已打开下载链接", tone: "success" });
        } else {
          onToast({ title: "该作品暂未返回下载地址", tone: "danger" });
        }
      })
      .catch((err) => onToast({ title: err.message || "下载失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  const copySharedPrompt = () => {
    const prompt = String(work?.prompt || "").trim();
    if (!prompt) {
      onToast({ title: "该分享作品没有提示词记录", tone: "danger" });
      return;
    }
    navigator.clipboard?.writeText(prompt).catch(() => undefined);
    onToast({ title: "提示词已复制", tone: "success" });
  };

  const rerunSharedWork = () => {
    if (!work?.id) return;
    if (!authed) {
      if (onRequireAuthAction) {
        onRequireAuthAction({ type: "share-rerun", workId: work.id, ticket });
      } else {
        onLogin();
      }
      onToast({ title: "请先登录后再同款创作", tone: "info" });
      return;
    }
    if (!work.toolKey || !work.prompt) {
      onToast({ title: "该分享作品缺少同款生成参数", tone: "danger" });
      return;
    }
    setBusy("rerun");
    apiPost<GenerationSubmitResult>("/generation-tasks", {
      toolKey: work.toolKey,
      modeKey: work.modeKey,
      prompt: work.prompt,
      params: work.params || {},
      inputAssets: work.inputAssets || {}
    }, { auth: true })
      .then((result) => {
        onToast({ title: `同款生成任务已创建：${result.task.id.slice(-6)}`, tone: "success" });
        onOpenDashboard();
      })
      .catch((err) => onToast({ title: err.message || "同款生成失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  const toggleFavoriteSharedWork = () => {
    if (!work?.id) return;
    if (!authed) {
      if (onRequireAuthAction) {
        onRequireAuthAction({ type: "share-favorite", workId: work.id, ticket });
      } else {
        onLogin();
      }
      onToast({ title: "请先登录后再收藏作品", tone: "info" });
      return;
    }
    setBusy("favorite");
    const request = work.favorited
      ? apiDelete<Work>(`/works/${work.id}/favorite`, { auth: true })
      : apiPost<Work>(`/works/${work.id}/favorite`, {}, { auth: true });
    request
      .then((next) => {
        setWork((current) => current ? { ...current, ...next, author: current.author } : next);
        onToast({ title: next.favorited ? "已收藏作品" : "已取消收藏", tone: "success" });
      })
      .catch((err) => onToast({ title: err.message || "收藏操作失败", tone: "danger" }))
      .finally(() => setBusy(""));
  };

  useEffect(() => {
    if (!authed || !work?.id || pendingAction?.ticket !== ticket) return;
    if (pendingAction.type !== "share-download" && pendingAction.type !== "share-rerun" && pendingAction.type !== "share-favorite") return;
    onActionConsumed?.();
    if (pendingAction.type === "share-download") {
      downloadSharedWork();
    } else if (pendingAction.type === "share-rerun") {
      rerunSharedWork();
    } else {
      toggleFavoriteSharedWork();
    }
  }, [authed, work?.id, pendingAction, ticket]);

  if (loading) return <LoadingBlock title="正在打开分享作品" />;

  return (
    <section className="content-band share-work-page">
      {error ? (
        <EmptyBlock title="分享作品不可访问" body={error} />
      ) : work ? (
        <div className="share-work-layout">
          <div>
            <span className="eyebrow">分享作品</span>
            <h1>{workTitle(work)}</h1>
            <p>这是 seeFactory 用户分享的作品。你可以查看提示词和参数快照；下载与同款创作需要登录，并会遵循作品作者设置的权限。</p>
            <div className="mini-meta">
              <span>{work.author?.nickname || "seeFactory 用户"}</span>
              <span>{work.toolKey || "创作工具"}</span>
              <span>{work.modeKey || "默认模式"}</span>
              <span>{formatDate(work.createdAt)}</span>
              <span>{Number(work.likeCount || 0)} 收藏</span>
            </div>
            <div className="work-prompt-panel">
              <span>提示词</span>
              <p>{work.prompt || "该分享作品没有提示词记录。"}</p>
            </div>
            <details className="params-panel">
              <summary>参数快照</summary>
              <ParamSnapshot params={work.params} />
            </details>
            <div className="case-action-buttons">
              <Button variant="ghost" onClick={copySharedPrompt}>
                <Icon name="copy" />
                复制提示词
              </Button>
              <Button variant="ghost" onClick={downloadSharedWork} disabled={Boolean(busy) || work.downloadEnabled === false}>
                <Icon name="download" />
                下载
              </Button>
              <Button variant="ghost" onClick={toggleFavoriteSharedWork} disabled={Boolean(busy)}>
                <Icon name="badge" />
                {work.favorited ? "取消收藏" : "收藏作品"}
              </Button>
              <Button onClick={rerunSharedWork} disabled={Boolean(busy)}>
                <Icon name="play" />
                同款创作
              </Button>
            </div>
          </div>
          <div className="generation-preview">
            {workPreviewUrl(work) ? (
              isVideoUrl(workPreviewUrl(work)) || work.contentType === "video" ? (
                <video src={workPreviewUrl(work)} controls preload="metadata" />
              ) : (
                <img src={workPreviewUrl(work)} alt={workTitle(work)} loading="lazy" />
              )
            ) : (
              <EmptyBlock title="暂无预览" body="该分享作品暂未返回可预览资源。" />
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function App() {
  const data = usePublicData();
  const shareTicket = currentShareTicket();
  const [authed, setAuthed] = useState(() => Boolean(localStorage.getItem(tokenKey)));
  const [dashboardTab, setDashboardTab] = useState(() => dashboardTabFromPath() || "overview");
  const [pendingDashboardTab, setPendingDashboardTab] = useState(() => dashboardTabFromPath());
  const [pendingDashboardPath, setPendingDashboardPath] = useState(() => (dashboardTabFromPath() ? currentDashboardPath() : ""));
  const [view, setView] = useState<"public" | "dashboard">(() => {
    const initialTab = dashboardTabFromPath();
    return initialTab && !shareTicket && Boolean(localStorage.getItem(tokenKey)) ? "dashboard" : "public";
  });
  const [authOpen, setAuthOpen] = useState(() => {
    const initialTab = dashboardTabFromPath();
    return Boolean(initialTab && !shareTicket && !localStorage.getItem(tokenKey));
  });
  const [pendingPublicAction, setPendingPublicAction] = useState<PendingPublicAction | null>(() => readPendingPublicAction());
  const [toast, setToast] = useState<Toast | null>(null);

  const toastApi = (next: Toast) => {
    setToast(next);
    window.setTimeout(() => setToast(null), 2400);
  };

  const openDashboard = (tab = dashboardTab, mode: "push" | "replace" = "push", pathOverride = "") => {
    const nextTab = tab || "overview";
    setPendingDashboardTab("");
    setPendingDashboardPath("");
    setDashboardTab(nextTab);
    setView("dashboard");
    const path = pathOverride || dashboardPathForTab(nextTab);
    if (mode === "replace") {
      replaceBrowserPath(path);
    } else {
      pushBrowserPath(path);
    }
  };

  const requestDashboard = (tab = dashboardTab, pathOverride = "") => {
    const nextTab = tab || "overview";
    setDashboardTab(nextTab);
    if (!authed) {
      setPendingDashboardTab(nextTab);
      const path = pathOverride || dashboardPathForTab(nextTab);
      setPendingDashboardPath(path);
      pushBrowserPath(path);
      setAuthOpen(true);
      return;
    }
    openDashboard(nextTab, "push", pathOverride);
  };

  const rememberPublicAction = (action: PendingPublicAction) => {
    savePendingPublicAction(action);
    setPendingPublicAction(action);
    setAuthOpen(true);
  };

  const consumePendingPublicAction = () => {
    clearPendingPublicAction();
    setPendingPublicAction(null);
  };

  const completeAuth = (result: AuthResult, provider: string) => {
    const targetTab = pendingDashboardTab || dashboardTabFromPath() || dashboardTab || "overview";
    saveAuthResult(result);
    setAuthed(true);
    setAuthOpen(false);
    setPendingDashboardTab("");
    const targetPath = pendingDashboardPath || dashboardPathForTab(targetTab);
    setPendingDashboardPath("");
    const publicAction = pendingPublicAction || readPendingPublicAction();
    if (publicAction) {
      setPendingPublicAction(publicAction);
      setView("public");
      if ((publicAction.type === "share-download" || publicAction.type === "share-rerun" || publicAction.type === "share-favorite") && publicAction.ticket) {
        replaceBrowserPath(`/share/${encodeURIComponent(publicAction.ticket || "")}`);
      } else {
        replaceBrowserPath("/");
      }
      toastApi({ title: authSuccessText(provider, result), tone: "success" });
      return;
    }
    setDashboardTab(targetTab);
    setView("dashboard");
    replaceBrowserPath(targetPath);
    toastApi({ title: authSuccessText(provider, result), tone: "success" });
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    const oauthError = url.searchParams.get("error") || url.searchParams.get("error_description");
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (oauthError) {
      removeOAuthQuery();
      toastApi({ title: `X 授权已取消或失败：${oauthError}`, tone: "danger" });
      return;
    }
    if (!code || !state) return;
    const codeVerifier = localStorage.getItem(xCodeVerifierKey);
    const redirectUri = localStorage.getItem(xRedirectUriKey) || resolveXRedirectUri();
    localStorage.removeItem(xCodeVerifierKey);
    localStorage.removeItem(xRedirectUriKey);
    removeOAuthQuery();
    if (!codeVerifier) {
      toastApi({ title: "X 登录状态已过期，请重新授权", tone: "danger" });
      return;
    }
    apiPost<AuthResult>("/auth/h5/x-login", { code, state, codeVerifier, redirectUri }, { runtime: "h5-x" })
      .then((result) => completeAuth(result, "X"))
      .catch((error) => toastApi({ title: error.message || "X 登录失败", tone: "danger" }));
  }, []);

  useEffect(() => {
    const syncRoute = () => {
      const routeTab = dashboardTabFromPath();
      const routeShareTicket = currentShareTicket();
      if (routeShareTicket) {
        setView("public");
        setPendingDashboardTab("");
        return;
      }
      if (!routeTab) {
        setView("public");
        setPendingDashboardTab("");
        return;
      }
      setDashboardTab(routeTab);
      if (localStorage.getItem(tokenKey)) {
        setView("dashboard");
        setAuthOpen(false);
        setPendingDashboardPath("");
      } else {
        setView("public");
        setPendingDashboardTab(routeTab);
        setPendingDashboardPath(currentDashboardPath());
        setAuthOpen(true);
      }
    };
    window.addEventListener("popstate", syncRoute);
    return () => window.removeEventListener("popstate", syncRoute);
  }, []);

  const logout = () => {
    clearAuthResult();
    clearPendingPublicAction();
    setAuthed(false);
    setPendingDashboardTab("");
    setPendingDashboardPath("");
    setPendingPublicAction(null);
    setView("public");
    replaceBrowserPath("/");
    toastApi({ title: "已退出工作台", tone: "info" });
  };

  const start = () => {
    requestDashboard("create");
  };

  return (
    <>
      {view === "dashboard" && authed ? (
        <DashboardShell
          appConfig={data.appConfig}
          tools={data.tools}
          cases={data.cases}
          models={data.models}
          components={data.components}
          customerService={data.customerService}
          faqs={data.faqs}
          rechargePolicy={data.rechargePolicy}
          active={dashboardTab}
          onNavigate={(tab, path) => openDashboard(tab, "push", path)}
          onLogout={logout}
          onToast={toastApi}
        />
      ) : (
        <PublicShell appConfig={data.appConfig} authed={authed} onLogin={() => setAuthOpen(true)} onOpenDashboard={() => requestDashboard("overview")} onToast={toastApi}>
          {shareTicket ? (
            <ShareWorkPage
              ticket={shareTicket}
              authed={authed}
              onLogin={() => setAuthOpen(true)}
              onOpenDashboard={() => requestDashboard("create")}
              onToast={toastApi}
              pendingAction={pendingPublicAction}
              onRequireAuthAction={rememberPublicAction}
              onActionConsumed={consumePendingPublicAction}
            />
          ) : (
            <PublicHome
              data={data}
              authed={authed}
              onStart={start}
              onLogin={() => setAuthOpen(true)}
              onToast={toastApi}
              pendingAction={pendingPublicAction}
              onRequireAuthAction={rememberPublicAction}
              onActionConsumed={consumePendingPublicAction}
              onOpenDashboard={(tab, path) => requestDashboard(tab, path)}
            />
          )}
        </PublicShell>
      )}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={completeAuth}
        onToast={toastApi}
      />
      <ToastHost toast={toast} />
    </>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
