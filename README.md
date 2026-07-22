# 臭鱼烂虾杯（S&S Cup）

臭鱼烂虾杯的赛事与社区官网。网站集中展示近期赛事、社区动态、选手排行榜和往期战报，并提供雀魂、街头霸王 6 等活动的报名与规则页面。

## 功能

- 首页赛事推荐卡片与社区介绍
- 近期比赛、社区动态和往期赛事归档
- 选手积分排行榜
- 雀魂「雀神杯」活动规则与报名指引
- 街头霸王 6「师徒杯」报名信息生成及一键复制
- 限定活动商品展示页
- 响应式导航与移动端布局
- 远程数据加载、加载状态和错误提示

## 页面路由

| 路径 | 页面 |
| --- | --- |
| `/` | 俱乐部首页 |
| `/mahjong-cup-registration` | 雀魂赛事介绍、规则与报名方式 |
| `/sf6-registration` | 街头霸王 6 赛事介绍、规则与报名表 |
| `/event/limited-drop` | 限定活动商品展示 |

## 技术栈

- React 19
- React Router 7
- Vite 7
- Tailwind CSS 4 / PostCSS
- ESLint 9

## 本地开发

需要 Node.js 20.19+ 或 22.12+（Vite 7 的运行要求）以及 npm。

```bash
git clone <repository-url>
cd sscup
npm install
npm run dev
```

开发服务器默认使用 Vite 提供的地址。开发环境中的 `/api` 请求会代理到 `https://api.sticksoma.art`。

## 环境变量

前端通过 `GET /api/sscup` 获取首页的赛事、动态与排行榜数据。可在项目根目录创建 `.env.local`，指定自定义 API 地址：

```env
VITE_SOMA_API_URL=https://your-api.example.com
```

不要在 `VITE_` 开头的变量中保存密钥：这类变量会被打包到客户端代码中。

未配置该变量时：

- 开发环境使用 Vite 的 `/api` 代理；
- 生产环境使用 `https://api.sticksoma.art`。

## 常用命令

```bash
npm run dev      # 启动开发服务器
npm run lint     # 运行 ESLint
npm run build    # 构建生产版本到 dist/
npm run preview  # 本地预览生产构建
```

## 部署

项目可直接部署到 Vercel。`vercel.json` 已将所有路径重写到 `index.html`，以支持 React Router 的客户端路由。

部署前建议运行：

```bash
npm run lint
npm run build
```

其他静态托管平台也需要配置 SPA fallback，将未知路径回退到 `index.html`。

## 项目结构

```text
sscup/
├─ public/                 # 图片、图标和静态资源
├─ src/
│  ├─ components/         # 页面区块及活动页面组件
│  ├─ App.jsx             # 路由和首页数据加载
│  ├─ index.css           # 全局样式
│  └─ main.jsx            # 应用入口
├─ vite.config.js         # Vite 配置及开发代理
├─ vercel.json            # Vercel SPA 路由配置
└─ package.json           # 依赖与 npm 命令
```
