# seeFactory Dashboard

## 2026-06-17 更新摘要

- Billing 页面新增自定义充值、优惠券兑换、提现申请、邀请码展示和提现列表。
- 模型测试台可测试后台映射后的外部 Provider 模型。
- 操练场继续保存服务端 session，并通过后端统一 runtime 支持对话、生图、生视频和多模态模型。

seeFactory Dashboard 是用户侧控制台，面向创作者提供注册登录、操练场、模型测试、充值付费、no-code workflow 构建、创意工坊使用、调用记录、资产库和账号资料管理。它是 seeFactory 平台的核心生产界面，用户可以拖拽组件创建产出链条，将 workflow 保存、运行、导出为单文件，也可以发布到创意工坊。

## 功能范围

- 账号注册、登录、退出、资料维护和密码更新。
- 总览面板：余额、累计消耗、请求次数、成功任务、最近调用和最近订单。
- Workflow 控制台：组件拖拽、节点连接、节点配置、保存草稿、校验、运行、发布、导出。
- 操练场：对标 new-api playground，保存服务端会话，支持文生文、图生文、文生图、文生视频、图生视频。
- 创意工坊：浏览公开样例、运行样例、克隆开源 workflow。
- 模型测试台：选择平台模型能力并发起测试调用。
- 付费账单：创建充值订单、查看充值记录、钱包流水和模型扣费。
- 调用记录：分页搜索任务、查看执行状态、事件流、输入、输出资产和错误信息。
- 资产库：浏览产物资产，登记外部资产 URL。
- 账号资料：昵称、邮箱、计费偏好、语言和登录安全。

## 技术栈

- React 18
- Vite 5
- @xyflow/react
- lucide-react
- 原生 CSS，新扁平风格，支持亮色/暗色主题

## 目录结构

```text
.
├── public/
│   └── brand/
│       └── logo-icon.png
├── src/
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 环境要求

- Node.js 20 或更高版本。
- seeFactory Backend 已启动，并可通过 `http://<hostname>:18280` 访问。

## 安装

```bash
npm install
```

如果在 seeFactory 多端 workspace 根目录安装，也可以使用：

```bash
npm install --workspace @seefactory/dashboard
```

## 本地开发

```bash
npm run dev
```

默认开发地址：

```text
http://localhost:18182
```

Dashboard 会按当前访问页面的 hostname 推导 API 地址：

```text
http://<当前页面 hostname>:18280
```

例如访问 `http://192.168.31.26:18282` 时，前端会请求 `http://192.168.31.26:18280`。

## 构建与预览

```bash
npm run build
npm run preview
```

构建产物输出到：

```text
dist/
```

本轮验证命令：

```bash
npm run build
```

## Workflow 单文件导出

Dashboard 支持将 workflow 导出为单文件 manifest：

```text
GET /api/workflows/:id/export
```

导出内容包含 workflow schema、节点、边、运行配置、版本信息和元数据，适合跨环境迁移、归档或上传到创意工坊。

## 操练场

Dashboard 顶部导航包含 `操练场` tab。它不是本地浏览器模拟，而是调用 Backend 的 `/api/playground/*` 接口：

- session、message、run 均由服务端保存。
- 每次运行会选择平台模型能力，并写入账单或免费调度流水。
- 文生图会产出图片资产，文生视频/图生视频会产出可追踪的视频任务资产。
- 图生文和图生视频可以选择用户资产库中的图片资产作为输入。

## 后端依赖

Dashboard 依赖 Backend 的以下能力：

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `PATCH /api/users/me/password`
- `GET /api/users/me/summary`
- `GET /api/wallet/balance`
- `GET /api/wallet/ledgers`
- `GET /api/payments/recharge-orders`
- `POST /api/payments/recharge-orders`
- `GET /api/models/capabilities`
- `POST /api/models/test`
- `GET /api/playground/sessions`
- `POST /api/playground/sessions`
- `DELETE /api/playground/sessions/:id`
- `GET /api/playground/sessions/:id/messages`
- `POST /api/playground/sessions/:id/run`
- `POST /api/playground/sessions/:id/stop`
- `GET /api/components`
- `GET /api/workflows`
- `POST /api/workflows`
- `PUT /api/workflows/:id/draft`
- `POST /api/workflows/:id/validate`
- `POST /api/workflows/:id/test-run`
- `POST /api/workflows/:id/publish`
- `GET /api/workshop/items`
- `POST /api/workshop/items/:id/run`
- `POST /api/workshop/items/:id/clone`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `GET /api/tasks/:id/events`
- `GET /api/assets`
- `POST /api/assets/upload`

## 设计规范

- 与官网、Admin、Mobile H5 保持同一套 seeFactory 色系。
- 默认亮色主题，支持暗色主题切换。
- 工作流区域使用大画布、柔和网格、圆角节点和独立工具条。
- 所有按钮、输入框、搜索框、分页和导航 icon 使用统一对齐规则。

## 部署建议

- 推荐通过容器或 Nginx 托管 `dist/`。
- 不建议直接暴露 80/443 给应用容器；平台约定外部端口为 `18282`。
- 确保 Dashboard 所在域名或 IP 可以访问 Backend 的 `18280` 端口。

## 常见问题

### 登录后接口仍然失败

确认 Backend 已启动，并检查浏览器页面地址是否可以推导出正确 API 地址。例如：

```text
Dashboard: http://192.168.31.26:18282
API:       http://192.168.31.26:18280
```

### Workflow 无法保存

确认 Backend 的组件定义已初始化，并且 `/api/components` 可正常返回。workflow 节点必须包含合法 `type`，否则后端会拒绝保存。

### 工作流画布显示异常

请确认浏览器加载的是最新构建产物，并清理旧的前端缓存。当前样式对编辑器头部、按钮工具条、画布和节点都有固定尺寸约束。

## 远端仓库

```text
git@github.com:seeFactory/dashboard.git
```
