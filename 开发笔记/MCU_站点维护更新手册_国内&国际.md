# MCU 站点维护更新手册（国内 & 国际）

适用范围：
- 国内站：`https://wumatv.cn/mcu-app/public/`
- 国际站：`https://mcu.wumatv.net/`（GitHub Pages + Cloudflare）

目标：未来维护 **只改数据文件（JSON）**，不必改 `index.html` 代码。

---

## 0. 你需要知道的文件（只改这些）

在项目目录 `MCU/` 下：

- `mcuData.json`
  - 时间轴卡片主数据（新增/修改作品都在这里）
- `localVideoFiles.json`
  - 本地预告片文件名列表（用于“标题→本地视频”模糊匹配）
- `heroDictionary.json`
  - 搜索扩展词典（英雄/别名 → 关联关键词）
- `mcuData.en.json`
  - 英文文案包（国际站英文“秒出”依赖它；不更新也能用，但可能触发慢翻译兜底）

---

## 1. 新增一条新作（最常用）

打开 `mcuData.json`，在数组末尾追加一个对象即可。

### 1.1 最少必填（建议）
- `title`：中文片名（如 `《钢铁侠》`）
- `enTitle`：英文片名（如 `Iron Man`）
- `yt`：YouTube 视频 ID（如 `8ugaeA-nPMc`，不要填完整 URL）
- `year`：发行年份（字符串，如 `"2008"`）
- `type`：类型图标（如 `"🎬"` 电影 / `"📺"` 剧集 / `"🌟"` 动画短片）
- `phase`：阶段或归类（如 `"第一阶段"` / `"多元宇宙 (索尼)"`）
- `studio`：厂牌（如 `"Marvel Studios"`）
- `time`：时间点（如 `"2010"` 或 `"平行"`）
- `desc`：中文简介（1–2 句）
- `chars`：中文核心角色（逗号分隔）
- `impact`：中文宇宙影响（1 句）

### 1.2 可选字段
- `searchAlias`：额外别名（用于本地视频/搜索匹配，例如 `"X-Men 2"`）
- `descEn / charsEn / impactEn`：英文文案（可不填；一般由 `mcuData.en.json` 提供）

### 1.3 可直接复制粘贴的模板

```json
{
  "time": "2026",
  "title": "《示例作品》",
  "enTitle": "Example Title",
  "yt": "XXXXXXXXXXX",
  "type": "🎬",
  "year": "2026",
  "phase": "第六阶段",
  "studio": "Marvel Studios",
  "chars": "主角A, 主角B",
  "impact": "一句话说明宇宙级影响。",
  "desc": "一句话简介。"
}
```

---

## 2. 更新本地预告片匹配（可选）

如果你在视频源站（`mcu-video.wumatv.net`）新增了一个 mp4 文件，并希望页面能优先命中本地视频：

1. 把新文件名追加到 `localVideoFiles.json`
2. 如仍难以命中，可在对应作品条目里加 `searchAlias`

---

## 3. 更新搜索扩展（heroDictionary）

如果希望搜索某个关键词能关联更多作品，在 `heroDictionary.json` 添加映射即可：

```json
"iron man": ["tony", "stark", "钢铁侠"]
```

说明：
- key 和 values 建议都用小写（英文），中文保持原样
- values 越多，搜索越“聪明”，但也更容易误匹配；建议保持精炼

---

## 4. 国际站英文“秒出”：更新 `mcuData.en.json`（推荐在每次改卡片后做）

当你修改/新增了中文字段（`desc/chars/impact`）后，为了让国际站英文无需等待翻译：

在终端运行：

```bash
cd "/Users/mac/Desktop/2026.wumatv.net/MCU"
node scripts/build-en-data.mjs
```

然后提交推送：

```bash
cd "/Users/mac/Desktop/2026.wumatv.net/MCU"
git add mcuData.en.json
git commit -m "chore: update en copy pack"
git push
```

---

## 5. 发布上线（国际站）

国际站使用 GitHub Pages：只要你 `git push` 到 `main`，它会自动部署。

如果你发现线上仍是旧内容：
- 先强制刷新：Mac `Cmd + Shift + R`
- 如仍不更新，去 Cloudflare 对 `mcu.wumatv.net` 执行一次 **Purge Cache → Purge Everything**

---

## 6. 常见故障排查（快速）

### 6.1 页面白屏 / 没数据
- 检查这几个文件是否存在且 JSON 格式正确：
  - `mcuData.json`
  - `localVideoFiles.json`
  - `heroDictionary.json`
- 由于 `index.html` 仍保留“内置兜底数据”，通常不会白屏；如果看到明显不对，多数是缓存导致。

### 6.2 英文模式下简介又变慢（出现等待）
- 通常是 `mcuData.en.json` 没更新或缓存没刷新
- 重新跑一次 `node scripts/build-en-data.mjs` 并推送
- Cloudflare Purge + 强刷

### 6.3 聊天机器人提示“系统链路中断”
- 国际站会访问 `wumatv.cn` 的聊天接口（或 Worker 代理）
- 优先强刷；如果持续异常，再检查后端/跨域策略（需要我们下一阶段一起排）

---

## 7. 国内站如何同步

国内站如果也要用同样的“外部 JSON 驱动”，做法是把以下文件放到国内站同目录，并确保可访问：
- `mcuData.json`
- `localVideoFiles.json`
- `heroDictionary.json`
- `mcuData.en.json`（可选）

如果国内站当前是独立发布目录（`wumatv.cn/mcu-app/public/`），建议每次更新后：
- 直接把这些 JSON 同步到国内站同目录（运维方式按你们官网既有流程）

