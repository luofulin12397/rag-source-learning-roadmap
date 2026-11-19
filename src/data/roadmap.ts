export type Project = 'fastgpt' | 'ragflow'

export type Task = {
  id: string
  label: string
  detail: string
}

export type Reading = {
  project: Project
  title: string
  path: string
  description: string
  url: string
}

export type Week = {
  id: string
  number: number
  shortTitle: string
  title: string
  subtitle: string
  duration: string
  goal: string
  deliverable: string
  checkpoint: string
  tasks: Task[]
  readings: Reading[]
  experiment: string[]
}

const fastgptBase = 'https://github.com/labring/FastGPT/tree/v4.17.4'
const ragflowBase = 'https://github.com/infiniflow/ragflow/tree/v1.0.0'

export const weeks: Week[] = [
  {
    id: 'week-1',
    number: 1,
    shortTitle: '跑通与架构',
    title: '先建立地图，再进入源码',
    subtitle: '固定版本、跑通最小知识库，把一次问答拆成可以追踪的调用链。',
    duration: '5 天 · 每天 1.5～2 小时',
    goal: '不追求读完仓库，而是知道请求从哪里进入、核心逻辑住在哪里、数据经过哪些边界。',
    deliverable: '两张架构图、一条 FastGPT 问答调用链、一份包含 5 个问题的源码阅读清单。',
    checkpoint: '关掉文档后，你能指出 FastGPT 的应用层、业务服务层与共享类型层，并解释 RAGFlow v1.0.0 为什么从 cmd/ 和 internal/ 开始读。',
    tasks: [
      { id: 'w1-clone', label: '按固定标签浅克隆两个仓库', detail: 'FastGPT 固定 v4.17.4，RAGFlow 固定 v1.0.0；不要直接跟随主分支。' },
      { id: 'w1-fastgpt-map', label: '阅读 FastGPT README、dev.md 与 monorepo 结构', detail: '重点区分 projects/app、packages/service、packages/global、packages/workflow-core。' },
      { id: 'w1-ragflow-map', label: '阅读 RAGFlow README 与 internal/development.md', detail: '先理解 cmd/ 的启动入口和 internal/ 的领域划分，暂不按旧版 Python 教程逐文件阅读。' },
      { id: 'w1-run', label: '用同一份小语料跑通最小问答', detail: '准备 2 个 Markdown、1 个纯文本和 1 个带表格 PDF；优先完整跑通 FastGPT，RAGFlow 可按机器条件安排。' },
      { id: 'w1-trace', label: '画出 FastGPT 一次聊天请求的调用链', detail: '从 projects/app 的页面或 API 入口出发，记录到 service、模型调用和响应返回的每一跳。' },
      { id: 'w1-questions', label: '写下后续三周要回答的 5 个源码问题', detail: '例如：切分配置在哪里生效？检索结果如何变成 Prompt？引用信息从哪里保留下来？' },
    ],
    readings: [
      { project: 'fastgpt', title: '应用入口', path: 'projects/app', description: '页面、API 路由与应用级装配，从真实请求进入。', url: `${fastgptBase}/projects/app` },
      { project: 'fastgpt', title: '业务服务层', path: 'packages/service', description: '知识库、聊天、工作流和后台任务的核心业务实现。', url: `${fastgptBase}/packages/service` },
      { project: 'ragflow', title: '启动入口', path: 'cmd', description: '从进程入口理解服务如何组装，而不是先扎进算法细节。', url: `${ragflowBase}/cmd` },
      { project: 'ragflow', title: '核心领域目录', path: 'internal', description: 'v1.0.0 的 Go 核心目录，覆盖摄取、解析、检索、服务与观测。', url: `${ragflowBase}/internal` },
    ],
    experiment: [
      '为每个问题记录：入口文件、关键函数、输入、输出、下游调用。',
      '每追踪一跳就画一条箭头；找不到时不要连续打开更多文件，回到路由或接口定义。',
      '周末只保留一张能向别人讲清楚的图，删除所有没有解释作用的细节。',
    ],
  },
  {
    id: 'week-2',
    number: 2,
    shortTitle: '解析与索引',
    title: '追踪一份文档如何变成知识',
    subtitle: '从上传到切块、向量化和持久化，理解写入侧决定检索质量的上限。',
    duration: '5 天 · 每天 1.5～2 小时',
    goal: '把“上传文档”拆成可观察的阶段，弄清每个阶段的配置、元数据和失败边界。',
    deliverable: '一条双项目写入链路、文档解析对照表、一次切分参数单变量实验。',
    checkpoint: '给你任意一个 Chunk，你能解释它来自哪份文档、经过哪些处理、为什么以当前边界切分，以及向量写到了哪里。',
    tasks: [
      { id: 'w2-fastgpt-entry', label: '追踪 FastGPT 文档上传入口', detail: '从 projects/app 找到 API，再进入 packages/service/core/dataset，记录同步与异步边界。' },
      { id: 'w2-fastgpt-index', label: '阅读切分、向量化和后台任务', detail: '结合 core/dataset 与 service/worker，弄清任务状态、向量写入和失败重试分别由谁负责。' },
      { id: 'w2-ragflow-pipeline', label: '阅读 RAGFlow 摄取管线', detail: '从 internal/ingestion 的 service、task、pipeline 开始，观察接口依赖如何组装。' },
      { id: 'w2-ragflow-parser', label: '对照 parser、deepdoc 与 tokenizer', detail: '区分格式解析、版面理解和 Token 统计的职责，记录 Chunk 中保留下来的位置与文档元数据。' },
      { id: 'w2-corpus', label: '用相同语料记录解析产物', detail: '至少记录文档页数、Chunk 数、平均长度、空 Chunk、表格内容和元数据差异。' },
      { id: 'w2-chunk-test', label: '完成一次切分参数单变量实验', detail: '只改变 Chunk 大小或重叠量，保持模型、语料与问题不变；保存前后产物而不是只比较最终回答。' },
    ],
    readings: [
      { project: 'fastgpt', title: '知识库核心', path: 'packages/service/core/dataset', description: '追踪数据处理、索引与检索共用的知识库领域逻辑。', url: `${fastgptBase}/packages/service/core/dataset` },
      { project: 'fastgpt', title: '后台任务', path: 'packages/service/worker', description: '理解耗时任务为什么移出请求线程，以及状态如何推进。', url: `${fastgptBase}/packages/service/worker` },
      { project: 'ragflow', title: '摄取管线', path: 'internal/ingestion', description: '从任务、管线、缓存和注册机制理解写入侧全貌。', url: `${ragflowBase}/internal/ingestion` },
      { project: 'ragflow', title: '文档理解', path: 'internal/deepdoc', description: '观察 DeepDoc 在新架构中的接入边界与模型资源。', url: `${ragflowBase}/internal/deepdoc` },
    ],
    experiment: [
      '使用固定语料，先保存基线配置和解析结果，再改一个参数。',
      '表格 PDF 单独记录：表头是否重复、跨行是否断裂、单元格顺序是否可读。',
      '把问题归类到解析、切分、向量化、任务调度或存储，不要统一称为“索引失败”。',
    ],
  },
  {
    id: 'week-3',
    number: 3,
    shortTitle: '检索与生成',
    title: '追踪一个问题如何得到答案',
    subtitle: '把查询理解、召回、重排、上下文装配、生成和引用串成完整读取侧。',
    duration: '5 天 · 每天 1.5～2 小时',
    goal: '回答不是模型凭空生成的：每个答案都应能回溯到召回结果、上下文和被保留的元数据。',
    deliverable: '一条读取侧时序图、12 题黄金评测集、不同检索配置的结果对照。',
    checkpoint: '面对一个错误答案，你能先检查召回，再检查上下文，最后检查生成；而不是第一反应只修改 Prompt。',
    tasks: [
      { id: 'w3-fastgpt-search', label: '追踪 FastGPT 数据集检索入口', detail: '记录查询向量、候选召回、过滤、Top K 与重排配置在何处生效。' },
      { id: 'w3-fastgpt-chat', label: '阅读聊天与工作流上下文装配', detail: '结合 core/chat、core/workflow，确认召回文本如何进入消息，节点输入输出如何传递。' },
      { id: 'w3-ragflow-engine', label: '阅读 RAGFlow 检索引擎与 Agentic RAG 边界', detail: '先读 internal/engine，再观察 internal/agentic_rag 如何组织更上层的检索决策。' },
      { id: 'w3-citations', label: '把引用信息反向追踪到 Chunk', detail: '检查文档 ID、Chunk ID、位置或页面信息在哪些结构里传递，何时可能丢失。' },
      { id: 'w3-eval-set', label: '建立 12 题黄金评测集', detail: '覆盖事实查找、跨段组合、表格、否定问题和无答案问题；为每题标记应命中的文档或 Chunk。' },
      { id: 'w3-retrieval-test', label: '比较检索配置而不是凭感觉调 Prompt', detail: '在版本支持的前提下对比召回方式、Top K 或重排；记录命中情况、上下文长度和答案差异。' },
    ],
    readings: [
      { project: 'fastgpt', title: '聊天链路', path: 'packages/service/core/chat', description: '从会话业务逻辑追踪检索结果如何进入生成流程。', url: `${fastgptBase}/packages/service/core/chat` },
      { project: 'fastgpt', title: '工作流核心', path: 'packages/service/core/workflow', description: '观察知识库检索节点与上下游节点的数据传递。', url: `${fastgptBase}/packages/service/core/workflow` },
      { project: 'ragflow', title: '检索引擎', path: 'internal/engine', description: '从引擎边界理解读取侧，而不是从最终回答倒猜实现。', url: `${ragflowBase}/internal/engine` },
      { project: 'ragflow', title: '提示词资源', path: 'internal/rag/prompts', description: '对照提示词组织与上游上下文，避免把 Prompt 当作独立黑盒。', url: `${ragflowBase}/internal/rag/prompts` },
    ],
    experiment: [
      '每题先保存原始召回列表，再保存重排后的列表，最后保存实际发送给模型的上下文。',
      '分别标记“未召回”“已召回但未进入上下文”“进入上下文但回答错误”。',
      '加入一道语料无法回答的问题，观察系统是否明确表达不确定性。',
    ],
  },
  {
    id: 'week-4',
    number: 4,
    shortTitle: '评测与优化',
    title: '用证据完成一次性能闭环',
    subtitle: '把“感觉更快、更准”变成可复现的指标、计时和单变量对照。',
    duration: '5 天 · 每天 1.5～2 小时',
    goal: '先定位瓶颈，再选择一个变量优化；同时观察质量、延迟和资源消耗，避免只优化单一数字。',
    deliverable: '一份评测报告、一张分阶段耗时图、一次优化前后对照和最终架构总结。',
    checkpoint: '你能用同一批数据和问题证明优化有效，也能说明它牺牲了什么、在哪些场景可能退化。',
    tasks: [
      { id: 'w4-metrics', label: '固定质量与性能指标', detail: '至少记录 Recall@K、MRR 或人工命中率，以及端到端延迟、分阶段耗时和失败率。' },
      { id: 'w4-profile', label: '为一次问答建立时间线', detail: '分别测量检索、重排、模型首 token 和总生成时间；写入侧另测解析、向量化和入库。' },
      { id: 'w4-cache', label: '研究 RAGFlow 摄取缓存与观测实现', detail: '阅读 chunkcache、mediacache、observability；重复处理同一文件，验证哪些阶段真正被跳过。' },
      { id: 'w4-benchmark', label: '阅读 FastGPT 测试与 Benchmark 配置', detail: '从 packages/service 的 Vitest 配置和 worker 找到可复用测试入口，先跑最小相关测试集。' },
      { id: 'w4-optimize', label: '完成一次单变量优化', detail: '可选项：切分大小、Top K、重排、缓存或任务并发；必须保持评测集和其他配置不变。' },
      { id: 'w4-report', label: '完成毕业报告并整理一个可复现改进', detail: '包含架构图、瓶颈证据、实验数据、结论与限制；改进可以是测试、文档或小修复，不必强行提交 PR。' },
    ],
    readings: [
      { project: 'fastgpt', title: '服务测试', path: 'packages/service/test', description: '从已有测试理解服务边界和最小验证方式。', url: `${fastgptBase}/packages/service/test` },
      { project: 'fastgpt', title: '共享类型与契约', path: 'packages/global', description: '优化或修改前，先确认共享数据结构的影响范围。', url: `${fastgptBase}/packages/global` },
      { project: 'ragflow', title: '摄取缓存', path: 'internal/ingestion/chunkcache', description: '研究缓存键、命中条件和失效边界，而不是只看是否变快。', url: `${ragflowBase}/internal/ingestion/chunkcache` },
      { project: 'ragflow', title: '观测能力', path: 'internal/observability', description: '从已有日志和测试学习如何留下可验证的运行证据。', url: `${ragflowBase}/internal/observability` },
    ],
    experiment: [
      '每个配置至少完整运行两轮：第一轮包含冷启动，第二轮观察稳定状态，分别记录。',
      '报告平均值之外保留 P50、P95 或最大耗时；样本少时明确标注，不伪造统计显著性。',
      '最终结论采用“指标变化＋适用条件＋副作用”的结构，不写没有证据的“性能提升明显”。',
    ],
  },
]

