# seeFactory Dashboard

seeFactory Dashboard 是独立的 PC Web 用户工作台，同时承担官网公开态能力。项目使用 `React + Vite + TypeScript + pnpm`，面向普通用户、创作者和高频内容生产者，提供公开浏览、登录创作、作品管理、Workflow 编排、模板市场、点数钱包和 Crypto 充值能力。

生产站点：

```text
https://seefactory.xyz/
```

生产 API：

```text
https://api.seefactory.xyz/api/v1
```

## 当前能力

- 公开首页：读取 `/app/config` 渲染品牌名称、Logo、首页视频/海报、遮罩透明度和主卡片透明度，并展示工具矩阵、Workflow 案例、公开作品广场、模型能力、读取 `/credits/recharge-settings` 的价格说明。
- 登录：PC H5 支持 Google、X、Telegram Login Widget。
- 普通创作：从后端 `/tools` 渲染工具、模式、字段、素材槽位、比例、分辨率、视频精度和点数消耗。
- 我的作品：私有作品库、状态/工具筛选、预览、下载、发布/取消发布广场、分享链接、再次生成、删除和失败作品清理。
- 公开作品广场：读取 `/gallery/works`，支持精选筛选、详情、提示词复制、下载权限和同款创作。
- 分享页：支持 `/share/:ticket`，读取 `/works/share/:ticket` 并通过 `shareTicket` 下载。
- 帮助中心：读取 `/customer-service` 与 `/faqs`，展示微信客服、Telegram、邮箱、二维码、客服说明和可配置常见问题。
- 协议阅读：读取 `/agreements/:type`，展示用户协议、隐私政策、创作者协议和代理说明。
- Workflow 控制台：组件选择、线性 graph、节点配置、服务端校验、估价、测试运行、发布、导入和导出 `.seeflow`。
- Workflow 案例：购买、试运行、正式运行、克隆、导出、已购模板库、运行记录和节点输出预览。
- 钱包：点数余额、冻结点数、点数流水、CNY 自填金额、Crypto bridge 充值订单和支付状态轮询。
- 账户设置：读取 `/auth/me` 与 `/credits/balance`，展示账户资料、登录方式说明、协议入口和用户端不开放解绑规则。

## 技术栈

- React 18
- Vite 6
- TypeScript 5
- pnpm 10
- 原生 CSS 深色玻璃拟态视觉体系

## 目录结构

```text
.
├── public/
│   └── logo.png
├── scripts/
│   ├── build-production.mjs
│   ├── verify-dashboard-contract.mjs
│   ├── verify-env-example.mjs
│   └── verify-production-api-base.mjs
├── src/
│   ├── main.tsx
│   ├── styles.css
│   └── vite-env.d.ts
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 环境变量

复制 `.env.example` 后按环境配置：

```text
VITE_SEEFACTORY_API_BASE=https://api.seefactory.xyz/api/v1
VITE_SEEFACTORY_GOOGLE_CLIENT_ID=
VITE_SEEFACTORY_X_REDIRECT_URI=
VITE_SEEFACTORY_TELEGRAM_BOT_USERNAME=seefactory_bot
```

生产构建必须使用 `VITE_SEEFACTORY_API_BASE=https://api.seefactory.xyz/api/v1`，并注入 `VITE_SEEFACTORY_TELEGRAM_BOT_USERNAME=seefactory_bot`，让登录弹窗渲染 Telegram Login Widget。产物中不得出现 `localhost`、`127.0.0.1` 或源站 IP API 地址。

## 开发

```bash
pnpm install
pnpm dev
```

## 构建

```bash
pnpm build
```

## 验证

```bash
pnpm verify
```

`pnpm verify` 会执行：

- TypeScript 无类型错误检查。
- Vite 生产构建。
- Dashboard 业务契约校验，覆盖公开数据、登录、创作、作品库、广场、分享页、Workflow、钱包和账户设置。
- `.env.example` 环境变量校验。
- 生产 API 基址校验，确保产物不包含本地或源站 API 地址。

## 部署

构建产物位于：

```text
dist/
```

当前服务器部署目录：

```text
/www/wwwroot/seefactory.xyz
```

当前部署脚本：

```text
/tmp/apply-dashboard-deploy.sh
```

## 关键接口

- `GET /tools`
- `GET /app/config`
- `GET /components?pageSize=100&clientRuntime=h5-google`
- `GET /case-contents?caseType=workflow&pageSize=8`
- `GET /gallery/works`
- `GET /gallery/works/:id`
- `GET /works/share/:ticket`
- `GET /customer-service`
- `GET /faqs`
- `GET /agreements/:type`
- `GET /works`
- `GET /works/:id`
- `GET /works/:id/download-url`
- `POST /works/:id/publish-gallery`
- `POST /works/:id/unpublish-gallery`
- `POST /works/:id/share-ticket`
- `DELETE /works/:id`
- `POST /works/clear-failed`
- `POST /generation-tasks`
- `GET /generation-tasks/:id`
- `POST /generation-tasks/:id/cancel`
- `GET /workflows`
- `POST /workflows`
- `PUT /workflows/:id/draft`
- `POST /workflows/:id/validate`
- `POST /workflows/:id/estimate`
- `POST /workflows/:id/run`
- `POST /workflows/:id/publish-case`
- `GET /workflows/:id/export`
- `POST /workflows/import`
- `GET /workflow-cases`
- `GET /workflow-cases/:id`
- `GET /workflow-cases/:id/purchase-status`
- `POST /workflow-cases/:id/purchase`
- `POST /workflow-cases/:id/trial-run`
- `POST /workflow-cases/:id/run`
- `POST /workflow-cases/:id/clone`
- `GET /workflow-cases/:id/export`
- `GET /workflow-purchases`
- `GET /workflow-runs`
- `GET /workflow-runs/:id`
- `GET /workflow-runs/:id/nodes`
- `GET /credits/balance`
- `GET /credits/recharge-settings`
- `GET /credits/transactions`
- `GET /wallet/recharge-options`
- `POST /credits/recharge-orders`
- `POST /payments/crypto-orders`
- `GET /payments/crypto-orders/:id`
- `GET /auth/me`
- `POST /auth/h5/google-login`
- `GET /auth/h5/x/authorize-url`
- `POST /auth/h5/x-login`
- `POST /auth/h5/telegram-login`

## 约束

- 工具、模型、比例、分辨率、视频精度、点数消耗和素材槽位均以后端配置为准，前端不得写死业务模型。
- 品牌名称、Logo、公开首页视频背景、海报、遮罩透明度和主卡片透明度均以 `/app/config` 为准；`docs/logo.png` 自动映射到 Dashboard 静态资源 `/logo.png` 兜底。
- PC Dashboard 只展示 Crypto 充值主路径，不展示微信、支付宝、抖音、QQ 或 Telegram Stars 支付。
- 用户端不开放登录身份解绑；身份绑定、解绑、恢复和主身份设置由 Admin 审计操作。
- 未登录用户可浏览公开工具、案例、作品广场、分享页、模型能力和价格说明；生成、同款创作、充值、作品库、下载私有作品等操作按后端鉴权执行。

## 远端仓库

```text
git@github.com:seeFactory/dashboard.git
```
