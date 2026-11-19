import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Braces,
  Check,
  CheckCheck,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  Code2,
  Copy,
  Database,
  Download,
  FileInput,
  FileSearch,
  FileText,
  FlaskConical,
  FolderGit2,
  GitBranch,
  Layers3,
  LayoutDashboard,
  Library,
  ListChecks,
  Network,
  NotebookPen,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TerminalSquare,
  Waypoints,
  Zap,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { comparison, notePrompts, sources, weeks, type Project, type Week } from '@/data/roadmap'
import './App.css'

type View = 'overview' | 'roadmap' | 'compare' | 'sources'
type ProgressMap = Record<string, boolean>
type NotesMap = Record<string, string>

const navItems: { id: View; label: string; shortLabel: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: '学习总览', shortLabel: '总览', icon: LayoutDashboard },
  { id: 'roadmap', label: '四周路线', shortLabel: '路线', icon: ListChecks },
  { id: 'compare', label: '架构对照', shortLabel: '对照', icon: Network },
  { id: 'sources', label: '源码地图', shortLabel: '源码', icon: Library },
]

const cloneCommands = [
  { id: 'clone-fastgpt', label: 'FastGPT · v4.17.4', code: 'git clone --branch v4.17.4 --depth 1 https://github.com/labring/FastGPT.git' },
  { id: 'clone-ragflow', label: 'RAGFlow · v1.0.0', code: 'git clone --branch v1.0.0 --depth 1 https://github.com/infiniflow/ragflow.git' },
]

function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = window.localStorage.getItem(key)
      return saved ? (JSON.parse(saved) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // The app remains usable when browser storage is unavailable.
    }
  }, [key, value])

  return [value, setValue] as const
}

function getWeekProgress(week: Week, completed: ProgressMap) {
  const done = week.tasks.filter((task) => completed[task.id]).length
  return { done, total: week.tasks.length, percent: Math.round((done / week.tasks.length) * 100) }
}

function ProjectBadge({ project }: { project: Project }) {
  return <span className={`project-badge project-badge--${project}`}>{project === 'fastgpt' ? 'FastGPT' : 'RAGFlow'}</span>
}

