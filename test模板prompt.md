你是一名心理学专家和前端开发者。请根据以下规范，为【{测评名称}】生成一个完整的 HTML 测评页面。

## 技术规范（严格遵守）

- Vue 3 (CDN: https://unpkg.com/vue@3/dist/vue.global.js)
- Tailwind CSS (CDN)
- Chart.js (CDN: https://cdn.jsdelivr.net/npm/chart.js)
- html2canvas 1.4.1 (CDN: https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js)
- 字体：Noto Serif SC + Noto Sans SC（Google Fonts）
- 背景色：#f7f6f2，正文色：#333333

## 页面结构规范

### Token 验证（固定，不可修改）
页面顶部必须包含以下 JS 验证逻辑：
(function () {
    const p = new URLSearchParams(location.search);
    const token = p.get('token') || '';
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const parts = token.split('.');
    if (parts.length !== 2 || parts[0] !== today) {
        location.replace('index.html');
    }
})();

### 测评页（答题中）
- 顶部左侧竖线 + 测评名称（大写英文缩写）+ 副标题（英文全称）
- 顶部进度条（细线，1px，灰色底+黑色填充）
- 题号显示：— QUESTION X / 总题数
- 选项按钮：底部边框分隔线式，hover 向右缩进 + 边框变黑
- 底部仅保留 BACK 按钮（左对齐），无任何分数显示
- 页面过渡动画：fade + translateY

### 结果页
- 标题区：「测评报告书」小标签 + 测评名称大标题 + Assessment ID（随机9位）
- 可视化区域：根据测评类型选择合适的图表（雷达图 / 双向条形图 / 维度条形图）
- 内容区（border-t 分隔）：
  - / 核心性格摘要（serif 大字 + 描述段落）
  - / 优势倾向 或 适应性表现（黑点列表）
  - / 潜在盲点 或 关系风险点（灰点列表）
  - / 深度解析录（灰底引用块，italic）
  - / 参考常模与研究背景（border 方框，包含：量表来源、信效度数据、常模均值、性别/文化差异如有、使用建议）
- 底部：
  - 署名：Based on {量表名} · {作者} ({年份})
  - 「📷 保存报告为图片」按钮（全宽边框按钮，html2canvas 实现，scale:2，文件名：{缩写}-report.png）
  - 「← Return to Center」链接（index.html）

## 交互规范
- 答题完成后自动跳转结果页（Vue transition fade）
- BACK 按钮可返回上一题
- 保存按钮点击中显示「生成中，请稍候…」，禁用重复点击
- 截图区域：document.querySelector('#app > main .bg-white') || document.querySelector('#app .bg-white')
- 手机端兼容：iOS Safari 新标签页打开可长按保存，Android Chrome 直接下载

## 需要你填充的内容

**测评名称**：{中文名} / {英文全称缩写}
**题目数量**：{N} 题
**题目格式**：{李克特5级量表 / 强迫选择A-B / 是否题}
**计分方式**：{详细说明，包括反向计分题}
**维度划分**：{维度1: 第X题… / 无维度}
**可视化类型**：{雷达图（多维度）/ 双向条形图（两极维度）/ 条形图（单维度）}
**结果分段**：{分数段1: 标题/描述/优势/盲点/洞见 / 分数段2: … / …}
**参考文献**：{作者, 年份, 量表来源, 常模数据, 信效度, 文化/性别差异}

---

现在请为以下测评生成完整 HTML：

测评名称：{xxx}
题目内容、计分方式、常模数据请你作为心理学专家基于学术文献自行构建，确保科学性。