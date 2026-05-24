# Portugal Job Scout — MVP 技术方案

## 项目概述

一个 AI 驱动的葡萄牙公司情报工具。用户输入公司名称，工具自动聚合多平台公开数据，生成一份结构化的公司分析报告，帮助求职者做出决策。覆盖 IT 和商科（金融、咨询、市场营销、管理等）领域。

### 核心价值主张
- **不做平台，做工具**：不需要 UGC 冷启动，不需要社区运营
- **数据聚合 + AI 分析**：整合多个数据源，提供单一入口的公司全貌
- **面向葡萄牙职场**：覆盖 IT + 商科，精准定位

### 目标用户
- 在葡萄牙工作的 IT 和商科从业者（本地人 + 外国人）
- 正在找工作或考虑跳槽的专业人士
- 收到 offer 想了解目标公司的人

---

## 差异化策略

### Tagline
**"Know before you sign"** — 不是又一个评价网站，是一个求职决策工具。

### 与竞品的核心区别

| 维度 | Teamlyzer / Glassdoor | Portugal Job Scout |
|------|----------------------|-------------------|
| 定位 | 评价平台，提供数据 | 决策工具，提供答案 |
| 覆盖 | Teamlyzer 仅 IT；Glassdoor 体验差 | IT + 商科（金融、咨询、营销、管理） |
| 数据 | 单一平台 UGC | 多平台聚合 + AI 交叉验证 |
| 用户行为 | 自己浏览、对比、判断 | 输入公司名，30秒出报告 |
| 语言 | 葡语或英语（分开） | 多语言统一（EN/PT/ZH） |
| 外国人友好 | 不关注 | 签证友好度、英语环境评估 |
| 场景 | 浏览探索 | 有明确目标（收到 offer，要不要接？） |

### 四大差异化功能

#### 1. 一站式聚合报告
用户不需要打开 Teamlyzer + Glassdoor + LinkedIn + itjobs.pt 四个网站自己拼信息。输入公司名，30秒生成一份结构化报告。这个体验本身就是产品价值。

#### 2. AI 红旗交叉检测
不是简单罗列评价，而是 AI 交叉分析多个平台的负面反馈，识别反复出现的问题模式。例如：
- 如果 Teamlyzer 和 Glassdoor 都提到"加班文化"→ 高置信度红旗
- 如果只有一条评价提到"管理混乱"→ 低置信度，标注为"个别反馈"
- 检测评价中的异常模式（短时间内大量五星好评 → 可能刷评）

这种交叉验证是用户手动浏览无法做到的。

#### 3. 外国人友好度评估
专门为在葡萄牙的外国从业者设计的维度，现有平台完全没覆盖：
- **签证支持**：公司是否有 Tech Visa / 工作签证资质、是否帮办签证
- **英语工作环境**：评价中提到英语/葡语工作环境的比例
- **国际化程度**：外国员工占比、团队多样性
- **远程/混合**：是否支持 remote work
- **Relocation 支持**：是否提供搬迁补助

这些信息从评价文本中用 AI 提取，不需要额外数据源。

#### 4. Offer 对比模式
用户手上有 2-3 个 offer，输入公司名称，系统自动生成并排对比：
- 综合评分雷达图
- 薪资范围对比
- 文化关键词对比
- 红旗/绿旗对比
- AI 最终建议："如果你看重 X，选 A；如果你看重 Y，选 B"

### 品牌定位
- 产品名：**Job Scout Portugal**（或 **ScoutPT**）
- Tagline：**"Know before you sign"**
- 核心场景：用户收到一个 offer，打开 Job Scout，输入公司名字，看到报告，做出决定
- 覆盖领域：IT（开发、数据、运维）+ 商科（金融、咨询、市场营销、HR、管理）
- 不做：社区、论坛、用户注册才能看内容。报告直接可看，降低使用门槛

---

## 功能需求

### MVP 核心功能（Phase 1）

#### 1. 公司搜索
- 用户输入公司名称（支持模糊搜索）
- 返回匹配的公司列表供选择

#### 2. 数据采集
从以下公开数据源获取信息：

