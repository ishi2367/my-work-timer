import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import './App.css'

type IconName = 'study' | 'book' | 'work' | 'exercise' | 'coffee' | 'more' | 'home' | 'chart' | 'settings' | 'play' | 'pause' | 'stop' | 'clock' | 'watch' | 'left' | 'right' | 'up' | 'down' | 'check'
function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    study: <><rect x="5" y="4" width="14" height="12" rx="1.5"/><path d="M3 19h18M7 16l-3 3m13-3 3 3"/></>,
    book: <><path d="M12 5v15M12 6C9 3 5 3 2 4v14c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-7-1-10 2Z"/></>,
    work: <><path d="m4 15 11-11a2 2 0 0 1 3 0l2 2a2 2 0 0 1 0 3L9 20l-6 1 1-6Zm9-9 5 5M4 15l5 5"/></>,
    exercise: <><path d="M7 12h10M2 9v6m20-6v6"/><rect x="4" y="6" width="3" height="12" rx="1"/><rect x="17" y="6" width="3" height="12" rx="1"/></>,
    coffee: <><path d="M4 5h13v10a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5ZM17 6h2a3 3 0 0 1 0 6h-2"/></>,
    more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    home: <><path d="m3 10 9-7 9 7v11h-6v-7H9v7H3Z"/></>,
    chart: <><path d="M5 20v-7m7 7V4m7 16V9" strokeWidth="3.5"/></>,
    settings: <><path d="m10 3-1 3-3 1-3-1-1 4 3 2v3l-2 2 3 3 3-1 3 2 2-3 3-1 3 1 1-4-3-2v-3l2-2-3-3-3 1-2-3Z"/><circle cx="12" cy="12" r="3"/></>,
    play: <path d="m8 4 12 8-12 8Z" fill="currentColor" stroke="none"/>,
    pause: <><rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor" stroke="none"/></>,
    stop: <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3M19 3l2 2"/></>,
    watch: <><circle cx="12" cy="14" r="8"/><path d="M12 10v5M9 2h6m-3 0v4m7 0 2 2"/></>,
    left: <path d="m14 5-7 7 7 7"/>, right: <path d="m10 5 7 7-7 7"/>,
    up: <path d="m6 15 6-6 6 6"/>, down: <path d="m6 9 6 6 6-6"/>, check: <path d="m5 12 4 4 10-10"/>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

const tasks: { name: string; icon: IconName; color: string; pale: string }[] = [
  { name: '勉強', icon: 'study', color: '#ff566b', pale: '#ffe6e9' },
  { name: '読書', icon: 'book', color: '#347df4', pale: '#e7f0ff' },
  { name: '仕事', icon: 'work', color: '#efa91f', pale: '#fff1cf' },
  { name: '運動', icon: 'exercise', color: '#28b77d', pale: '#e0f6e9' },
  { name: '休憩', icon: 'coffee', color: '#8270e8', pale: '#eeebff' },
  { name: 'その他', icon: 'more', color: '#9299a8', pale: '#f0f1f5' },
]
const taskFor = (name: string) => tasks.find(t => t.name === name) ?? tasks[5]
function Badge({ name, large = false }: { name: string; large?: boolean }) {
  const task = taskFor(name)
  return <span className={`task-icon ${large ? 'large' : ''}`} style={{ color: task.color, background: task.pale }}><Icon name={task.icon} size={large ? 29 : 23}/></span>
}
function PlantClock() {
  return <svg className="plant-clock" width="111" height="99" viewBox="0 0 111 99" fill="none" aria-hidden="true">
    <circle cx="72" cy="52" r="38" fill="#fff4e7"/>
    <path d="M28 76V38" stroke="#79ac66" strokeWidth="3"/>
    <ellipse cx="18" cy="38" rx="12" ry="8" transform="rotate(25 18 38)" fill="#8abd73"/>
    <ellipse cx="37" cy="30" rx="12" ry="8" transform="rotate(-35 37 30)" fill="#9bca84"/>
    <path d="M15 61h28l-4 24H20Z" fill="#f5cc9c"/><path d="M15 61h28v5H15Z" fill="#f9dbb8"/>
    <circle cx="71" cy="66" r="25" fill="white" stroke="#ffbd79" strokeWidth="4"/>
    <path d="M71 50v17l10 6M71 45v3M91 66h-3M71 87v-3M50 66h3M66 23v-7m16 10 4-6m8 17 6-3" stroke="#ffbd79" strokeWidth="3" strokeLinecap="round"/>
  </svg>
}

