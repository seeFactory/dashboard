# seeFactory Dashboard

用户侧控制台，用于注册登录、充值、模型测试、no-code workflow 构建、创意工坊使用、任务记录、资产管理、账单和个人资料维护。

## 功能范围

- 账号注册、登录、退出和资料维护。
- 用户摘要：余额、工作流数量、任务统计、资产统计、累计消耗。
- No-code workflow 控制台：拖拽/表单式构建链路、节点预览、保存草稿、校验、运行、发布到创意工坊、单文件导出。
- 创意工坊：浏览公开样例、运行样例、克隆开源样例。
- 模型测试台：选择模型能力并发起测试调用。
- 钱包与账单：充值订单、余额流水、模型调用扣费记录。
- 调用记录：任务列表、任务详情、事件流、输出资产。
- 资产库：图片、视频、文件等产物浏览和外部资产登记。

## 技术栈

- React 18
- Vite 5
- @xyflow/react
- lucide-react

## 目录结构

```text
.
├── public/
│   └── brand/
├── src/
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
└── vite.config.js
```

## 环境要求

- Node.js 20 或更高版本。
- seeFactory Backend 已启动，默认生产端口为 `18280`。

## 安装

```bash
npm install
```

## 本地开发

```bash
npm run dev
```

默认开发地址：

```text
http://localhost:18182
```

Dashboard 会按当前访问域名推导 API 地址：

```text
http://<当前页面 hostname>:18280
```

例如访问 `http://192.168.31.26:18282` 时，前端会请求 `http://192.168.31.26:18280`。

## 构建

```bash
npm run build
```

构建产物输出到：

```text
dist/
```

本地预览：

```bash
npm run preview
```

## 后端依赖

Dashboard 依赖 Backend 提供以下能力：

- `/api/auth/register`
- `/api/auth/login`
- `/api/users/me`
- `/api/users/me/summary`
- `/api/wallet/*`
- `/api/models/*`
- `/api/components`
- `/api/workflows/*`
- `/api/workshop/*`
- `/api/tasks/*`
- `/api/assets/*`
- `/api/billing/estimate`

## 工作流导出

Dashboard 中的 workflow 支持单文件导出。导出接口为：

```text
GET /api/workflows/:id/export
```

导出文件包含工作流 schema、节点、边、运行配置和元信息，适合跨环境迁移或上传到创意工坊。

## 部署建议

- 推荐通过 Nginx 或容器静态服务托管 `dist/`。
- 不建议直接使用 80/443 作为应用容器端口；平台默认外部端口为 `18282`。
- 需要确保 Dashboard 所在域名或 IP 可以访问 Backend 的 `18280` 端口。

## 常见问题

### 登录后接口仍然失败

确认 Backend 已启动，并检查浏览器访问地址是否能推导出正确 API 地址。例如：

```text
Dashboard: http://192.168.31.26:18282
API:       http://192.168.31.26:18280
```

### workflow 无法保存

确认 Backend 的组件定义已初始化，并且 `/api/components` 可正常返回。workflow 节点必须包含合法 `type`，否则后端会拒绝保存。

## 代码提交

当前仓库远端：

```text
git@github.com:seeFactory/dashboard.git
```