| 数据源 | 数据类型 | 获取方式 | 覆盖领域 |
|--------|----------|----------|----------|
| Teamlyzer | 公司评分、评价摘要、面试信息 | 爬取公开页面 | IT |
| Glassdoor | 评分、薪资范围、评价 | 爬取或非官方 API | IT + 商科 |
| LinkedIn | 公司规模、增长趋势、在招职位数 | 公开页面爬取 | 全行业 |
| itjobs.pt | 当前招聘职位、技术栈要求 | 爬取或 RSS | IT |
| Indeed Portugal | 职位、评价、薪资 | 爬取 | 全行业 |
| Kununu | 雇主评价（欧洲平台） | 爬取 | 全行业 |
| RACIUS | 公司注册信息、成立年份、资本、财务 | 公开数据 | 全行业 |
| sapo emprego / net emprego | 职位信息 | 爬取 | 商科为主 |

#### 3. AI 分析报告
用 LLM 将采集到的原始数据生成结构化报告，包含：

- **公司概览**：规模、成立时间、主营业务、行业、技术栈（IT 类）
- **雇主评分**：综合各平台评分，给出统一分数（1-10）
- **薪资范围**：按职位级别（Junior/Mid/Senior）和领域（IT/商科）展示
- **工作文化**：从评价中提取关键词和情感分析
- **面试难度**：难度评级 + 常见面试流程描述
- **红旗预警**：从负面评价中提取反复出现的问题
- **招聘活跃度**：当前在招职位数量和趋势
- **总结建议**：AI 生成的一段话总结"这家公司值不值得去"

#### 4. 报告缓存
- 同一公司的报告缓存 7 天
- 避免重复爬取，节省资源

### Phase 2（MVP 验证后）
- Offer 对比模式：输入 2-3 家公司，生成并排对比报告 + AI 决策建议
- 外国人友好度专项评估：签证支持、英语环境、国际化程度
- Chrome 插件：在 LinkedIn 职位页面自动显示公司评分
- 薪资净收入计算：结合公司薪资数据 + 葡萄牙 IRS 税率，显示实际到手
- 邮件订阅：关注的公司有新评价时通知
- 多语言支持：英文 / 葡语 / 中文
- 付费功能：免费 3 次/天，付费无限制

---

## 技术架构

### 技术栈

```
前端: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
后端: Next.js API Routes
数据库: PostgreSQL (Supabase 或 Neon)
缓存: Redis (Upstash)
AI: OpenAI API 或 Anthropic API (Claude)
爬虫: Playwright (headless browser) + Cheerio (HTML 解析)
部署: Vercel
```

### 项目结构

```
portugal-it-scout/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 首页：搜索框
│   │   ├── company/
│   │   │   └── [slug]/
│   │   │       └── page.tsx            # 公司报告页
│   │   ├── compare/
│   │   │   └── page.tsx                # Offer 对比页（Phase 2）
│   │   ├── api/
│   │   │   ├── search/
│   │   │   │   └── route.ts            # 公司搜索 API
│   │   │   ├── report/
│   │   │   │   └── route.ts            # 生成报告 API
│   │   │   ├── compare/
│   │   │   │   └── route.ts            # 对比报告 API（Phase 2）
│   │   │   └── scrape/
│   │   │       └── route.ts            # 数据采集 API
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── scrapers/
│   │   │   ├── teamlyzer.ts            # Teamlyzer 爬虫（IT）
│   │   │   ├── glassdoor.ts            # Glassdoor 爬虫（全行业）
│   │   │   ├── linkedin.ts             # LinkedIn 公开数据（全行业）
│   │   │   ├── itjobs.ts               # itjobs.pt 爬虫（IT）
│   │   │   ├── indeed.ts               # Indeed Portugal 爬虫（全行业）
│   │   │   ├── kununu.ts               # Kununu 爬虫（全行业/欧洲）
│   │   │   ├── racius.ts               # RACIUS 公司信息（全行业）
│   │   │   └── index.ts                # 爬虫聚合器
│   │   ├── ai/
│   │   │   ├── analyze.ts              # AI 分析逻辑
│   │   │   └── prompts.ts              # Prompt 模板
│   │   ├── db/
│   │   │   ├── schema.ts               # 数据库 schema
│   │   │   └── queries.ts              # 数据库查询
│   │   ├── cache.ts                    # Redis 缓存逻辑
│   │   └── types.ts                    # TypeScript 类型定义
│   └── components/
│       ├── SearchBar.tsx               # 搜索组件
│       ├── ReportCard.tsx              # 报告卡片
│       ├── ScoreGauge.tsx              # 评分仪表盘
│       ├── SalaryRange.tsx             # 薪资范围可视化
│       ├── RedFlags.tsx                # 红旗预警组件（含置信度标签）
│       ├── ForeignerScore.tsx          # 外国人友好度评估组件
│       ├── CompareTable.tsx            # Offer 对比表格（Phase 2）
│       ├── ReviewAuthenticity.tsx      # 评价可信度指标
│       └── SkeletonReport.tsx          # 加载骨架屏
├── prisma/
│   └── schema.prisma                   # Prisma ORM schema
├── package.json
├── .env.example
└── README.md
```

