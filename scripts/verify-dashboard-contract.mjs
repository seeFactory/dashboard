import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve("src/main.tsx"), "utf8");
const styles = readFileSync(resolve("src/styles.css"), "utf8");
const packageSource = readFileSync(resolve("package.json"), "utf8");
const html = readFileSync(resolve("index.html"), "utf8");

function git(args) {
  return execFileSync("git", args, {
    cwd: resolve("."),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

assert.equal(git(["rev-parse", "--is-inside-work-tree"]), "true", "dashboard/ must be the real Dashboard git worktree.");
assert.equal(git(["remote", "get-url", "origin"]), "git@github.com:seeFactory/dashboard.git", "Dashboard origin remote must point to seeFactory/dashboard.git.");
assert.ok(packageSource.includes('"packageManager": "pnpm@10.13.1"'), "Dashboard must keep the pnpm packageManager contract.");
assert.ok(existsSync(resolve("pnpm-lock.yaml")), "Dashboard must track pnpm-lock.yaml for reproducible installs.");
assert.ok(git(["ls-files", "--error-unmatch", "pnpm-lock.yaml"]), "Dashboard pnpm-lock.yaml must be tracked by git.");

for (const asset of ["public/home-bg.mp4", "public/home-bg-poster.jpg"]) {
  assert.ok(existsSync(resolve(asset)), `Dashboard default home media asset must exist: ${asset}.`);
}

for (const pattern of [
  '<html lang="zh-CN">',
  "<title>seeFactory Studio | AI 图像视频创作工作台</title>",
  'name="description"',
  "AI 图像、视频和 Workflow 创作工作台",
  'name="keywords"',
  'name="robots" content="index,follow"',
  'name="theme-color" content="#050710"',
  'name="application-name" content="seeFactory Studio"',
  'rel="canonical" href="https://seefactory.xyz/"',
  'rel="icon" type="image/png" href="/logo.png"',
  'property="og:locale" content="zh_CN"',
  'property="og:type" content="website"',
  'property="og:site_name" content="seeFactory"',
  'property="og:title" content="seeFactory Studio | AI 图像视频创作工作台"',
  'property="og:url" content="https://seefactory.xyz/"',
  'property="og:image" content="https://seefactory.xyz/home-bg-poster.jpg"',
  'name="twitter:card" content="summary_large_image"',
  'name="twitter:title" content="seeFactory Studio | AI 图像视频创作工作台"',
  'name="twitter:image" content="https://seefactory.xyz/home-bg-poster.jpg"',
  'type="application/ld+json"',
  '"@type": "WebApplication"',
  '"applicationCategory": "MultimediaApplication"',
  '"priceCurrency": "CNY"',
  "1 CNY = 7 点",
  "Crypto 充值点数"
]) {
  htmlIncludes(pattern, `Dashboard public website SEO/share shell must include ${pattern}.`);
}

function includes(pattern, message) {
  assert.ok(source.includes(pattern), message);
}

function excludes(pattern, message) {
  assert.ok(!source.includes(pattern), message);
}

function styleIncludes(pattern, message) {
  assert.ok(styles.includes(pattern), message);
}

function styleExcludes(pattern, message) {
  assert.ok(!styles.includes(pattern), message);
}

function htmlIncludes(pattern, message) {
  assert.ok(html.includes(pattern), message);
}

function styleSection(startMarker, endMarker) {
  const start = styles.indexOf(startMarker);
  assert.ok(start >= 0, `Dashboard styles must include section: ${startMarker}.`);
  const end = endMarker ? styles.indexOf(endMarker, start + startMarker.length) : -1;
  return styles.slice(start, end >= 0 ? end : undefined);
}

for (const pattern of [
  "fallbackTools",
  "fallbackCases",
  "fallbackModels",
  "fallbackCovers",
  "newapi.gpt-image",
  "newapi.veo",
  "jimeng",
  "GPT Image 2",
  "本地兜底",
  "images.unsplash.com"
]) {
  excludes(pattern, `Dashboard must not contain hardcoded demo business data: ${pattern}.`);
}

for (const pattern of [
  "type PublicAppConfig",
  'apiGet<PublicAppConfig>("/app/config")',
  'apiGet<Tool[]>("/tools")',
  'apiGet<PageData<CaseContent>>("/case-contents?caseType=workflow&pageSize=8")',
  'apiGet<PageData<Work>>("/gallery/works?pageSize=12")',
  'apiGet<PageData<ModelCapability>>("/models?pageSize=12")',
  'apiGet<PageData<ComponentDefinition>>("/components?pageSize=100&clientRuntime=h5-google")',
  'apiGet<CustomerServiceConfig>("/customer-service")',
  'apiGet<{ list: FaqItem[] }>("/faqs")',
  'apiGet<RechargePolicy>("/credits/recharge-settings")',
  "setAppConfig(appConfigResult.ok ? appConfigResult.value : null)",
  "setTools(toolResult.ok ? toolResult.value : [])",
  "setCases(caseResult.ok ? caseResult.value.list || [] : [])",
  "setGalleryWorks(galleryResult.ok ? galleryResult.value.list || [] : [])",
  "setModels(modelResult.ok ? modelResult.value.list || [] : [])",
  "setComponents(componentResult.ok ? componentResult.value.list || [] : [])",
  "setCustomerService(customerResult.ok ? customerResult.value : null)",
  "setFaqs(faqResult.ok ? faqResult.value.list || [] : [])",
  "setRechargePolicy(rechargeResult.ok ? rechargeResult.value : null)",
  "function resolveLogoUrl",
  "function HeroBackground",
  "appConfig?.brand?.name",
  "home?.videoUrl",
  "暂无公开工具",
  "暂无公开 Workflow 案例",
  "暂无公开作品",
  "暂无可用模型",
  "暂无组件定义"
]) {
  includes(pattern, `Dashboard backend-driven public data contract must include ${pattern}.`);
}

for (const pattern of [
  "/auth/h5/google-login",
  "/auth/h5/x/authorize-url",
  "/auth/h5/x-login",
  "/auth/h5/telegram-login",
  "VITE_SEEFACTORY_GOOGLE_CLIENT_ID",
  "VITE_SEEFACTORY_X_REDIRECT_URI",
  "VITE_SEEFACTORY_TELEGRAM_BOT_USERNAME",
  "window.__SEEFACTORY_DASHBOARD_TELEGRAM_AUTH__",
  "localStorage.setItem(refreshTokenKey, result.refreshToken)"
]) {
  includes(pattern, `Dashboard H5 login contract must include ${pattern}.`);
}

for (const pattern of [
  "onPreviewLogin",
  "previewLogin",
  "local-preview-token",
  "本地预览登录"
]) {
  excludes(pattern, `Dashboard H5 login contract must not include preview-login bypass: ${pattern}.`);
}

for (const pattern of [
  "const dashboardTabRoutes",
  'overview: "/dashboard"',
  'create: "/dashboard/create"',
  'purchases: "/dashboard/workflow-purchases"',
  'income: "/dashboard/workflow-income"',
  'runs: "/dashboard/workflow-runs"',
  'models: "/dashboard/models"',
  'pricing: "/dashboard/pricing"',
  '"/dashboard/model-capabilities": "models"',
  '"/dashboard/pricing-help": "pricing"',
  "const publicSectionRoutes",
  '"/models": "models"',
  '"/pricing": "pricing"',
  "function decodePathSegment",
  "function pathSegments",
  'segments[1] === "tool"',
  'segments[1] === "works"',
  'segments[1] === "workflows"',
  "function currentDashboardToolKey",
  "function currentDashboardWorkId",
  "function currentDashboardWorkflowId",
  "function currentDashboardWorkflowMode",
  "function currentDashboardPath",
  "const [pendingDashboardPath, setPendingDashboardPath]",
  "setPendingDashboardPath(currentDashboardPath())",
  "replaceBrowserPath(targetPath)",
  "function publicSectionFromPath",
  "document.getElementById(publicSection)?.scrollIntoView",
  "function dashboardTabFromPath",
  "function dashboardPathForTab",
  "function workflowCasePath",
  "function currentWorkflowCaseId",
  "caseId=${encodeURIComponent(caseId)}",
  "const path = dashboardPathForTab(nextTab)",
  "setPendingDashboardPath(path)",
  "pushBrowserPath(path)",
  "window.addEventListener(\"popstate\", syncRoute)",
  "setPendingDashboardTab(routeTab)",
  "onNavigate={(tab, path) => openDashboard(tab, \"push\", path)}",
  "requestDashboard(\"create\")"
]) {
  includes(pattern, `Dashboard protected workspace routing contract must include ${pattern}.`);
}

for (const pattern of [
  "initialToolKey={routeToolKey}",
  "initialWorkId={routeWorkId}",
  "initialWorkflowId={routeWorkflowId}",
  "initialRouteMode={routeWorkflowMode}",
  "function CreatePanel({",
  "initialToolKey = \"\"",
  "targetTool.toolKey === selectedToolKey",
  "function WorksPanel({",
  "initialWorkId = \"\"",
  "apiGet<Work>(`/works/${initialWorkId}`",
  "function WorkflowConsole({",
  "initialWorkflowId = \"\"",
  "initialRouteMode = \"editor\"",
  "apiGet<WorkflowDraft>(`/workflows/${initialWorkflowId}`",
  "已打开 Workflow 运行入口"
]) {
  includes(pattern, `Dashboard dynamic deep-link target selection contract must include ${pattern}.`);
}

for (const pattern of [
  "function buildWorkflowGraph",
  "function buildWorkflowRunForm",
  "type WorkflowPublishPolicy",
  "workflowPolicy?: WorkflowPublishPolicy",
  "workflowPolicy={appConfig?.workflowPolicy",
  "priceMinPoints",
  "priceMaxPoints",
  "trialLimitMaxPerUser",
  "validateWorkflowGraph(graph",
  'apiPost<WorkflowDraft>("/workflows"',
  "apiPut<WorkflowDraft>(`/workflows/${draft.id}/draft`",
  "`/workflows/${workflowId}/validate`",
  "`/workflows/${workflowId}/estimate`",
  'apiGet<WorkflowDraft[]>("/workflows"',
  "`/workflows/${target.id}/export`",
  'apiPost<WorkflowDraft>("/workflows/import"',
  "`/workflows/${saved.id}/run`",
  "`/workflows/${saved.id}/publish-case`",
  'apiGet<PageData<CaseContent>>("/workflow-cases/mine?pageSize=12"',
  "`/workflow-cases/${caseContent.id}/hide`",
  "`/workflow-cases/${caseContent.id}/delete`",
  "const hidePublishedCase",
  "function workflowCaseLifecycle",
  "我的发布",
  "停止公开",
  "已停止公开展示和新增购买",
  "publishAgreementAccepted: true",
  "licenseMode: mode",
  "trialLimitPerUser",
  "nodeEstimates",
  "testPrompt",
  'apiGet<PageData<WorkflowRun>>("/workflow-runs?pageSize=30"',
  "`/workflow-runs/${item.id}`",
  "type WorkflowRunNode",
  "workLockedUntilPurchase",
  "workDownloadEnabled",
  "workIsTrialOutput",
  "run-detail-panel",
  "workflowNodeResultUrls",
  "workflowNodeCoverUrl",
  "workflowNodeWorkId",
  'apiGet<Work>(`/works/${workId}`',
  'apiGet<DownloadUrl>(`/works/${workId}/download-url`',
  "node-output-preview",
  "run-node-actions",
  "购买后下载",
  "该试运行节点作品需要购买对应 Workflow 后才能下载或发布",
  "downloadJsonFile",
  "type WorkflowEditorNode",
  "function createEditorNode",
  "function nodesFromWorkflowGraph",
  "function exposedFieldsForNode",
  "dragComponentKey",
  "dragNodeKey",
  "canvasDropActive",
  "handleCanvasDragOver",
  "handleCanvasDrop",
  "setDragComponentKey(component.componentKey)",
  "workflow-drop-zone",
  "dropNodeOn",
  "node-config-panel",
  "exposed-fields-grid",
  "overrides.promptTemplate || \"{{prompt}}\""
]) {
  includes(pattern, `Dashboard workflow authoring contract must include ${pattern}.`);
}

for (const pattern of [
  'apiGet<PageData<CaseContent>>("/workflow-cases?pageSize=30"',
  "`/workflow-cases/${item.id}`",
  "`/workflow-cases/${item.id}/purchase-status`",
  "`/workflow-cases/${selectedCase.id}/trial-run`",
  "`/workflow-cases/${selectedCase.id}/run`",
  "`/workflow-cases/${selectedCase.id}/purchase`",
  "`/workflow-cases/${selectedCase.id}/clone`",
  "`/workflow-cases/${selectedCase.id}/export`",
  'apiGet<PageData<WorkflowPurchase>>("/workflow-purchases?pageSize=30"',
  "`/workflow-cases/${item.caseContentId}/run`",
  "type WorkflowRunForm",
  "function WorkflowRunFormFields",
  "function buildWorkflowRunPayload",
  "function workflowCanRun",
  "workflowBlockedReason(status)",
  "runBlockedReason",
  "canRun?: boolean",
  "type UploadPolicy",
  "type WorkflowRunUploadState",
  "function uploadWorkflowRunAssets",
  'apiPost<UploadPolicy>("/assets/upload-token"',
  'apiPost<UploadedAsset>("/assets"',
  "input.inputAssetIds = inputAssetIds",
  "input.inputAssets = inputAssets",
  "isWorkflowUploadBusy",
  "initialWorkflowRunValues",
  "buildWorkflowRunPayload(selectedCase.runForm",
  "buildWorkflowRunPayload(runForm, runValuesById[item.id]",
  "<WorkflowRunFormFields",
  "function WorkflowCasePanel",
  "currentWorkflowCaseId",
  "const targetCaseId = currentWorkflowCaseId()",
  "正在同步目标案例",
  "onOpenPurchases",
  "case-action-layout",
  "workflow-entitlement-card",
  "进入已购模板库",
  "购买后获得该发布版本的永久运行权",
  "购买不包含 graph、克隆或导出权限",
  "case-run-form",
  "闭源付费案例购买后仅获得运行权",
  "已购买该 Workflow"
]) {
  includes(pattern, `Dashboard workflow case marketplace contract must include ${pattern}.`);
}
assert.ok(!source.includes("return fields.length ? fields : [{"), "Dashboard must not invent fallback workflow runForm fields when backend has not exposed them.");
for (const pattern of [
  "type WorkflowCreatorIncomeSummary",
  "function summarizeWorkflowIncome",
  "function IncomePanel",
  'apiGet<WorkflowCreatorIncomeSummary>("/workflow-creator-income/summary"',
  'apiGet<PageData<WorkflowIncome>>("/workflow-creator-income?pageSize=30"',
  "totalIncomePoints",
  "totalPlatformFeePoints",
  "availablePoints",
  "frozenPoints",
  "availableCount",
  "frozenCount",
  "purchaseSummary",
  "runSummary",
  "caseSummary",
  "uniqueBuyerCount",
  "uniqueRunnerCount",
  "income-layout",
  "income-policy-card",
  "income-insight-grid",
  "income-table"
]) {
  includes(pattern, `Dashboard creator income contract must include ${pattern}.`);
}
for (const pattern of [
  "作者未开放可调整运行参数",
  "发布版本中锁定的默认配置"
]) {
  includes(pattern, `Dashboard empty workflow runForm notice must include ${pattern}.`);
}

for (const pattern of [
  'apiGet<CreditBalance>("/credits/balance"',
  'apiGet<RechargePolicy>("/credits/recharge-settings"',
  'apiGet<WalletRechargeOptions>("/wallet/recharge-options"',
  'apiGet<PageData<CreditTransaction>>("/credits/transactions?pageSize=12"',
  'apiPost<PaymentOrder>("/credits/recharge-orders"',
  'apiPost<CryptoPayment>("/payments/crypto-orders"',
  "`/payments/crypto-orders/${cryptoOrder.id}`",
  "`/payments/orders/${paymentOrder.id}`",
  "clientRuntime: \"h5-google\"",
  "paymentStatusLabel",
  "Crypto 充值订单已创建",
  "点数流水"
]) {
  includes(pattern, `Dashboard wallet and crypto recharge contract must include ${pattern}.`);
}

for (const pattern of [
  "function toolRunForm",
  "function selectedToolMode",
  "function toolRatioResolutionMap",
  'schemaVersion: "seeFactory.toolRunForm.v1"',
  'apiPost<GenerationSubmitResult>("/generation-tasks"',
  "`/generation-tasks/${activeTask.id}`",
  "`/generation-tasks/${activeTask.id}/cancel`",
  "apiGet<PageData<Work>>(`/works${query}`",
  "`/works/${work.id}/download-url`",
  "`/works/${work.id}/unpublish-gallery`",
  "`/works/${work.id}/publish-gallery`",
  "inputAssetIds: input.inputAssetIds",
  "inputAssets: input.inputAssets",
  "generationPreviewUrl",
  "recent-work-list",
  "发布广场"
]) {
  includes(pattern, `Dashboard tool generation contract must include ${pattern}.`);
}

for (const pattern of [
  '["works", "我的作品", "gallery"]',
  "function WorksPanel",
  'apiGet<PageData<Work>>(`/works?${params.toString()}`',
  "`/works/${work.id}`",
  "`/works/${work.id}/download-url`",
  "`/works/${work.id}/share-ticket`",
  "`/works/${work.id}/unpublish-gallery`",
  "`/works/${work.id}/publish-gallery`",
  'apiPost<GenerationSubmitResult>("/generation-tasks"',
  'apiPost<{ deleted?: number }>("/works/clear-failed"',
  "apiDelete<boolean>(`/works/${work.id}`",
  "lockedUntilPurchase",
  "sourceCaseContentId?: string",
  "generatedByWorkflowRunId?: string",
  "onOpenWorkflowCase",
  "locked-work-card",
  "onOpenWorkflowCase(selectedWork.sourceCaseContentId)",
  "work-prompt-panel",
  "params-panel"
]) {
  includes(pattern, `Dashboard works library contract must include ${pattern}.`);
}

for (const pattern of [
  '["showcase", "公开广场", "gallery"]',
  "function GalleryPanel",
  "`/gallery/works?${params.toString()}`",
  "`/gallery/works/${work.id}`",
  "apiGet<DownloadUrl>(`/works/${work.id}/download-url`, { auth: true })",
  'apiPost<GenerationSubmitResult>("/generation-tasks"',
  "onToast({ title: \"请先登录后再下载作品\", tone: \"info\" })",
  "onToast({ title: \"请先登录后再同款创作\", tone: \"info\" })",
  "公开提示词",
  "同款参数快照",
  "同款创作",
  "downloadEnabled === false",
  "galleryWorks"
]) {
  includes(pattern, `Dashboard public gallery contract must include ${pattern}.`);
}

for (const pattern of [
  "function AccountPanel",
  'apiGet<AuthMe>("/auth/me", { auth: true })',
  'apiGet<CreditBalance>("/credits/balance", { auth: true })',
  "用户端不开放解绑",
  "Google Identity Services",
  "X OAuth2 PKCE",
  "Telegram Login Widget",
  "复制用户 ID",
  "协议与规则"
]) {
  includes(pattern, `Dashboard account settings contract must include ${pattern}.`);
}

for (const pattern of [
  "function ShareWorkPage",
  "function currentShareTicket",
  "`/works/share/${encodeURIComponent(ticket)}`",
  "apiGet<DownloadUrl>(`/works/${work.id}/download-url?shareTicket=${encodeURIComponent(ticket)}`, { auth: true })",
  "onToast({ title: \"请先登录后再下载作品\", tone: \"info\" })",
  "Shared work",
  "分享作品不可访问",
  "这是 seeFactory 用户分享的作品",
  "同款生成任务已创建",
  "shareTicket ? ("
]) {
  includes(pattern, `Dashboard shared work page contract must include ${pattern}.`);
}

for (const pattern of [
  '["help", "帮助中心", "mail"]',
  "type CustomerServiceConfig",
  "type FaqItem",
  "type AgreementType",
  "type Agreement",
  "function SupportPanel",
  "function FaqPanel",
  "function AgreementLinks",
  "function telegramLink",
  "customerService?.wechat",
  "customerService?.telegram",
  "customerService?.email",
  "customerService?.qrCodeUrl",
  "复制微信",
  "打开 Telegram",
  "发送邮件",
  "客服渠道由 Admin 应用配置驱动",
  "FAQ 由后端 AppConfig 配置",
  "暂无 FAQ 配置",
  "1 CNY = {formatPoints(pointRate)} 点",
  "支持自填充值金额",
  "本次生成直付暂不开放",
  "`/agreements/${type}`",
  "协议正文由 Admin 发布",
  "打开外部协议链接",
  "用户协议",
  "隐私政策",
  "创作者协议",
  "代理说明"
]) {
  includes(pattern, `Dashboard help, agreements and customer service contract must include ${pattern}.`);
}

for (const pattern of [
  ".case-action-layout",
  ".case-action-list",
  ".case-action-detail",
  ".workflow-entitlement-card",
  ".workflow-entitlement-card.purchased",
  ".locked-work-card",
  ".locked-work-card strong",
  ".workflow-published",
  ".published-case",
  ".published-actions",
  ".published-case .link-muted",
  ".lifecycle.listed",
  ".case-run-form",
  ".case-run-form input",
  ".case-run-form select",
  ".case-run-form textarea",
  ".asset-upload-field input[type=\"file\"]",
  ".asset-chip-list",
  ".asset-chip",
  ".node-output-preview",
  ".run-node-actions",
  ".workflow-drop-zone",
  ".workflow-drop-zone.active",
  ".lane.selected",
  ".lane.dragging",
  ".node-config-panel",
  ".node-config-grid",
  ".exposed-fields-grid",
  ".case-action-buttons",
  ".case-action-buttons .button",
  ".wallet-layout",
  ".wallet-form",
  ".wallet-order",
  ".wallet-preview",
  ".wallet-kv",
  ".copy-box",
  ".transaction-list",
  ".transaction-row",
  ".create-studio",
  ".create-tool-list",
  ".create-main-panel",
  ".generation-result-panel",
  ".generation-preview",
  ".recent-work-list",
  ".works-library",
  ".works-filter-panel",
  ".works-grid-panel",
  ".works-grid",
  ".work-detail-panel",
  ".work-prompt-panel",
  ".params-panel",
  ".public-gallery",
  ".gallery-filter-row",
  ".gallery-layout",
  ".gallery-masonry",
  ".gallery-tile",
  ".gallery-detail-panel",
  ".featured-badge",
  ".account-profile-card",
  ".account-profile-head",
  ".identity-grid",
  ".identity-card",
  ".account-link-list",
  ".share-work-page",
  ".share-work-layout",
  ".hero-media",
  "--hero-overlay-opacity",
  "--hero-card-opacity",
  ".support-panel",
  ".support-layout",
  ".support-card",
  ".qr-card",
  ".faq-panel",
  ".faq-grid",
  ".faq-group",
  ".agreement-panel",
  ".agreement-link-grid",
  ".agreement-viewer",
  ".income-layout",
  ".income-policy-card",
  ".income-insight-grid",
  ".income-table"
]) {
  styleIncludes(pattern, `Dashboard workflow case marketplace styles must include ${pattern}.`);
}

const mobileStyles = styleSection("@media (max-width: 720px)", "@media (prefers-reduced-motion: reduce)");
for (const pattern of [
  ".model-table",
  "overflow-x: visible",
  ".model-row",
  "min-width: 0",
  "grid-template-columns: 1fr",
  ".model-row.header",
  "display: none",
  "overflow-wrap: anywhere",
  ".model-row .row-action",
  "width: 100%"
]) {
  assert.ok(mobileStyles.includes(pattern), `Dashboard mobile model rows must keep responsive card layout: ${pattern}.`);
}
assert.ok(!mobileStyles.includes("min-width: 620px"), "Dashboard mobile model rows must not regress to fixed-width horizontal table.");
styleExcludes("@media (max-width: 720px) {\n  .model-table {\n    overflow-x: auto;", "Dashboard mobile model table must not rely on horizontal scrolling.");

for (const pattern of [
  "type PendingPublicAction",
  'const pendingPublicActionKey = "seefactory.dashboard.pendingPublicAction"',
  "function readPendingPublicAction()",
  "function savePendingPublicAction(action: PendingPublicAction)",
  "function clearPendingPublicAction()",
  "const [pendingPublicAction, setPendingPublicAction]",
  "const rememberPublicAction = (action: PendingPublicAction)",
  "const consumePendingPublicAction = () =>",
  "const publicAction = pendingPublicAction || readPendingPublicAction()",
  'onRequireAuthAction({ type: "gallery-download", workId: work.id })',
  'onRequireAuthAction({ type: "gallery-rerun", workId: work.id })',
  'pendingAction.type !== "gallery-download" && pendingAction.type !== "gallery-rerun"',
  'onRequireAuthAction({ type: "share-download", workId: work.id, ticket })',
  'onRequireAuthAction({ type: "share-rerun", workId: work.id, ticket })',
  'pendingAction.type !== "share-download" && pendingAction.type !== "share-rerun"',
  'replaceBrowserPath(`/share/${encodeURIComponent(publicAction.ticket || "")}`)',
  "pendingAction={pendingPublicAction}",
  "onRequireAuthAction={rememberPublicAction}",
  "onActionConsumed={consumePendingPublicAction}"
]) {
  includes(pattern, `Dashboard pending public action contract must include ${pattern}.`);
}

console.log(JSON.stringify({
  checked: [
    "Dashboard directory is the real git worktree for seeFactory/dashboard.git",
    "Dashboard tracks pnpm-lock.yaml under pnpm@10.13.1",
    "Dashboard public shell exposes Chinese SEO, Open Graph, Twitter Card and structured data metadata",
    "Dashboard contains no hardcoded demo tools/models/cases",
    "Dashboard reads AppConfig, tools, cases, models, components and public recharge policy from backend APIs",
    "Dashboard renders empty/error states instead of business-data fallbacks",
    "Dashboard H5 Google/X/Telegram login paths are wired",
    "Dashboard H5 login has no local preview-login bypass",
    "Dashboard protected workspace tabs are URL-routable and login-gated",
    "Dashboard public pricing/model/help/tool deep links scroll to the matching public section",
    "Dashboard logged-in model and pricing pages are URL-routable",
    "Dashboard dynamic tool, work and workflow deep links preserve target ids through login",
    "Dashboard workflow draft save and case publish paths are wired",
    "Dashboard workflow publishing consumes backend AppConfig workflowPolicy for price, trial and node limits",
    "Dashboard workflow editor supports component drag-in, draggable node ordering and node config panel",
    "Dashboard workflow case purchase, trial-run, run, clone, export and purchased-template paths are wired",
    "Dashboard workflow case and purchased-template runs use backend runForm fields",
    "Dashboard workflow runForm upload fields use backend asset upload and submit inputAssets/inputAssetIds",
    "Dashboard workflow run details expose node output previews, work download links and locked trial-output states",
    "Dashboard wallet reads credit balance, recharge policy, crypto routes and credit transactions from backend",
    "Dashboard wallet creates CNY recharge orders and Crypto bridge payment orders",
    "Dashboard tool creation panel creates generation tasks, polls task state, previews works, downloads and publishes works",
    "Dashboard works library lists, filters, previews, downloads, shares, reruns, deletes and publishes works",
    "Dashboard public gallery reads /gallery/works, shows public details, copies prompts and gates download/same-style generation by login",
    "Dashboard restores protected public gallery/share actions after login",
    "Dashboard account settings reads /auth/me and credit balance, displays login methods, protocol entries and user-owned identity restrictions",
    "Dashboard shared work page consumes /works/share/:ticket and gates download/same-style generation by login",
    "Dashboard help center reads /customer-service and /faqs, then renders customer support entries and configurable FAQ",
    "Dashboard agreement links read /agreements/:type and render published agreement markdown from Admin",
    "Dashboard mobile model rows collapse into card layout instead of fixed-width horizontal table"
  ]
}, null, 2));