export type SourceItem = {
  id: string
  project: Project
  stage: '入口' | '写入' | '读取' | '工程化'
  path: string
  title: string
  description: string
  url: string
}

export const sources: SourceItem[] = [
  { id: 'fg-app', project: 'fastgpt', stage: '入口', path: 'projects/app', title: 'Next.js 应用与 API', description: '从界面和路由进入真实业务调用。', url: `${fastgptBase}/projects/app` },
  { id: 'fg-service', project: 'fastgpt', stage: '入口', path: 'packages/service', title: '业务服务总入口', description: '知识库、聊天、工作流与任务的实现层。', url: `${fastgptBase}/packages/service` },
  { id: 'fg-dataset', project: 'fastgpt', stage: '写入', path: 'packages/service/core/dataset', title: '知识库领域逻辑', description: '解析、索引与检索的共同核心。', url: `${fastgptBase}/packages/service/core/dataset` },
  { id: 'fg-worker', project: 'fastgpt', stage: '写入', path: 'packages/service/worker', title: '异步工作任务', description: '观察耗时处理、状态与失败边界。', url: `${fastgptBase}/packages/service/worker` },
  { id: 'fg-chat', project: 'fastgpt', stage: '读取', path: 'packages/service/core/chat', title: '聊天业务链路', description: '追踪召回上下文到模型生成。', url: `${fastgptBase}/packages/service/core/chat` },
  { id: 'fg-workflow', project: 'fastgpt', stage: '读取', path: 'packages/service/core/workflow', title: '工作流业务实现', description: '理解检索节点和其他节点的数据流。', url: `${fastgptBase}/packages/service/core/workflow` },
  { id: 'fg-global', project: 'fastgpt', stage: '工程化', path: 'packages/global', title: '共享类型与契约', description: '跨包修改前先确认影响范围。', url: `${fastgptBase}/packages/global` },
  { id: 'fg-test', project: 'fastgpt', stage: '工程化', path: 'packages/service/test', title: '服务测试', description: '学习最小测试和模块边界验证。', url: `${fastgptBase}/packages/service/test` },
  { id: 'rf-cmd', project: 'ragflow', stage: '入口', path: 'cmd', title: '进程启动入口', description: '从服务组装开始建立全局地图。', url: `${ragflowBase}/cmd` },
  { id: 'rf-server', project: 'ragflow', stage: '入口', path: 'internal/server', title: '服务内部边界', description: '理解请求如何进入领域服务。', url: `${ragflowBase}/internal/server` },
  { id: 'rf-ingestion', project: 'ragflow', stage: '写入', path: 'internal/ingestion', title: '摄取总管线', description: '任务、管线、缓存、组件和注册机制。', url: `${ragflowBase}/internal/ingestion` },
  { id: 'rf-pipeline', project: 'ragflow', stage: '写入', path: 'internal/ingestion/pipeline', title: '管线编排', description: '集中追踪文档写入的处理顺序。', url: `${ragflowBase}/internal/ingestion/pipeline` },
  { id: 'rf-parser', project: 'ragflow', stage: '写入', path: 'internal/parser', title: '格式解析', description: '区分格式解析与更深层版面理解。', url: `${ragflowBase}/internal/parser` },
  { id: 'rf-deepdoc', project: 'ragflow', stage: '写入', path: 'internal/deepdoc', title: 'DeepDoc 接入', description: '观察文档理解能力与原生资源边界。', url: `${ragflowBase}/internal/deepdoc` },
  { id: 'rf-tokenizer', project: 'ragflow', stage: '写入', path: 'internal/tokenizer', title: 'Token 统计', description: '理解模型词表、长度约束和资源依赖。', url: `${ragflowBase}/internal/tokenizer` },
  { id: 'rf-engine', project: 'ragflow', stage: '读取', path: 'internal/engine', title: '检索引擎', description: '读取侧核心边界与检索能力。', url: `${ragflowBase}/internal/engine` },
  { id: 'rf-agentic', project: 'ragflow', stage: '读取', path: 'internal/agentic_rag', title: 'Agentic RAG', description: '观察上层检索决策与基础引擎的分工。', url: `${ragflowBase}/internal/agentic_rag` },
  { id: 'rf-prompts', project: 'ragflow', stage: '读取', path: 'internal/rag/prompts', title: 'RAG 提示词', description: '结合上游上下文阅读生成约束。', url: `${ragflowBase}/internal/rag/prompts` },
  { id: 'rf-cache', project: 'ragflow', stage: '工程化', path: 'internal/ingestion/chunkcache', title: 'Chunk 缓存', description: '研究重复摄取的命中与失效条件。', url: `${ragflowBase}/internal/ingestion/chunkcache` },
  { id: 'rf-observability', project: 'ragflow', stage: '工程化', path: 'internal/observability', title: '运行观测', description: '从日志与测试建立可验证证据。', url: `${ragflowBase}/internal/observability` },
]