### 数据库 Schema

```prisma
model Company {
  id            String    @id @default(cuid())
  name          String
  slug          String    @unique
  teamlyzerUrl  String?
  glassdoorUrl  String?
  linkedinUrl   String?
  itjobsUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  reports       Report[]
  rawData       RawData[]
}

model Report {
  id              String   @id @default(cuid())
  companyId       String
  company         Company  @relation(fields: [companyId], references: [id])
  overallScore    Float
  salaryMin       Int?
  salaryMax       Int?
  interviewDifficulty  Float?
  cultureKeywords String[]
  redFlags        String[]
  aiSummary       String   @db.Text
  fullReport      Json
  createdAt       DateTime @default(now())
  expiresAt       DateTime

  @@index([companyId, createdAt])
}

model RawData {
  id         String   @id @default(cuid())
  companyId  String
  company    Company  @relation(fields: [companyId], references: [id])
  source     String   // teamlyzer | glassdoor | linkedin | itjobs | indeed | kununu | racius
  data       Json
  scrapedAt  DateTime @default(now())

  @@index([companyId, source])
}
```

### 核心代码逻辑

#### 爬虫聚合器 (lib/scrapers/index.ts)

```typescript
import { scrapeTeamlyzer } from './teamlyzer';
import { scrapeGlassdoor } from './glassdoor';
import { scrapeLinkedIn } from './linkedin';
import { scrapeItjobs } from './itjobs';
import { scrapeIndeed } from './indeed';
import { scrapeKununu } from './kununu';
import { scrapeRacius } from './racius';

export interface ScrapedData {
  source: string;
  sector?: 'it' | 'business' | 'all';  // 数据源覆盖的领域
  ratings?: { overall: number; culture: number; salary: number };
  reviews?: { text: string; rating: number; date: string; pros: string; cons: string }[];
  salaries?: { role: string; department: string; min: number; max: number; currency: string }[];
  interviews?: { difficulty: number; questions: string[]; process: string; department?: string }[];
  jobs?: { title: string; department: string; techStack?: string[]; remote: boolean; url: string }[];
  companyInfo?: { size: string; founded: string; industry: string; capital?: string };
}

export async function aggregateData(companyName: string): Promise<ScrapedData[]> {
  const results = await Promise.allSettled([
    scrapeTeamlyzer(companyName),    // IT 专项
    scrapeGlassdoor(companyName),    // 全行业
    scrapeLinkedIn(companyName),     // 全行业
    scrapeItjobs(companyName),       // IT 专项
    scrapeIndeed(companyName),       // 全行业
    scrapeKununu(companyName),       // 全行业（欧洲）
    scrapeRacius(companyName),       // 公司基本信息
  ]);

  return results
    .filter((r): r is PromiseFulfilledResult<ScrapedData> => r.status === 'fulfilled')
    .map(r => r.value);
}
```

#### AI 分析 Prompt (lib/ai/prompts.ts)

```typescript
export function buildAnalysisPrompt(companyName: string, data: ScrapedData[]): string {
  return `
You are a career advisor specialized in the Portuguese job market, covering both IT/tech and business sectors (finance, consulting, marketing, HR, management).