function ProgressRing({ value }: { value: number }) {
  const radius = 51
  const circumference = 2 * Math.PI * radius
  return (
    <div className="progress-ring" aria-label={`总进度 ${value}%`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="progress-ring__track" cx="60" cy="60" r={radius} />
        <circle className="progress-ring__value" cx="60" cy="60" r={radius} strokeDasharray={circumference} strokeDashoffset={circumference - (circumference * value) / 100} />
      </svg>
      <div><strong>{value}<span>%</span></strong><small>总进度</small></div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState<View>('overview')
  const [selectedWeekId, setSelectedWeekId] = useState('week-1')
  const [completed, setCompleted] = usePersistentState<ProgressMap>('rag-source-progress-v1', {})
  const [notes, setNotes] = usePersistentState<NotesMap>('rag-source-notes-v1', {})
  const [copiedId, setCopiedId] = useState('')
  const [exported, setExported] = useState(false)
  const [search, setSearch] = useState('')
  const [projectFilter, setProjectFilter] = useState<'all' | Project>('all')
  const [stageFilter, setStageFilter] = useState('全部')

  const allTasks = useMemo(() => weeks.flatMap((week) => week.tasks), [])
  const completedCount = allTasks.filter((task) => completed[task.id]).length
  const totalPercent = Math.round((completedCount / allTasks.length) * 100)
  const selectedWeek = weeks.find((week) => week.id === selectedWeekId) ?? weeks[0]
  const selectedProgress = getWeekProgress(selectedWeek, completed)
  const currentWeek = weeks.find((week) => getWeekProgress(week, completed).percent < 100) ?? weeks[weeks.length - 1]
  const finishedWeeks = weeks.filter((week) => getWeekProgress(week, completed).percent === 100).length
  const noteCharacters = Object.values(notes).reduce((sum, note) => sum + note.trim().length, 0)
  const allComplete = completedCount === allTasks.length

  const filteredSources = sources.filter((item) => {
    const projectMatches = projectFilter === 'all' || item.project === projectFilter
    const stageMatches = stageFilter === '全部' || item.stage === stageFilter
    const haystack = `${item.title} ${item.path} ${item.description}`.toLowerCase()
    return projectMatches && stageMatches && haystack.includes(search.toLowerCase())
  })

  const navigate = (nextView: View) => {
    setView(nextView)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openWeek = (weekId: string) => {
    setSelectedWeekId(weekId)
    navigate('roadmap')
  }

  const toggleTask = (taskId: string) => {
    setCompleted((previous) => ({ ...previous, [taskId]: !previous[taskId] }))
  }

  const completeWeek = () => {
    setCompleted((previous) => {
      const next = { ...previous }
      selectedWeek.tasks.forEach((task) => { next[task.id] = true })
      return next
    })
  }

  const goToAdjacentWeek = (direction: number) => {
    const index = weeks.findIndex((week) => week.id === selectedWeek.id)
    const next = weeks[index + direction]
    if (next) {
      setSelectedWeekId(next.id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const copyCommand = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = code
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
    setCopiedId(id)
    window.setTimeout(() => setCopiedId(''), 1800)
  }

  const exportRecord = () => {
    const lines = [
      '# FastGPT 主线 + RAGFlow 对照：四周源码学习记录',
      '',
      `- 固定版本：FastGPT v4.17.4 / RAGFlow v1.0.0`,
      `- 总进度：${totalPercent}%（${completedCount}/${allTasks.length} 项任务）`,
      `- 完成周数：${finishedWeeks}/${weeks.length}`,
      `- 导出时间：${new Date().toLocaleString('zh-CN')}`,
      '',
    ]
    weeks.forEach((week) => {
      const progress = getWeekProgress(week, completed)
      lines.push(`## 第 ${week.number} 周：${week.title}（${progress.percent}%）`, '', `**本周产出：** ${week.deliverable}`, '')
      week.tasks.forEach((task) => lines.push(`- [${completed[task.id] ? 'x' : ' '}] ${task.label}：${task.detail}`))
      if (notes[week.id]?.trim()) lines.push('', '### 学习笔记', '', notes[week.id].trim())
      lines.push('')
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'rag-source-learning-record.md'
    anchor.click()
    URL.revokeObjectURL(url)
    setExported(true)
    window.setTimeout(() => setExported(false), 1800)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => navigate('overview')} aria-label="返回学习总览">
          <span className="brand__mark"><Waypoints size={23} /></span>
          <span><strong>RAG Source</strong><small>源码学习地图</small></span>
        </button>

        <nav className="sidebar__nav" aria-label="主导航">
          <p className="nav-caption">学习空间</p>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button key={item.id} type="button" className={view === item.id ? 'nav-item nav-item--active' : 'nav-item'} onClick={() => navigate(item.id)}>
                <Icon size={18} /><span>{item.label}</span>{item.id === 'roadmap' && <span className="nav-item__count">{completedCount}</span>}
              </button>
            )
          })}
        </nav>

        <div className="sidebar__route">
          <div className="sidebar__route-heading"><p className="nav-caption">四周路线</p><span>{finishedWeeks}/4</span></div>
          {weeks.map((week) => {
            const progress = getWeekProgress(week, completed)
            return (
              <button type="button" key={week.id} onClick={() => openWeek(week.id)} className={selectedWeek.id === week.id && view === 'roadmap' ? 'route-item route-item--active' : 'route-item'}>
                <span className={progress.percent === 100 ? 'route-item__dot route-item__dot--done' : 'route-item__dot'}>{progress.percent === 100 && <Check size={11} strokeWidth={3} />}</span>
                <span>第 {week.number} 周 · {week.shortTitle}</span><span className="route-item__percent">{progress.percent}%</span>
              </button>
            )
          })}
        </div>

        <div className="sidebar__versions">
          <p className="nav-caption">固定学习版本</p>
          <span><i className="version-dot version-dot--fastgpt" />FastGPT <strong>v4.17.4</strong></span>
          <span><i className="version-dot version-dot--ragflow" />RAGFlow <strong>v1.0.0</strong></span>
        </div>

        <div className="sidebar__footer">
          <div className="mini-progress"><span style={{ width: `${totalPercent}%` }} /></div>
          <p><strong>{totalPercent}%</strong> 已完成</p>
          <small>进度与笔记仅保存在此浏览器</small>
        </div>
      </aside>

      <div className="main-column">
        <header className="mobile-header">
          <button className="brand brand--mobile" type="button" onClick={() => navigate('overview')}>
            <span className="brand__mark"><Waypoints size={20} /></span><span><strong>RAG Source</strong><small>源码学习地图</small></span>
          </button>
          <span className="mobile-progress">{totalPercent}%</span>
        </header>
        <nav className="mobile-nav" aria-label="移动端主导航">
          {navItems.map((item) => {
            const Icon = item.icon
            return <button type="button" key={item.id} className={view === item.id ? 'active' : ''} onClick={() => navigate(item.id)}><Icon size={19} /><span>{item.shortLabel}</span></button>
          })}
        </nav>

        <main className="main-content">
          {view === 'overview' && (
            <div className="view-stack">
              <section className="hero-panel">
                <div className="hero-panel__copy">
                  <span className="hero-panel__eyebrow"><GitBranch size={15} /> FASTGPT 主线 × RAGFLOW 对照</span>
                  <h1>用四周，把 RAG<br />读成一条调用链。</h1>
                  <p>不追逐仓库的每一次提交。固定版本，以问题为入口，用实验和证据读懂文档如何成为知识、问题如何得到答案。</p>
                  <div className="hero-panel__actions">
                    <Button size="lg" className="hero-primary" onClick={() => openWeek(currentWeek.id)}>{allComplete ? '复盘第四周' : `继续第 ${currentWeek.number} 周`} <ArrowRight size={17} /></Button>
                    <button type="button" className="hero-secondary" onClick={() => navigate('sources')}>打开源码地图 <Library size={15} /></button>
                  </div>
                </div>
                <div className="hero-atlas">
                  <ProgressRing value={totalPercent} />
                  <div className="atlas-flow" aria-label="RAG 学习闭环">
                    {[
                      { icon: FileInput, label: '文档', sub: 'Input' },
                      { icon: Braces, label: '切块', sub: 'Chunk' },
                      { icon: Database, label: '索引', sub: 'Index' },
                      { icon: FileSearch, label: '检索', sub: 'Retrieve' },
                      { icon: Sparkles, label: '生成', sub: 'Answer' },
                    ].map((item, index) => {
                      const Icon = item.icon
                      return <div className="atlas-flow__step" key={item.label}><div className="atlas-node"><Icon size={18} /><span><strong>{item.label}</strong><small>{item.sub}</small></span></div>{index < 4 && <span className="atlas-connector" />}</div>
                    })}
                  </div>
                  <p><Zap size={13} /> 一条写入链，一条读取链，一套证据闭环</p>
                </div>
              </section>

              <section className="stats-grid" aria-label="学习统计">
                <div className="stat-item"><CheckCheck size={20} /><div><strong>{completedCount}<small> / {allTasks.length}</small></strong><p>已完成任务</p></div></div>
                <div className="stat-item"><Layers3 size={20} /><div><strong>{finishedWeeks}<small> / 4</small></strong><p>完成学习周</p></div></div>
                <div className="stat-item"><FolderGit2 size={20} /><div><strong>2<small> 个</small></strong><p>固定源码版本</p></div></div>
                <div className="stat-item"><FileText size={20} /><div><strong>{noteCharacters}<small> 字</small></strong><p>实验笔记</p></div></div>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <div><span className="section-kicker">LEARNING PATH</span><h2>四周，建立完整的 RAG 工程认知</h2></div>
                  <button type="button" onClick={() => openWeek(currentWeek.id)}>查看每周清单 <ChevronRight size={16} /></button>
                </div>
                <div className="week-grid">
                  {weeks.map((week) => {
                    const progress = getWeekProgress(week, completed)
                    return (
                      <button type="button" key={week.id} className={`week-card week-card--${week.number}`} onClick={() => openWeek(week.id)}>
                        <div className="week-card__top"><span>WEEK {week.number}</span>{progress.percent === 100 ? <CircleCheckBig size={20} /> : <span>{progress.done}/{progress.total}</span>}</div>
                        <h3>{week.shortTitle}</h3><h4>{week.title}</h4><p>{week.subtitle}</p>
                        <div className="week-card__deliverable"><Target size={14} /><span>{week.deliverable.split('、')[0]}</span></div>
                        <div className="week-card__progress"><Progress value={progress.percent} /></div>
                        <div className="week-card__footer"><span>{progress.percent}%</span><ArrowUpRight size={16} /></div>
                      </button>
                    )
                  })}
                </div>
              </section>

              <div className="overview-lower">
                <section className="method-panel">
                  <div className="section-heading section-heading--compact"><div><span className="section-kicker">READING METHOD</span><h2>每次只追踪一个问题</h2></div></div>
                  <div className="method-flow">
                    {[
                      { icon: Target, title: '提出问题', text: '例如：Top K 在哪里生效？' },
                      { icon: Code2, title: '预测路径', text: '先写下可能的入口和模块。' },
                      { icon: GitBranch, title: '追踪证据', text: '记录函数、输入和输出。' },
                      { icon: FlaskConical, title: '实验验证', text: '只改一个变量再观察。' },
                    ].map((item, index) => {
                      const Icon = item.icon
                      return <div className="method-step" key={item.title}><span><Icon size={19} /></span><div><strong>{item.title}</strong><p>{item.text}</p></div>{index < 3 && <ChevronRight size={16} />}</div>
                    })}
                  </div>
                  <p className="method-note"><RotateCcw size={15} /> 看懂不是“读过文件”，而是能预测修改后的行为，并用结果验证。</p>
                </section>

                <section className="version-panel">
                  <span className="section-kicker">VERSION NOTE</span><h2>别让旧教程带错路</h2>
                  <p>RAGFlow 本路线固定 <strong>v1.0.0</strong>，优先从 <code>cmd/</code> 与 <code>internal/</code> 的 Go 实现建立架构。旧版 Python 路径可以用于历史对照，但不要直接套目录。</p>
                  <button type="button" onClick={() => navigate('compare')}>查看双项目架构对照 <ArrowRight size={15} /></button>
                </section>
              </div>
            </div>
          )}

          {view === 'roadmap' && (
            <div className="view-stack">
              <div className="page-heading">
                <div><span className="section-kicker">4-WEEK ROADMAP</span><h1>按周推进，用实验验收</h1><p>勾选任务、记录证据。进度与笔记会自动保存在当前浏览器。</p></div>
                <Button variant="outline" className="export-button" onClick={exportRecord}>{exported ? <Check size={16} /> : <Download size={16} />}{exported ? '已导出' : '导出学习记录'}</Button>
              </div>

              <div className="roadmap-layout">
                <aside className="week-selector" aria-label="选择学习周">
                  {weeks.map((week) => {
                    const progress = getWeekProgress(week, completed)
                    return (
                      <button type="button" key={week.id} className={selectedWeek.id === week.id ? 'week-selector__item active' : 'week-selector__item'} onClick={() => setSelectedWeekId(week.id)}>
                        <span className="week-selector__number">W{week.number}</span><span><strong>{week.shortTitle}</strong><small>{week.title}</small></span><span className={progress.percent === 100 ? 'week-selector__status done' : 'week-selector__status'}>{progress.percent === 100 ? <Check size={14} /> : `${progress.percent}%`}</span>
                      </button>
                    )
                  })}
                </aside>

                <div className="week-workspace">
                  <section className={`week-intro week-intro--${selectedWeek.number}`}>
                    <div className="week-intro__meta"><span>WEEK {selectedWeek.number}</span><span><Clock3 size={14} />{selectedWeek.duration}</span></div>
                    <h2>{selectedWeek.title}</h2><p>{selectedWeek.subtitle}</p>
                    <div className="week-intro__goal"><Target size={17} /><span>{selectedWeek.goal}</span></div>
                    <div className="week-intro__progress"><Progress value={selectedProgress.percent} /><strong>{selectedProgress.done}/{selectedProgress.total}</strong><span>{selectedProgress.percent}%</span></div>
                  </section>

                  <section className="task-section">
                    <div className="task-section__heading"><div><h3>本周任务</h3><p>建议按顺序完成，每一步都留下可复查的证据。</p></div><Button variant="outline" size="sm" disabled={selectedProgress.percent === 100} onClick={completeWeek}><CheckCheck size={15} />{selectedProgress.percent === 100 ? '本周已完成' : '完成本周全部'}</Button></div>
                    <div className="task-list">
                      {selectedWeek.tasks.map((task) => {
                        const checked = Boolean(completed[task.id])
                        return (
                          <label key={task.id} className={checked ? 'task-item task-item--done' : 'task-item'} htmlFor={task.id}>
                            <Checkbox id={task.id} checked={checked} onCheckedChange={() => toggleTask(task.id)} />
                            <span className="task-item__copy"><strong>{task.label}</strong><small>{task.detail}</small></span>
                          </label>
                        )
                      })}
                    </div>
                  </section>

                  <section className="reading-section">
                    <div className="section-heading section-heading--compact"><div><span className="section-kicker">SOURCE READING</span><h2>本周源码入口</h2></div></div>
                    <div className="reading-grid">
                      {selectedWeek.readings.map((reading) => (
                        <a href={reading.url} target="_blank" rel="noreferrer" className={`reading-card reading-card--${reading.project}`} key={reading.path}>
                          <div><ProjectBadge project={reading.project} /><ArrowUpRight size={16} /></div><h3>{reading.title}</h3><code>{reading.path}</code><p>{reading.description}</p>
                        </a>
                      ))}
                    </div>
                  </section>

                  <section className="experiment-panel">
                    <div className="experiment-panel__heading"><FlaskConical size={20} /><div><h3>实验协议</h3><p>先保存基线，再改变一个变量。</p></div></div>
                    <ol>{selectedWeek.experiment.map((item, index) => <li key={item}><span>{index + 1}</span><p>{item}</p></li>)}</ol>
                    <div className="deliverable-box"><Target size={17} /><div><strong>本周产出</strong><p>{selectedWeek.deliverable}</p></div></div>
                  </section>

                  <section className="week-note">
                    <div className="week-note__heading"><div><NotebookPen size={19} /><h3>本周实验笔记</h3></div><span>{(notes[selectedWeek.id] ?? '').length} 字 · 自动保存</span></div>
                    <Textarea value={notes[selectedWeek.id] ?? ''} onChange={(event) => setNotes((previous) => ({ ...previous, [selectedWeek.id]: event.target.value }))} placeholder={'我的问题：\n预测路径：\n实际调用链：\n实验设置与结果：\n结论与疑问：'} aria-label={`第 ${selectedWeek.number} 周学习笔记`} />
                    <p><ShieldCheck size={14} /> 通关检查：{selectedWeek.checkpoint}</p>
                  </section>

                  <div className="week-pagination">
                    <button type="button" disabled={selectedWeek.number === 1} onClick={() => goToAdjacentWeek(-1)}><ArrowLeft size={16} />上一周</button>
                    <button type="button" disabled={selectedWeek.number === 4} onClick={() => goToAdjacentWeek(1)}>下一周<ArrowRight size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'compare' && (
            <div className="view-stack">
              <div className="page-heading"><div><span className="section-kicker">ARCHITECTURE COMPARISON</span><h1>同一问题，两种实现路径</h1><p>不是寻找一一对应的文件，而是用同一个工程问题观察两个系统的职责边界。</p></div></div>

              <section className="compare-legend">
                <div><ProjectBadge project="fastgpt" /><strong>产品与工作流主线</strong><span>TypeScript · monorepo · 应用驱动</span></div>
                <div><ProjectBadge project="ragflow" /><strong>文档与检索引擎对照</strong><span>Go 核心 · 摄取管线 · 文档理解</span></div>
              </section>

              <section className="comparison-table" aria-label="FastGPT 与 RAGFlow 架构对照">
                <div className="comparison-row comparison-row--head"><span>工程阶段</span><span>FastGPT v4.17.4</span><span>RAGFlow v1.0.0</span><span>带着什么问题读</span></div>
                {comparison.map((row) => (
                  <div className="comparison-row" key={row.stage}><strong>{row.stage}</strong><code>{row.fastgpt}</code><code>{row.ragflow}</code><p>{row.question}</p></div>
                ))}
              </section>

              <div className="compare-lower">
                <section className="question-panel">
                  <span className="section-kicker">FAULT LOCALIZATION</span><h2>回答错误时，按顺序排查</h2>
                  <div className="fault-list">
                    {[
                      ['01', '文档产物', '原文是否解析正确，Chunk 是否包含答案？'],
                      ['02', '召回结果', '目标 Chunk 是否进入候选，排序是否合理？'],
                      ['03', '上下文', '目标内容是否真正进入模型输入，是否被截断？'],
                      ['04', '生成回答', '模型是否忽略证据、错误组合或编造缺失信息？'],
                    ].map(([number, title, text]) => <div key={number}><span>{number}</span><div><strong>{title}</strong><p>{text}</p></div></div>)}
                  </div>
                </section>
                <section className="note-guide">
                  <span className="note-guide__icon"><NotebookPen size={22} /></span><h2>六问源码笔记</h2><p>不必写成文章，但必须留下可以复查的证据。</p>
                  <ol>{notePrompts.map((prompt, index) => <li key={prompt}><span>{index + 1}</span>{prompt}</li>)}</ol>
                </section>
              </div>
            </div>
          )}

          {view === 'sources' && (
            <div className="view-stack">
              <div className="page-heading"><div><span className="section-kicker">SOURCE ATLAS</span><h1>固定版本的源码地图</h1><p>所有目录链接都指向学习标签，不会因主分支更新而悄悄改变。</p></div></div>

              <section className="clone-section">
                <div className="clone-section__heading"><TerminalSquare size={20} /><div><h2>先固定版本，再开始阅读</h2><p>PowerShell、macOS 和 Linux 终端均可使用。</p></div></div>
                <div className="clone-grid">
                  {cloneCommands.map((command) => <div className="code-block" key={command.id}><div className="code-block__header"><span>{command.label}</span><button type="button" onClick={() => copyCommand(command.id, command.code)}>{copiedId === command.id ? <Check size={15} /> : <Copy size={15} />}{copiedId === command.id ? '已复制' : '复制'}</button></div><pre><code>{command.code}</code></pre></div>)}
                </div>
              </section>

              <div className="source-tools">
                <label className="search-box"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索目录、模块或用途" aria-label="搜索源码目录" />{search && <button type="button" onClick={() => setSearch('')}>清除</button>}</label>
                <div className="source-filter-row"><div className="category-tabs">{([['all', '全部项目'], ['fastgpt', 'FastGPT'], ['ragflow', 'RAGFlow']] as const).map(([value, label]) => <button type="button" key={value} className={projectFilter === value ? 'active' : ''} onClick={() => setProjectFilter(value)}>{label}</button>)}</div><div className="category-tabs category-tabs--stage">{['全部', '入口', '写入', '读取', '工程化'].map((stage) => <button type="button" key={stage} className={stageFilter === stage ? 'active' : ''} onClick={() => setStageFilter(stage)}>{stage}</button>)}</div></div>
              </div>

              <div className="source-result-heading"><p>找到 {filteredSources.length} 个源码入口</p><span>点击在新窗口打开固定版本目录 <ArrowUpRight size={13} /></span></div>
              {filteredSources.length > 0 ? (
                <div className="source-grid">
                  {filteredSources.map((item) => (
                    <a href={item.url} target="_blank" rel="noreferrer" className="source-card" key={item.id}>
                      <div className="source-card__top"><ProjectBadge project={item.project} /><span>{item.stage}</span></div><h2>{item.title}</h2><code>{item.path}</code><p>{item.description}</p><div><span>打开源码</span><ArrowUpRight size={15} /></div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="empty-state"><Search size={28} /><h2>没有匹配的源码入口</h2><p>试试更短的目录名，或清除项目和阶段筛选。</p><Button variant="outline" onClick={() => { setSearch(''); setProjectFilter('all'); setStageFilter('全部') }}>清除筛选</Button></div>
              )}

              <section className="official-docs">
                <div><BookOpen size={20} /><span><strong>官方开发文档</strong><small>环境启动和测试命令以对应版本文档为准</small></span></div>
                <a href="https://github.com/labring/FastGPT/blob/v4.17.4/dev.md" target="_blank" rel="noreferrer">FastGPT dev.md <ArrowUpRight size={14} /></a>
                <a href="https://github.com/infiniflow/ragflow/blob/v1.0.0/internal/development.md" target="_blank" rel="noreferrer">RAGFlow development.md <ArrowUpRight size={14} /></a>
              </section>
            </div>
          )}

          <footer className="app-footer">
            <span><ShieldCheck size={14} />数据保存在本地浏览器，清除浏览器数据前请先导出。</span>
            <div><a href="https://github.com/labring/FastGPT/tree/v4.17.4" target="_blank" rel="noreferrer">FastGPT v4.17.4 <ArrowUpRight size={13} /></a><a href="https://github.com/infiniflow/ragflow/tree/v1.0.0" target="_blank" rel="noreferrer">RAGFlow v1.0.0 <ArrowUpRight size={13} /></a></div>
          </footer>
        </main>
      </div>

      <div className="reset-control">
        <AlertDialog>
          <AlertDialogTrigger asChild><button type="button" title="重置学习数据"><RotateCcw size={14} />重置</button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>重置全部学习数据？</AlertDialogTitle><AlertDialogDescription>这会清除所有任务勾选和学习笔记，且无法撤销。建议先导出学习记录。</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => { setCompleted({}); setNotes({}) }}>确认重置</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