export const comparison = [
  { stage: '请求入口', fastgpt: 'projects/app', ragflow: 'cmd/ + internal/server', question: '请求在哪完成鉴权、参数解析和依赖装配？' },
  { stage: '文档写入', fastgpt: 'core/dataset + service/worker', ragflow: 'internal/ingestion', question: '哪些步骤同步执行，哪些步骤进入后台任务？' },
  { stage: '文档理解', fastgpt: 'dataset 数据处理链', ragflow: 'parser + deepdoc + tokenizer', question: '格式、版面、切分和 Token 约束分别由谁负责？' },
  { stage: '检索召回', fastgpt: 'core/dataset', ragflow: 'internal/engine', question: '候选如何产生、过滤、排序，元数据在哪里保留？' },
  { stage: '上下文生成', fastgpt: 'core/chat + core/workflow', ragflow: 'agentic_rag + rag/prompts', question: '召回结果如何变成模型输入，引用如何返回？' },
  { stage: '质量与性能', fastgpt: 'service/test + Benchmark 配置', ragflow: 'chunkcache + observability', question: '如何证明优化有效，而不是只观察一次成功回答？' },
]

export const notePrompts = [
  '今天追踪的输入和最终产物是什么？',
  '我原先假设调用链会经过哪里？',
  '实际入口、关键函数和数据结构是什么？',
  '哪一处与预期不同，证据是什么？',
  '这次实验只改变了哪个变量？',
  '明天要从哪一个具体问题继续？',
]