Analyze the following data about "${companyName}" and generate a structured report.

## Collected Data
${JSON.stringify(data, null, 2)}

## Output Format (JSON)
{
  "overallScore": 7.5,          // 1-10 综合评分
  "summary": "...",              // 2-3 句话总结
  "companyOverview": {
    "size": "...",
    "founded": "...",
    "techStack": ["..."],
    "industry": "..."
  },
  "salary": {
    "it": {
      "junior": { "min": 0, "max": 0 },
      "mid": { "min": 0, "max": 0 },
      "senior": { "min": 0, "max": 0 }
    },
    "business": {
      "junior": { "min": 0, "max": 0 },
      "mid": { "min": 0, "max": 0 },
      "senior": { "min": 0, "max": 0 }
    },
    "currency": "EUR"
  },
  "culture": {
    "positiveKeywords": ["..."],
    "negativeKeywords": ["..."],
    "workLifeBalance": 7,
    "remoteFriendly": true
  },
  "interview": {
    "difficulty": 6,             // 1-10
    "process": "...",
    "commonQuestions": ["..."],
    "avgDuration": "2 weeks"
  },
  "redFlags": [                   // 交叉验证的负面问题
    {
      "issue": "加班文化严重",
      "confidence": "high",        // high=多平台提及, medium=多条评价, low=个别反馈
      "sources": ["teamlyzer", "glassdoor"],
      "mentions": 8
    }
  ],
  "greenFlags": ["..."],
  "foreignerFriendly": {           // 外国人友好度评估
    "score": 7,                    // 1-10
    "visaSupport": true,           // 是否支持工作签证/Tech Visa
    "englishEnvironment": "high",  // high/medium/low
    "internationalTeam": true,     // 团队是否国际化
    "relocationSupport": null,     // 是否提供搬迁支持
    "notes": "Multiple reviews mention English as working language"
  },
  "reviewAuthenticity": {          // 评价可信度分析
    "score": 8,                    // 1-10
    "totalReviews": 45,
    "suspiciousPatterns": false,   // 是否有刷评嫌疑
    "notes": "Reviews spread over 3 years, consistent patterns"
  },
  "recommendation": "..."
}

Rules:
- Be objective and data-driven
- If data is insufficient for a field, set it to null
- Red flags: cross-validate across platforms. Only mark "high confidence" if mentioned by 2+ sources
- Detect suspicious review patterns (many 5-star reviews in short period, generic language)
- Foreigner-friendly assessment: extract from review text mentions of visa, English, international team, relocation
- Salary ranges should be annual gross in EUR
- Write summary and recommendation in English
- Score should reflect the overall picture, not just ratings
`;
}
```

#### Teamlyzer 爬虫示例 (lib/scrapers/teamlyzer.ts)

```typescript
import * as cheerio from 'cheerio';

const BASE_URL = 'https://pt.teamlyzer.com';

export async function scrapeTeamlyzer(companyName: string): Promise<ScrapedData> {
  // Step 1: 搜索公司
  const searchUrl = `${BASE_URL}/management/companies?q=${encodeURIComponent(companyName)}`;
  const searchPage = await fetch(searchUrl).then(r => r.text());
  const $ = cheerio.load(searchPage);

  // Step 2: 找到公司链接
  const companyLink = $('a[href*="/management/company/"]').first().attr('href');
  if (!companyLink) {
    return { source: 'teamlyzer' };
  }

  // Step 3: 获取公司页面
  const companyPage = await fetch(`${BASE_URL}${companyLink}`).then(r => r.text());
  const $c = cheerio.load(companyPage);

  // Step 4: 提取数据
  return {
    source: 'teamlyzer',
    ratings: {
      overall: parseFloat($c('.rating-overall').text()) || 0,
      culture: parseFloat($c('.rating-culture').text()) || 0,
      salary: parseFloat($c('.rating-salary').text()) || 0,
    },
    reviews: $c('.review-item').map((_, el) => ({
      text: $c(el).find('.review-text').text().trim(),
      rating: parseFloat($c(el).find('.review-rating').text()) || 0,
      date: $c(el).find('.review-date').text().trim(),
      pros: $c(el).find('.pros').text().trim(),
      cons: $c(el).find('.cons').text().trim(),
    })).get(),
  };
}
```

