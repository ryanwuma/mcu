# 漫威宇宙 (MARVEL) 无限时间轴项目：全球发布与技术部署计划书 (V5.0 终极演进版)

## 0. 项目定调与核心价值
* **愿景**：打造全球最硬核、交互最性感的漫威宇宙数字档案库。
* **设计美学**：极简主义 (Minimalist)、档案感 (Archival)、极客控制台 (Tech Terminal)。
* **核心卖点**：原生 JS 驱动 3D 纵深交互、TVA 风格 Glitch 动效、灭霸响指/神盾局复苏协议、J.A.R.V.I.S. 智能终端。
* **发布逻辑**：国内走“品牌与美学”路线，强化吾马既同 (Wuma Design) 调性；国外走“开源与极客”路线，积累 GitHub 声誉。

---

## 1. 部署架构：极致性能与双轨网络 

### 📊 核心数据实测模型
* **资源总量**：118 条高清预告片。
* **存储体积**：3.83 GB (平均单文件 ~32 MB)。
* **资源评价**：极佳的轻量化模型。目前 3.83GB 仅占 20GB VPS 硬盘的一小部分，余量足以支撑未来 3-5 年漫威全线作品的无压力扩充。

### 🇨🇳 国内线路：官网旗舰店 (Official Showcase)
* **访问地址**：`https://wumatv.cn/mcu-app/public/`
* **托管环境**：吾马既同官方服务器。
* **策略**：作为高带宽环境下的“肌肉展示”，提供最流畅的原生播放体验。
* **当前状态**：- [x] 已上线（国内官网线路）

### 🌍 国际线路：全球加速版 (Global Accelerated)
* **前端核心平台**：**GitHub Pages** (托管基础 `index.html` 代码、CSS、JS 等纯静态文件，全球极速响应)。
* **视频图床方案 (VPS + CDN 榨干性能极限)**：
    * **源站硬件**：经典 1核 1G 20G 轻量级 Debian VPS。
    * **网络代理**：前端挂载 **Cloudflare CDN**（小橙云开启）。
    * **⚠️ 端口防冲突（关键）**：该 VPS 也是 VLESS-Reality 科学上网节点（已占用 443 端口）。为避免冲突，Nginx **仅监听 80 端口**。Cloudflare 端配置 SSL 为“灵活 (Flexible)”模式，实现外网 HTTPS 到源站 HTTP 的无缝转换。
    * **黄金缓存优势**：由于视频平均仅 32MB，完美触发 Cloudflare 免费版（512MB以下文件）的全球边缘节点自动缓存。海外用户访问将实现“秒开”，且 VPS 源站负载几乎为零。
* **国际官网域名（wumatv.net）**：
  - [x] `mcu.wumatv.net` 绑定到国际前端（与 `https://ryanwuma.github.io/mcu/` 内容一致）
  - [x] `wumatv.net` / `www.wumatv.net` 重定向到 `mcu.wumatv.net`
  - **验收**：`https://wumatv.net` 可自动跳转并正常访问国际站

### 官网国际镜像（wumatv.cn ↔ wumatv.net）
- [x] `wumatv.net` 首页与 `wumatv.cn` 保持一致（同一份静态内容在 VPS 上托管 + Cloudflare 代理）
- [x] `https://wumatv.net/wuma-engine/` 可访问（Wuma-Engine dist 已部署）

---

## 2. 第一阶段：技术净化与准备 (Release -3 Days)
- [x] **代码脱敏**：检查并隐藏私有 API Key，确保开源代码库的安全。
- [ ] **Nginx 配置实装**：登录 VPS，执行 `apt install nginx`，部署监听 80 端口的极简静态服务器。
  - [x] **Cloudflare 接入域名**：`wumatv.net` 已 Active
  - [x] **DNS 指向 VPS（视频子域名）**：`mcu-video.wumatv.net` → `154.197.57.126`（Proxied）
  - [x] **Cloudflare SSL 模式**：Flexible
  - [x] **SSH 可登录**：已稳定使用 `ssh -p 2222 root@154.197.57.126`
  - [x] **安装并配置 Nginx**：仅监听 80，为视频目录提供静态服务（`https://mcu-video.wumatv.net/health.txt` 返回 200）
  - [x] **批量上传视频到源站目录**：将 `video/` 同步到 `/var/www/mcu-video/video/`
