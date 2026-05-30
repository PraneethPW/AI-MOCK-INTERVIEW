import { ArrowRight, CheckCircle2, Play, Quote, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { HeroScene } from '../components/HeroScene'
import { features, standout } from '../lib/data'

const proofNumbers = [
  { value: '42%', label: 'faster answer improvement after guided retries' },
  { value: '91%', label: 'average confidence signal in completed practice rounds' },
  { value: '6 min', label: 'to generate a recruiter-style report' },
  { value: '4x', label: 'more structured feedback than normal mock calls' },
]

const testimonials = [
  {
    quote: 'The report felt like something a real hiring panel would write. It showed exactly where my answer sounded shallow.',
    name: 'Aarav Mehta',
    role: 'Full Stack Intern Candidate',
  },
  {
    quote: 'The AI follow-up questions exposed weak spots in system design that I would never catch by practicing alone.',
    name: 'Mira Shah',
    role: 'React Developer',
  },
  {
    quote: 'I used it to screen project explanations. The scoring reasons made feedback much easier to trust.',
    name: 'Dev Rao',
    role: 'Campus Recruiter',
  },
]

export function LandingPage() {
  return (
    <div className="mesh-bg min-h-screen overflow-hidden text-ink">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/50 bg-white/65 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-mint shadow-glow">
              <Sparkles size={22} />
            </span>
            <span className="text-lg font-black">VocaVision AI</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-bold text-slate-600 md:flex">
            <a href="#features">Features</a>
            <a href="#workflow">Workflow</a>
            <a href="#platform">Platform</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-white">Login</Link>
            <Link to="/signup" className="rounded-lg bg-ink px-4 py-2.5 text-sm font-bold text-white shadow-glow">Start free</Link>
          </div>
        </div>
      </header>

      <main className="pt-24">
        <section className="noise relative mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl items-center gap-10 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/75 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-600">
              <ShieldCheck size={15} className="text-mint" />
              AI mock interviews with explainable scoring
            </div>
            <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.95] tracking-normal text-ink sm:text-6xl lg:text-7xl">
              VocaVision AI
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-600 sm:text-xl">
              A modern interview intelligence platform that combines NLP, computer vision, voice analytics, and recruiter-ready reporting for serious candidate preparation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-6 py-4 text-sm font-black text-white shadow-glow">
                Start a real interview <ArrowRight size={18} />
              </Link>
              <Link to="/interview" className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 bg-white/80 px-6 py-4 text-sm font-black text-ink">
                <Play size={18} /> Try interview room
              </Link>
            </div>
            <div className="mt-9 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {['NLP score', 'CV signals', 'OpenRouter AI', 'Neon Postgres'].map((item) => (
                <div key={item} className="glass rounded-lg p-3 text-sm font-bold text-slate-700">
                  <CheckCircle2 size={16} className="mb-2 text-mint" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3">
              {proofNumbers.slice(0, 2).map((item) => (
                <div key={item.value} className="rounded-lg border border-black/10 bg-white/80 p-4 shadow-card">
                  <p className="text-3xl font-black">{item.value}</p>
                  <p className="mt-1 text-sm font-semibold leading-5 text-slate-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[460px] min-h-[420px] lg:h-[620px]">
            <HeroScene />
            <div className="dark-glass absolute bottom-8 left-4 right-4 rounded-lg p-4 text-white shadow-glow sm:left-8 sm:right-auto sm:w-80">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-mint">Live analysis</p>
              <p className="mt-2 text-2xl font-black">Confidence 91%</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-bold">
                <span className="rounded-md bg-white/10 p-2">Eye 84</span>
                <span className="rounded-md bg-white/10 p-2">Pace 88</span>
                <span className="rounded-md bg-white/10 p-2">Fit A-</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-ink py-16 text-white">
          <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {proofNumbers.map((item) => (
              <div key={item.value} className="rounded-lg border border-white/10 bg-white/10 p-6">
                <TrendingUp className="text-mint" size={22} />
                <p className="mt-5 text-4xl font-black">{item.value}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/65">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-coral">Product modules</p>
              <h2 className="mt-3 text-4xl font-black">A complete interview operating system, not a one-page toy.</h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <article key={feature.title} className="rounded-lg border border-black/8 bg-[#f8fafc] p-6 shadow-card">
                  <feature.icon className="text-ink" size={28} />
                  <h3 className="mt-5 text-lg font-black">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="bg-ink py-20 text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-mint">Standout features</p>
              <h2 className="mt-3 text-4xl font-black">Built to look and feel investor-demo ready.</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {standout.map((item) => (
                <div key={item.text} className="rounded-lg border border-white/10 bg-white/10 p-5">
                  <item.icon className="text-amber" size={23} />
                  <p className="mt-4 font-bold leading-6">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="platform" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-coral">User outcomes</p>
                <h2 className="mt-3 text-4xl font-black">Built for candidates who need feedback they can act on.</h2>
                <p className="mt-4 leading-7 text-slate-600">Every round produces question-level scoring, coaching, visual-signal context, and a final decision-style report.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {testimonials.map((item) => (
                  <article key={item.name} className="rounded-lg border border-black/5 bg-[#f8fafc] p-5 shadow-card">
                    <Quote className="text-coral" size={24} />
                    <p className="mt-5 text-sm font-semibold leading-6 text-slate-700">{item.quote}</p>
                    <div className="mt-5 border-t border-black/5 pt-4">
                      <p className="font-black">{item.name}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{item.role}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