---

## 开发计划

### Week 1：基础搭建
- [ ] 初始化 Next.js 项目，配置 Tailwind + shadcn/ui
- [ ] 设置数据库（Supabase）和 Prisma
- [ ] 搭建基本 UI：首页搜索框 + 报告页骨架
- [ ] 实现 Teamlyzer 爬虫（最简单的数据源）

### Week 2：数据采集
- [ ] 实现 itjobs.pt 爬虫
- [ ] 实现 Glassdoor 爬虫（可能需要 Playwright）
- [ ] 实现 LinkedIn 公开数据抓取
- [ ] 爬虫聚合器 + 错误处理

### Week 3：AI 分析 + 展示
- [ ] 接入 AI API，编写分析 prompt
- [ ] 报告生成逻辑 + 缓存
- [ ] 前端报告页面：评分、薪资、红旗、建议
- [ ] 加载状态 + 错误处理

### Week 4：优化上线
- [ ] 响应式设计（移动端适配）
- [ ] SEO 优化（公司页面静态生成）
- [ ] Rate limiting + 基本反滥用
- [ ] 部署到 Vercel
- [ ] 提交到 Product Hunt / 在 Reddit r/devpt 推广

---

## 环境变量

```env
# .env.example
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# AI
OPENAI_API_KEY=sk-...
# 或
ANTHROPIC_API_KEY=sk-ant-...

# 可选
PLAYWRIGHT_CHROMIUM_PATH=/usr/bin/chromium
```

---

## 部署注意事项

1. **Vercel 免费版限制**：API Route 执行时间最长 10 秒（Pro 版 60 秒）。爬虫可能超时，建议：
   - 使用 Vercel Serverless Functions 的 streaming response
   - 或把爬虫逻辑放到单独的服务（Railway / Fly.io）

2. **爬虫合规**：
   - 遵守 robots.txt
   - 设置合理的请求间隔（2-5 秒）
   - 只采集公开可访问的数据
   - 缓存结果减少请求频率

3. **成本估算**（月）：
   - Supabase 免费版：$0
   - Upstash Redis 免费版：$0
   - Vercel 免费版：$0
   - AI API：约 $10-30（取决于用量）
   - **总计：$10-30/月起步**

---

## 变现策略

### 免费版
- 每天查询 3 家公司
- 基础报告（评分 + 简要总结）

### 付费版（€5/月 或 €39/年）
- 无限查询
- 完整详细报告
- 公司对比功能
- 薪资详细分析
- 面试题库
- 新评价邮件通知

### B2B 版（€49/月起）
- 企业版雇主口碑报告
- 竞对分析
- 人才市场洞察

---

## 快速启动命令

```bash
# 创建项目
npx create-next-app@latest portugal-job-scout --typescript --tailwind --app --src-dir

# 安装依赖
cd portugal-job-scout
npm install prisma @prisma/client cheerio playwright @anthropic-ai/sdk
npm install -D @types/cheerio

# 初始化 shadcn/ui
npx shadcn-ui@latest init

# 初始化 Prisma
npx prisma init

# 安装 Playwright 浏览器
npx playwright install chromium

# 开发
npm run dev
```

---

## 关键提示

给 Claude Code 的额外指令：

1. **先做最小可用版本**：第一版先接 Glassdoor（覆盖全行业）+ Teamlyzer（IT 专项）两个数据源 + AI 分析，跑通整个流程再加其他
2. **爬虫要健壮**：每个爬虫都要有 try-catch，单个数据源失败不影响整体
3. **UI 要简洁专业**：参考 Glassdoor 的公司页面布局，但更简洁
4. **报告要有骨架屏**：爬取 + 分析需要时间，用 skeleton loading 提升体验
5. **所有文本支持英文、葡语和中文**：用户群体是多语言的
6. **行业自动识别**：根据爬取到的数据自动判断公司属于 IT、商科还是混合型，报告展示相应的维度
7. **薪资按部门分开**：同一家公司 IT 和商科的薪资差异很大，报告里要分开展示