- [x] **启动屏加固**：保留“神盾局启动屏”，引导用户点击以一键解锁 Web Audio 声卡，规避各大浏览器自动播放限制。

### GitHub Pages（国际前端）准备清单
- [x] **初始化 Git 仓库**：整理静态文件结构，加入 `.gitignore`（过滤 `.DS_Store` 等）。
- [x] **补齐 GitHub README（英文）**：项目介绍 + 使用说明 + 演示素材占位。
- [x] **发布到 GitHub Pages**：启用 Pages（或 Actions），生成国际访问地址：`https://ryanwuma.github.io/mcu/`

---

## 3. 第二阶段：国内社交矩阵全打透 (China Social Matrix)

### 📺 Bilibili (技术复盘)
* **内容**：3-5 分钟深度 Vlog，展示如何用 AI (Vibe Coding) 辅助完成这个电影级项目。
* **重点**：演示 3D 纵深交互、Glitch 故障恢复特效。

### 📕 小红书 (桌面美学)
* **内容**：实拍 M2 Max MacBook Pro 运行该系统的暗光美照，侧重展示 UI 的流光溢彩。
* **标签**：#桌面美学 #UI设计 #漫威 #极客。

### ⌨️ V2EX / 掘金 (技术引流)
* **内容**：发布技术贴，强调“零框架依赖”、“纯原生 JS + CSS 3D 渲染”。

---

## 4. 第三阶段：国际破圈与 GitHub 运营 (Global Outreach)

### 🐦 X (Twitter)
* **内容**：15 秒高燃卡点剪辑，展示点击无限宝石后卡片消散的瞬间，带链接并艾特 @MarvelStudios 及知名 Web 开发者。

### 🐙 GitHub
* **README**：全英文高标准文档，配置高帧率 GIF 演示，底部显著标识 “Powered by Wuma Design”。

### 💬 Reddit
* **r/webdev**：展示硬核技术实现（特别是 Web Audio 解锁与 Glitch 算法）。
* **r/marvelstudios**：作为粉丝致敬作品发布，吸引海外漫威粉。

---

## 5. 第四阶段：长期演进与“莫比乌斯”自动化引擎 (Mobius Engine)

为了保证项目长期存活、紧跟漫威宇宙动态且不增加主理人的维护负担，系统将引入 **“T.V.A. 裁决协议” (Human-in-the-Loop AI Copilot)** 自动化架构：

* **动态情报监听模块 (J.A.R.V.I.S. Intel)**：
    * **机制**：利用轻量级云函数 (如 Cloudflare Workers) 定时轮询抓取外网权威漫威源 (IGN、官方推特等) 的 RSS。
    * **解密呈现**：数据由大语言模型清洗后转化为 JSON。前端 J.A.R.V.I.S. 读取后，在用户询问“最新情报”时，以“解密截获通讯”的极客打字机效果呈现，完全不破坏控制台的沉浸感。

* **新片自动挂载模块 (T.V.A. 裁决协议)**：
    * **机器包揽 90% 苦力**：后端脚本定时监听 TMDb API，一旦发掘新影片/剧集，自动触发 AI 翻译简介、提取核心观测目标 (Chars)、评估宇宙级影响 (Impact)，并格式化为标准入库 JSON 代码。自动下载并压制预告片备用。
    * **人工 10% 最终裁决**：生成的 JSON 和预告片推送到主理人邮箱/微信。主理人作为“时间线绝对管理者”，仅需核准内部时间线 (T+ 年份) 与视觉质量，粘贴入库即可，彻底规避 100% 纯自动化导致的时间逻辑崩塌。

* **视觉与体验扩展预研**：
    * **平行宇宙编辑器**：允许高阶用户自定义自己的时间轴线。
    * **镜像空间特效**：开发类奇异博士 (Mirror Dimension) 的屏幕碎裂/折叠视觉滤镜。

---

**“报告 TVA 总局，莫比乌斯自动化引擎蓝图已并入主干。时空节点已锚定，海内外双轨网络随时可以执行 Launch 协议。”**