type WorkRecord = { id: string; taskName: string; startedAt: string; endedAt: string; elapsedMs: number }
const STORAGE_KEY = 'my-work-timer.records.v1'
function readRecords(): WorkRecord[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === null) return []
  const value: unknown = JSON.parse(raw)
  if (!Array.isArray(value) || !value.every((record: unknown) => {
    if (typeof record !== 'object' || record === null) return false
    const item = record as Partial<WorkRecord>
    return typeof item.id === 'string' && typeof item.taskName === 'string'
      && typeof item.startedAt === 'string' && Number.isFinite(Date.parse(item.startedAt))
      && typeof item.endedAt === 'string' && Number.isFinite(Date.parse(item.endedAt))
      && typeof item.elapsedMs === 'number' && Number.isFinite(item.elapsedMs) && item.elapsedMs >= 0
  })) throw new Error('Invalid saved records')
  return value as WorkRecord[]
}
function formatTime(ms: number, short = false) {
  const s = Math.floor(Math.max(0, ms) / 1000)
  const parts = [Math.floor(s / 3600), Math.floor(s % 3600 / 60), s % 60]
  return (short && parts[0] === 0 ? parts.slice(1) : parts).map(n => String(n).padStart(2, '0')).join(':')
}
function durationText(ms: number) {
  const m = Math.floor(ms / 60000)
  return m >= 60 ? `${Math.floor(m / 60)}時間${m % 60}分` : m > 0 ? `${m}分` : `${Math.floor(ms / 1000)}秒`
}
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
const dateText = (value: string) => new Date(value).toLocaleString('ja-JP', { hour12: false })
type Screen = 'home' | 'choice' | 'setup' | 'session' | 'records' | 'settings'
type Mode = 'stopwatch' | 'timer'
type Session = { id: string; taskName: string; began: number; accumulated: number; resumed: number | null; mode: Mode; target: number; pending: WorkRecord | null }

