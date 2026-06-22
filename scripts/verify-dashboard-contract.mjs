import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve("src/main.tsx"), "utf8");
const styles = readFileSync(resolve("src/styles.css"), "utf8");

for (const asset of ["public/home-bg.mp4", "public/home-bg-poster.jpg"]) {
  assert.ok(existsSync(resolve(asset)), `Dashboard default home media asset must exist: ${asset}.`);
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
  "`/workflow-cases/${caseContent.id}/delete`",
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
  "dragNodeKey",
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
  "case-action-layout",
  "case-run-form",
  "闭源付费案例购买后仅获得运行权",
  "已购买该 Workflow"
]) {
  includes(pattern, `Dashboard workflow case marketplace contract must include ${pattern}.`);
}
assert.ok(!source.includes("return fields.length ? fields : [{"), "Dashboard must not invent fallback workflow runForm fields when backend has not exposed them.");
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
  "`/works/${work.id}/download-url`",
  'apiPost<GenerationSubmitResult>("/generation-tasks"',
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
  "`/works/${work.id}/download-url?shareTicket=${encodeURIComponent(ticket)}`",
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
  ".workflow-published",
  ".published-case",
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
  ".agreement-viewer"
]) {
  styleIncludes(pattern, `Dashboard workflow case marketplace styles must include ${pattern}.`);
}

console.log(JSON.stringify({
  checked: [
    "Dashboard contains no hardcoded demo tools/models/cases",
    "Dashboard reads AppConfig, tools, cases, models, components and public recharge policy from backend APIs",
    "Dashboard renders empty/error states instead of business-data fallbacks",
    "Dashboard H5 Google/X/Telegram login paths are wired",
    "Dashboard H5 login has no local preview-login bypass",
    "Dashboard workflow draft save and case publish paths are wired",
    "Dashboard workflow publishing consumes backend AppConfig workflowPolicy for price, trial and node limits",
    "Dashboard workflow editor supports draggable node ordering and node config panel",
    "Dashboard workflow case purchase, trial-run, run, clone, export and purchased-template paths are wired",
    "Dashboard workflow case and purchased-template runs use backend runForm fields",
    "Dashboard workflow runForm upload fields use backend asset upload and submit inputAssets/inputAssetIds",
    "Dashboard workflow run details expose node output previews, work download links and locked trial-output states",
    "Dashboard wallet reads credit balance, recharge policy, crypto routes and credit transactions from backend",
    "Dashboard wallet creates CNY recharge orders and Crypto bridge payment orders",
    "Dashboard tool creation panel creates generation tasks, polls task state, previews works, downloads and publishes works",
    "Dashboard works library lists, filters, previews, downloads, shares, reruns, deletes and publishes works",
    "Dashboard public gallery reads /gallery/works, shows public details, copies prompts, downloads allowed works and gates same-style generation by login",
    "Dashboard account settings reads /auth/me and credit balance, displays login methods, protocol entries and user-owned identity restrictions",
    "Dashboard shared work page consumes /works/share/:ticket, downloads with shareTicket and gates same-style generation by login",
    "Dashboard help center reads /customer-service and /faqs, then renders customer support entries and configurable FAQ",
    "Dashboard agreement links read /agreements/:type and render published agreement markdown from Admin"
  ]
}, null, 2));
