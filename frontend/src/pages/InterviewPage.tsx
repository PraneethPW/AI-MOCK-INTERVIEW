import { Bot, Camera, CheckCircle2, Loader2, Mic, Radio, Send, Sparkles, UserRound } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { api, type Answer, type Interview, type Question } from '../lib/api'

type Step = 'setup' | 'active' | 'complete'
type ChatMessage = {
  id: string
  speaker: 'assistant' | 'student'
  text: string
  meta?: string
}

const TOTAL_QUESTIONS = 5

export function InterviewPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const [step, setStep] = useState<Step>('setup')
  const [loading, setLoading] = useState(false)
  const [interview, setInterview] = useState<Interview | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [answerText, setAnswerText] = useState('')
  const [latestFeedback, setLatestFeedback] = useState<Answer['feedback'] | null>(null)
  const [report, setReport] = useState<any>(null)
  const [setup, setSetup] = useState({
    title: 'AI Agent Mock Interview',
    targetRole: 'Full Stack Developer',
    difficulty: 'intermediate',
    questionCount: 1,
    jobDescription: 'React TypeScript, Express, Node, Postgres, API design, AI integrations, authentication, dashboards, and production-ready full stack workflows.',
  })

  const answeredCount = answers.length
  const questionNumber = Math.min(answeredCount + 1, TOTAL_QUESTIONS)
  const progress = Math.round((answeredCount / TOTAL_QUESTIONS) * 100)
  const canSubmit = answerText.trim().length >= 30 && currentQuestion && !loading

  const averageScore = useMemo(() => {
    if (!answers.length) return 0
    return Math.round(answers.reduce((sum, answer) => sum + Number(answer.nlp_score || 0), 0) / answers.length)
  }, [answers])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, latestFeedback])

  useEffect(() => {
    if (step !== 'active') return
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch(() => undefined)

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream | null
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [step])

  const createInterview = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setLatestFeedback(null)
    setReport(null)
    try {
      const res = await api.post('/interviews', { ...setup, questionCount: 1 })
      const created: Interview = res.data
      const firstQuestion = created.questions?.[0]
      setInterview(created)
      setCurrentQuestion(firstQuestion)
      setAnswers([])
      setAnswerText('')
      setMessages([
        {
          id: 'welcome',
          speaker: 'assistant',
          text: `Hi, I am your AI interviewer for the ${created.target_role} role. I will ask ${TOTAL_QUESTIONS} questions. Answer naturally, and I will adapt the next question using brief context from your previous answer.`,
          meta: 'Interview started',
        },
        {
          id: firstQuestion?.id || 'q1',
          speaker: 'assistant',
          text: firstQuestion?.question || 'Tell me about your strongest project and your exact contribution.',
          meta: `Question 1/${TOTAL_QUESTIONS}`,
        },
      ])
      setStep('active')
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async () => {
    if (!interview || !currentQuestion || !canSubmit) return
    const submittedText = answerText.trim()
    setLoading(true)
    setMessages((prev) => [
      ...prev,
      {
        id: `a-${answeredCount + 1}`,
        speaker: 'student',
        text: submittedText,
        meta: `Answer ${answeredCount + 1}/${TOTAL_QUESTIONS}`,
      },
    ])
    setAnswerText('')

    try {
      const visualSignals = {
        eyeContact: 82 + Math.floor(Math.random() * 12),
        posture: 78 + Math.floor(Math.random() * 16),
        confidence: 80 + Math.floor(Math.random() * 14),
      }
      const analysisRes = await api.post('/interviews/analyze-answer', {
        interviewId: interview.id,
        role: interview.target_role,
        question: currentQuestion.question,
        transcript: submittedText,
        visualSignals,
      })

      const savedAnswer: Answer = analysisRes.data.answer
      setAnswers((prev) => [...prev, savedAnswer])
      setLatestFeedback(savedAnswer.feedback)

      const nextAnsweredCount = answeredCount + 1
      const feedbackText = savedAnswer.feedback?.aiResult?.coaching || 'Good. I will use that context for the next question.'

      if (nextAnsweredCount >= TOTAL_QUESTIONS) {
        setMessages((prev) => [
          ...prev,
          {
            id: 'assistant-ready-report',
            speaker: 'assistant',
            text: `That completes question ${TOTAL_QUESTIONS}. ${feedbackText} I can now generate your final performance report.`,
            meta: 'Interview complete',
          },
        ])
        setCurrentQuestion(null)
        return
      }

      const nextRes = await api.post(`/interviews/${interview.id}/next-question`)
      const nextQuestion: Question = nextRes.data.question
      setInterview((prev) => (prev ? { ...prev, questions: nextRes.data.questions } : prev))
      setCurrentQuestion(nextQuestion)
      setMessages((prev) => [
        ...prev,
        {
          id: `coach-${nextAnsweredCount}`,
          speaker: 'assistant',
          text: feedbackText,
          meta: `Quick feedback on answer ${nextAnsweredCount}`,
        },
        {
          id: nextQuestion.id || `q-${nextAnsweredCount + 1}`,
          speaker: 'assistant',
          text: nextQuestion.question,
          meta: `Question ${nextAnsweredCount + 1}/${TOTAL_QUESTIONS}`,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const completeInterview = async () => {
    if (!interview) return
    setLoading(true)
    try {
      const res = await api.post(`/interviews/${interview.id}/complete`)
      setReport(res.data.analysis)
      setStep('complete')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'setup') {
    return (
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-lg bg-ink p-6 text-white shadow-glow sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-mint">AI interviewer</p>
          <h1 className="mt-3 text-4xl font-black leading-tight">A real two-way mock interview with 5 adaptive questions.</h1>
          <p className="mt-4 leading-7 text-white/70">The assistant asks one question, the student answers, the backend scores it, and the next question is generated using minimal context from the previous answer.</p>
          <div className="mt-8 grid gap-3">
            {['5-question structured interview', 'Adaptive next question', 'Answer-by-answer scoring', 'Final hiring-style report'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg bg-white/10 p-4 font-bold">
                <CheckCircle2 className="text-mint" size={19} /> {item}
              </div>
            ))}
          </div>
        </section>

        <form onSubmit={createInterview} className="rounded-lg border border-black/5 bg-white p-6 shadow-card">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-slate-600">Session title</span>
              <input className="mt-2 w-full rounded-lg border border-black/10 px-4 py-3 outline-none" value={setup.title} onChange={(e) => setSetup({ ...setup, title: e.target.value })} required />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-600">Target role</span>
              <input className="mt-2 w-full rounded-lg border border-black/10 px-4 py-3 outline-none" value={setup.targetRole} onChange={(e) => setSetup({ ...setup, targetRole: e.target.value })} required />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-bold text-slate-600">Difficulty</span>
              <select className="mt-2 w-full rounded-lg border border-black/10 px-4 py-3 outline-none" value={setup.difficulty} onChange={(e) => setSetup({ ...setup, difficulty: e.target.value })}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="senior">Senior</option>
              </select>
            </label>
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-600">Role context / job description</span>
            <textarea className="mt-2 min-h-44 w-full rounded-lg border border-black/10 px-4 py-3 outline-none" value={setup.jobDescription} onChange={(e) => setSetup({ ...setup, jobDescription: e.target.value })} />
          </label>
          <button disabled={loading} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-black text-white disabled:opacity-60">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />} Start AI interview
          </button>
        </form>
      </div>
    )
  }

  if (step === 'complete') {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-lg bg-ink p-8 text-white shadow-glow">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-mint">Final report generated</p>
          <h1 className="mt-3 text-4xl font-black">{report?.decision || 'Interview complete'}</h1>
          <p className="mt-4 max-w-3xl leading-7 text-white/70">{report?.summary}</p>
          <p className="mt-5 text-5xl font-black">{report?.roleFitScore || averageScore}%</p>
        </section>
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-black/5 bg-white p-6 shadow-card">
            <h2 className="text-xl font-black">Strengths</h2>
            <div className="mt-4 space-y-3">{(report?.strengths || []).map((item: string) => <p key={item} className="rounded-lg bg-mint/10 p-3 font-bold">{item}</p>)}</div>
          </div>
          <div className="rounded-lg border border-black/5 bg-white p-6 shadow-card">
            <h2 className="text-xl font-black">Risks</h2>
            <div className="mt-4 space-y-3">{(report?.risks || []).map((item: string) => <p key={item} className="rounded-lg bg-coral/10 p-3 font-bold">{item}</p>)}</div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
      <section className="overflow-hidden rounded-lg bg-ink text-white shadow-glow">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-mint">Live AI interviewer</p>
            <h1 className="mt-1 text-2xl font-black">{interview?.target_role}</h1>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-3 py-1.5 text-sm font-bold text-red-200">
            <Radio size={15} /> Active
          </span>
        </div>
        <div className="relative min-h-[460px] bg-[radial-gradient(circle_at_50%_20%,rgba(76,201,240,0.24),transparent_35%),#07111f] p-5">
          <video ref={videoRef} autoPlay muted playsInline className="h-[330px] w-full rounded-lg object-cover opacity-90" />
          <div className="absolute bottom-5 left-5 right-5 grid gap-3 sm:grid-cols-2">
            {[
              ['Progress', `${progress}%`],
              ['Question', `${questionNumber}/${TOTAL_QUESTIONS}`],
              ['Average NLP', averageScore ? `${averageScore}%` : '--'],
              ['Latest signal', latestFeedback?.aiResult?.hiringSignal || 'Listening'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs font-bold text-white/55">{label}</p>
                <p className="mt-1 text-lg font-black">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 p-5">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-white text-ink"><Mic size={20} /></span>
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-white text-ink"><Camera size={20} /></span>
          {answeredCount >= TOTAL_QUESTIONS ? (
            <button onClick={completeInterview} disabled={loading} className="inline-flex h-12 items-center gap-2 rounded-lg bg-mint px-6 font-black text-ink disabled:opacity-60">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />} Generate final report
            </button>
          ) : (
            <span className="rounded-lg bg-white/10 px-4 py-3 text-sm font-bold">Answer the assistant in the chat</span>
          )}
        </div>
      </section>

      <section className="flex min-h-[700px] flex-col rounded-lg border border-black/5 bg-white shadow-card">
        <div className="border-b border-black/5 p-5">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-coral">Two-way interview chat</p>
          <h2 className="mt-1 text-2xl font-black">AI assistant asks. Student answers. Assistant adapts.</h2>
        </div>

        <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.speaker === 'student' ? 'justify-end' : 'justify-start'}`}>
              {message.speaker === 'assistant' && <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink text-mint"><Bot size={19} /></span>}
              <div className={`max-w-[82%] rounded-lg p-4 shadow-sm ${message.speaker === 'assistant' ? 'bg-white text-ink' : 'bg-ink text-white'}`}>
                {message.meta && <p className={`mb-2 text-xs font-black uppercase tracking-[0.12em] ${message.speaker === 'assistant' ? 'text-coral' : 'text-mint'}`}>{message.meta}</p>}
                <p className="leading-7">{message.text}</p>
              </div>
              {message.speaker === 'student' && <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mint/20 text-ink"><UserRound size={19} /></span>}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink text-mint"><Bot size={19} /></span>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <Loader2 className="animate-spin" size={20} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="border-t border-black/5 p-5">
          <textarea
            className="min-h-32 w-full rounded-lg border border-black/10 p-4 leading-7 outline-none"
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder={answeredCount >= TOTAL_QUESTIONS ? 'All 5 answers are complete. Generate the final report.' : 'Type the student answer here...'}
            disabled={answeredCount >= TOTAL_QUESTIONS}
          />
          <div className="mt-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-sm font-bold text-slate-500">Minimum 30 characters. The next question uses only brief context from this answer.</p>
            <button onClick={submitAnswer} disabled={!canSubmit} className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-black text-white disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Send answer
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