function App() {
  const [selected, setSelected] = useState('勉強')
  const [screen, setScreen] = useState<Screen>('home')
  const [mode, setMode] = useState<Mode>('stopwatch')
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [target, setTarget] = useState(25 * 60000)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [history] = useState(() => {
    try { return { records: readRecords(), error: '' } }
    catch { return { records: [], error: '記録を読み込めませんでした。ブラウザーの保存設定をご確認ください。' } }
  })
  const [records, setRecords] = useState<WorkRecord[]>(history.records)
  const [error, setError] = useState(history.error)
  const [notice, setNotice] = useState('')
  const session = useRef<Session | null>(null)
  const [period, setPeriod] = useState<'day' | 'month' | 'year'>('day')
  const [date, setDate] = useState(() => new Date())
  const [detail, setDetail] = useState(false)
  const [taskOrder, setTaskOrder] = useState(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem('my-work-timer.task-order.v1') ?? 'null')
      if (Array.isArray(saved) && saved.length === tasks.length && new Set(saved).size === tasks.length && saved.every(n => tasks.some(t => t.name === n))) return saved as string[]
    } catch { /* Default order is usable when preferences are unavailable. */ }
    return tasks.map(t => t.name)
  })

  const finish = useCallback((automatic = false) => {
    const current = session.current
    if (!current) return
    const now = Date.now()
    const measured = current.accumulated + (current.resumed === null ? 0 : Math.max(0, now - current.resumed))
    const duration = current.mode === 'timer' ? Math.min(measured, current.target) : measured
    const record = current.pending ?? {
      id: current.id, taskName: current.taskName, startedAt: new Date(current.began).toISOString(),
      endedAt: new Date(automatic ? now - Math.max(0, measured - duration) : now).toISOString(), elapsedMs: duration,
    }
    current.pending = record
    current.resumed = null
    current.accumulated = record.elapsedMs
    setRunning(false)
    setElapsed(record.elapsedMs)
    try {
      const next = [record, ...readRecords().filter(r => r.id !== record.id)]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setRecords(next)
      session.current = null
      setError('')
      setNotice(automatic ? 'タイマーが終了しました。記録を保存しました。' : 'おつかれさま。記録を保存しました。')
      setScreen('home')
    } catch {
      setError('保存できませんでした。ブラウザーの保存設定や空き容量を確認し、終了ボタンでもう一度お試しください。')
    }
  }, [])

  useEffect(() => {
    if (!running) return
    const tick = () => {
      const current = session.current
      if (!current || current.resumed === null) return
      const measured = current.accumulated + Math.max(0, Date.now() - current.resumed)
      if (current.mode === 'timer' && measured >= current.target) finish(true)
      else setElapsed(measured)
    }
    const interval = window.setInterval(tick, 100)
    return () => window.clearInterval(interval)
  }, [running, finish])

  function start(nextMode: Mode) {
    const duration = (hours * 3600 + minutes * 60 + seconds) * 1000
    if (nextMode === 'timer' && duration === 0) return
    const now = Date.now()
    session.current = { id: crypto.randomUUID(), taskName: selected, began: now, accumulated: 0, resumed: now, mode: nextMode, target: duration, pending: null }
    setMode(nextMode); setTarget(duration); setElapsed(0); setError(''); setNotice(''); setRunning(true); setScreen('session')
  }
  function togglePause() {
    const current = session.current
    if (!current || current.pending) return
    if (current.resumed !== null) {
      const measured = current.accumulated + Math.max(0, Date.now() - current.resumed)
      if (current.mode === 'timer' && measured >= current.target) { finish(true); return }
      current.accumulated = measured; current.resumed = null
      setElapsed(measured); setRunning(false)
    } else { current.resumed = Date.now(); setRunning(true) }
  }
  function moveTask(index: number, offset: number) {
    const next = [...taskOrder]
    const other = index + offset
    if (other < 0 || other >= next.length) return
    ;[next[index], next[other]] = [next[other], next[index]]
    try { localStorage.setItem('my-work-timer.task-order.v1', JSON.stringify(next)); setTaskOrder(next); setError('') }
    catch { setError('並び順を保存できませんでした。ブラウザーの保存設定をご確認ください。') }
  }
  function shiftDate(offset: number) {
    if (period === 'year') setDate(new Date(date.getFullYear() + offset, 0, 1))
    else if (period === 'day' && detail) setDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset))
    else setDate(new Date(date.getFullYear(), date.getMonth() + offset, 1))
  }
  const filtered = records.filter(r => {
    const d = new Date(r.startedAt)
    return period === 'year' ? d.getFullYear() === date.getFullYear() : period === 'month' ? d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() : dayKey(d) === dayKey(date)
  })
  const total = filtered.reduce((sum, r) => sum + r.elapsedMs, 0)
  const totals = tasks.map(t => ({ ...t, duration: filtered.filter(r => r.taskName === t.name).reduce((sum, r) => sum + r.elapsedMs, 0) }))
  const maxTotal = Math.max(1, ...totals.map(t => t.duration))
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  const dateLabel = period === 'year' ? `${date.getFullYear()}年` : period === 'day' && detail ? date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }) : `${date.getFullYear()}年${date.getMonth() + 1}月`
  const sessionScreen = screen === 'session' || screen === 'choice' || screen === 'setup'
  const progress = mode === 'timer' ? Math.max(0, 1 - elapsed / target) : (elapsed % 60000) / 60000

  return <main className={`app ${sessionScreen ? 'focus-layout' : ''}`}>
    {error && <p className="storage-error" role="alert">{error}</p>}
    {sessionScreen && <button className="back-button icon-button" aria-label={screen === 'session' ? '終了してホームに戻る' : 'ホームに戻る'} onClick={() => screen === 'session' ? finish() : setScreen('home')}><Icon name="left" size={21}/></button>}

    {screen === 'home' && <>
      <header className="heading"><h1>やることを選んで<br/>はじめよう</h1><PlantClock/></header>
      {notice && <p className="save-notice" role="status"><Icon name="check" size={16}/>{notice}</p>}
      <section className="task-list" aria-label="やること">
        {taskOrder.map(name => <button key={name} className={`task ${selected === name ? 'selected' : ''}`} onClick={() => { setSelected(name); setScreen('choice'); setNotice('') }}><Badge name={name}/><span className="task-name">{name}</span><span className={`radio ${selected === name ? 'checked' : ''}`}/></button>)}
      </section>
      <section className="actions"><button className="start stopwatch" onClick={() => start('stopwatch')}><Icon name="play" size={20}/>ストップウォッチをはじめる</button><button className="start timer" onClick={() => setScreen('setup')}><Icon name="watch" size={22}/>タイマーをはじめる</button></section>
    </>}

    {sessionScreen && <div className="selected-task"><Badge name={selected} large/><h1>{selected}</h1></div>}
    {screen === 'choice' && <section className="mode-options" aria-label="開始方法の選択">
      <button className="mode-card red" onClick={() => start('stopwatch')}><span className="mode-icon"><Icon name="watch" size={40}/></span><h2>ストップウォッチ</h2><p>経過時間を計測します<br/>（カウントアップ）</p></button>
      <button className="mode-card blue" onClick={() => setScreen('setup')}><span className="mode-icon"><Icon name="clock" size={39}/></span><h2>タイマー</h2><p>作業時間をあらかじめ決めて<br/>計測します</p></button>
    </section>}

    {screen === 'setup' && <section className="timer-setup"><h2>作業時間を設定</h2><div className="time-picker">
      {([{ label: '時間', value: hours, max: 23, set: setHours }, { label: '分', value: minutes, max: 59, set: setMinutes }, { label: '秒', value: seconds, max: 59, set: setSeconds }]).map(p => <div className="picker-column" key={p.label}><button className="picker-arrow" aria-label={`${p.label}を増やす`} onClick={() => p.set((p.value + 1) % (p.max + 1))}><Icon name="up" size={18}/></button><span className="picker-neighbor" aria-hidden="true">{String((p.value + p.max) % (p.max + 1)).padStart(2, '0')}</span><input type="number" min="0" max={p.max} aria-label={p.label} value={p.value} onChange={e => p.set(Math.min(p.max, Math.max(0, Math.floor(Number(e.target.value) || 0))))}/><span className="picker-neighbor" aria-hidden="true">{String((p.value + 1) % (p.max + 1)).padStart(2, '0')}</span><button className="picker-arrow" aria-label={`${p.label}を減らす`} onClick={() => p.set((p.value + p.max) % (p.max + 1))}><Icon name="down" size={18}/></button><span className="picker-unit">{p.label}</span></div>)}
      </div><button className="start timer" disabled={hours + minutes + seconds === 0} onClick={() => start('timer')}><Icon name="play"/>タイマーをはじめる</button>
    </section>}

    {screen === 'session' && <section className={`session-screen ${mode}`} aria-label={mode === 'timer' ? 'タイマー' : 'ストップウォッチ'}>
      <div className="time-circle"><svg viewBox="0 0 280 280" className="progress-ring" aria-hidden="true"><circle className="ring-track" cx="140" cy="140" r="129"/><circle className="ring-value" cx="140" cy="140" r="129" pathLength="100" strokeDasharray={`${Math.max(0.4, progress * 100)} 100`} transform="rotate(-90 140 140)"/></svg><div className="time-content"><span className="time-display">{formatTime(mode === 'timer' ? Math.ceil(Math.max(0, target - elapsed) / 1000) * 1000 : elapsed, mode === 'timer')}</span><span className="time-caption">{!running ? '一時停止中' : mode === 'timer' ? '残り時間' : '経過時間'}</span></div></div>
      <div className="session-actions"><button className="round-action" onClick={togglePause} disabled={!!error}><span className="round-button pause"><Icon name={running ? 'pause' : 'play'} size={29}/></span><span>{running ? '一時停止' : '再開する'}</span></button><button className="round-action" onClick={() => finish()}><span className="round-button finish"><Icon name="stop" size={30}/></span><span>終了する</span></button></div>
      <p className="session-note">終了すると、自動で記録されます</p>
    </section>}

    {screen === 'records' && <section className="records-screen" aria-label="作業記録">
      <header className="page-heading">{detail && <button className="icon-button" aria-label="カレンダーに戻る" onClick={() => setDetail(false)}><Icon name="left" size={20}/></button>}<h1>記録</h1></header>
      <div className="segments" aria-label="記録の表示期間">{(['day', 'month', 'year'] as const).map((p, i) => <button key={p} className={period === p ? 'active' : ''} aria-pressed={period === p} onClick={() => { setPeriod(p); setDetail(false) }}>{['日', '月', '年'][i]}</button>)}</div>
      <div className="date-navigation"><button className="icon-button" aria-label="前の期間" onClick={() => shiftDate(-1)}><Icon name="left" size={17}/></button><h2>{dateLabel}</h2><button className="icon-button" aria-label="次の期間" onClick={() => shiftDate(1)}><Icon name="right" size={17}/></button></div>
      {period === 'day' && !detail && <div className="calendar"><div className="weekdays">{'日月火水木金土'.split('').map(d => <span key={d}>{d}</span>)}</div><div className="calendar-grid">{Array.from({ length: firstDay }, (_, i) => <span key={`blank-${i}`}/>)}{Array.from({ length: daysInMonth }, (_, i) => {
        const d = new Date(date.getFullYear(), date.getMonth(), i + 1)
        const names = [...new Set(records.filter(r => dayKey(new Date(r.startedAt)) === dayKey(d)).map(r => r.taskName))]
        return <button key={i} className={`calendar-day ${date.getDate() === i + 1 ? 'chosen' : ''} ${dayKey(d) === dayKey(new Date()) ? 'today' : ''}`} aria-label={`${date.getMonth() + 1}月${i + 1}日、${names.length ? '記録あり' : '記録なし'}`} aria-pressed={date.getDate() === i + 1} onClick={() => { setDate(d); setDetail(true) }}><span>{i + 1}</span><span className="day-dots">{names.slice(0, 4).map(n => <i key={n} style={{ background: taskFor(n).color }}/>)}</span></button>
      })}</div></div>}
      <div className="total-line"><span>{period === 'day' && !detail ? `${date.getDate()}日の合計` : '合計'}</span><strong>{durationText(total)}</strong></div>
      {(period !== 'day' || detail) && <div className="summary-list">{totals.filter(t => period !== 'day' || t.duration > 0).map(t => <div className="summary-row" key={t.name}><Badge name={t.name}/><div className="summary-body"><div><span>{t.name}</span><span>{durationText(t.duration)}</span></div>{period !== 'day' && <div className="bar-track"><span style={{ width: `${t.duration / maxTotal * 100}%`, background: t.color }}/></div>}</div></div>)}</div>}
      {filtered.length === 0 && <div className="empty-state"><Icon name="chart" size={31}/><p>この期間の記録はまだありません</p><small>今日のひとつから、はじめよう。</small></div>}
      {period === 'day' && filtered.length > 0 && <div className="history-section"><h3>作業の履歴</h3>{filtered.map(r => <article className="history-row" key={r.id}><div className="history-title"><span>{r.taskName}</span><strong>{formatTime(r.elapsedMs)}</strong></div><p>開始 {dateText(r.startedAt)}<br/>終了 {dateText(r.endedAt)}</p></article>)}</div>}
      <p className="record-note">記録は開始した日に集計されます</p>
    </section>}

    {screen === 'settings' && <section className="settings-screen"><header className="page-heading"><h1>設定</h1></header><h2 className="section-label">やることの管理</h2><p className="settings-description">矢印でホームの並び順を変更できます</p><div className="settings-list">{taskOrder.map((name, i) => <div className="settings-row" key={name}><Badge name={name}/><span>{name}</span><button className="icon-button" aria-label={`${name}を上に移動`} disabled={i === 0} onClick={() => moveTask(i, -1)}><Icon name="up" size={19}/></button><button className="icon-button" aria-label={`${name}を下に移動`} disabled={i === taskOrder.length - 1} onClick={() => moveTask(i, 1)}><Icon name="down" size={19}/></button></div>)}</div><div className="storage-info"><Icon name="check" size={19}/><div><strong>作業の記録は自動保存</strong><p>終了した作業は、このブラウザーに保存されます。</p></div></div></section>}

    {!sessionScreen && <nav className="bottom-nav" aria-label="メインメニュー">{([{ key: 'home', label: 'ホーム', icon: 'home' }, { key: 'records', label: '記録', icon: 'chart' }, { key: 'settings', label: '設定', icon: 'settings' }] as const).map(item => <button key={item.key} className={screen === item.key ? 'nav-active' : ''} aria-current={screen === item.key ? 'page' : undefined} onClick={() => { setScreen(item.key); setDetail(false) }}><Icon name={item.icon} size={23}/><small>{item.label}</small></button>)}</nav>}
  </main>
}

export default App
