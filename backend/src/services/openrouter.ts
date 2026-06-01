import axios from 'axios'

type Question = {
  id: string
  type: 'technical' | 'behavioral' | 'system-design' | 'project' | 'follow-up'
  question: string
  evaluationFocus: string
  idealSignals: string[]
}

function parseJson(content: string | undefined, fallback: unknown) {
  if (!content) return fallback
  try {
    return JSON.parse(content)
  } catch {
    const match = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    return match ? JSON.parse(match[0]) : fallback
  }
}

async function openRouterJson(system: string, payload: unknown, fallback: unknown) {
  if (!process.env.OPENROUTER_API_KEY) return fallback

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: JSON.stringify(payload) },
        ],
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5188',
          'X-Title': 'VocaVision AI',
        },
      },
    )

    return parseJson(response.data.choices?.[0]?.message?.content, fallback)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.warn('OpenRouter fallback:', error.response?.status, error.response?.data || error.message)
    } else {
      console.warn('OpenRouter fallback:', error)
    }
    return fallback
  }
}

export async function generateInterviewQuestions(payload: {
  targetRole: string
  difficulty: string
  jobDescription?: string
  count?: number
}) {
  const count = payload.count || 6
  const fallback: { questions: Question[] } = {
    questions: [
      {
        id: 'q1',
        type: 'project' as const,
        question: `Walk me through your strongest project for a ${payload.targetRole} role. What did you own end to end?`,
        evaluationFocus: 'Ownership, clarity, impact, technical depth',
        idealSignals: ['Specific responsibilities', 'Measurable impact', 'Tradeoff awareness'],
      },
      {
        id: 'q2',
        type: 'technical' as const,
        question: 'Design the backend flow for authentication, interview sessions, answer storage, and AI scoring.',
        evaluationFocus: 'System architecture and API design',
        idealSignals: ['Clear data model', 'Secure auth', 'Async AI processing'],
      },
      {
        id: 'q3',
        type: 'system-design' as const,
        question: 'How would you make real-time interview analysis reliable when AI APIs are slow or temporarily unavailable?',
        evaluationFocus: 'Reliability and fallback thinking',
        idealSignals: ['Queues', 'Retries', 'Graceful degradation'],
      },
      {
        id: 'q4',
        type: 'behavioral' as const,
        question: 'Tell me about a time you received tough feedback and changed your work because of it.',
        evaluationFocus: 'Coachability and maturity',
        idealSignals: ['Specific situation', 'Action taken', 'Learning'],
      },
      {
        id: 'q5',
        type: 'technical' as const,
        question: 'How would you protect candidate video, transcript, and score data in production?',
        evaluationFocus: 'Privacy and security',
        idealSignals: ['Consent', 'Encryption', 'Retention policies'],
      },
      {
        id: 'q6',
        type: 'follow-up' as const,
        question: 'What is one tradeoff in your architecture that you would revisit after the first 100 users?',
        evaluationFocus: 'Product engineering judgment',
        idealSignals: ['Pragmatism', 'Metrics', 'Iteration plan'],
      },
    ].slice(0, count),
  }

  return openRouterJson(
    `You are a senior interviewer. Create exactly ${count} role-specific interview questions. Return strict JSON: {"questions":[{"id":"q1","type":"technical|behavioral|system-design|project|follow-up","question":"...","evaluationFocus":"...","idealSignals":["..."]}]}. Make questions specific to the role and job description.`,
    payload,
    fallback,
  ) as Promise<{ questions: Question[] }>
}

export async function generateNextQuestion(payload: {
  targetRole: string
  difficulty: string
  jobDescription?: string
  questionNumber: number
  askedQuestions: string[]
  previousAnswer: string
  previousFeedback?: unknown
}) {
  const fallbackQuestion = {
    id: `q${payload.questionNumber}`,
    type: payload.questionNumber % 2 === 0 ? 'technical' : 'behavioral',
    question:
      payload.questionNumber === 5
        ? 'Final question: based on your previous answers, what is the strongest reason we should select you for this role, and what gap are you actively improving?'
        : `Based on your last answer, go deeper on one production tradeoff you would make as a ${payload.targetRole}.`,
    evaluationFocus: 'Adaptive reasoning based on the previous answer with clear examples and tradeoffs',
    idealSignals: ['Specific example', 'Tradeoff thinking', 'Clear ownership'],
  }

  const result = await openRouterJson(
    'You are a professional AI interviewer. Generate exactly ONE next interview question. Use only minimal context from the previous answer and avoid repeating already asked questions. Return strict JSON: {"id":"q2","type":"technical|behavioral|system-design|project|follow-up","question":"...","evaluationFocus":"...","idealSignals":["..."]}.',
    payload,
    fallbackQuestion,
  )

  return result as Question
}

export async function analyzeAnswer(payload: {
  role: string
  question: string
  transcript: string
  visualSignals?: Record<string, unknown>
}) {
  return openRouterJson(
    'You are an expert technical interviewer. Score the candidate answer. Return strict JSON with fields: score number 0-100, communicationSkills object, technicalKnowledge object, confidenceBehavior object, overallEvaluation object, strengths string[], risks string[], coaching string, hiringSignal string, followUpQuestion string. communicationSkills must include grammarAccuracy, vocabularyUsage, fluency, answerRelevance numbers 0-100 plus notes string. technicalKnowledge must include technicalKeywordMatching, conceptUnderstanding, problemSolvingAbility, responseCorrectness numbers 0-100 plus notes string. confidenceBehavior must include eyeContact, facialExpressions, speakingConfidence, bodyPosture numbers 0-100 plus notes string. overallEvaluation must include interviewScore number 0-100, strengthsIdentification string[], weaknessDetection string[], improvementRecommendations string[].',
    payload,
    {
      score: 86,
      communicationSkills: {
        grammarAccuracy: 88,
        vocabularyUsage: 84,
        fluency: 86,
        answerRelevance: 90,
        notes: 'Clear answer with relevant phrasing and only minor structure improvements needed.',
      },
      technicalKnowledge: {
        technicalKeywordMatching: 87,
        conceptUnderstanding: 84,
        problemSolvingAbility: 86,
        responseCorrectness: 85,
        notes: 'Good technical direction with clear mention of architecture, API, database, and AI service separation.',
      },
      confidenceBehavior: {
        eyeContact: Number(payload.visualSignals?.eyeContact || 86),
        facialExpressions: Number(payload.visualSignals?.confidence || 85),
        speakingConfidence: Number(payload.visualSignals?.confidence || 88),
        bodyPosture: Number(payload.visualSignals?.posture || 84),
        notes: 'Stable confidence signals with room to improve posture consistency and delivery energy.',
      },
      overallEvaluation: {
        interviewScore: 86,
        strengthsIdentification: ['Clear architecture split', 'Good explanation of backend and AI service responsibilities'],
        weaknessDetection: ['Needs more production tradeoffs', 'Could quantify impact better'],
        improvementRecommendations: ['Use concrete metrics', 'Explain alternatives before final choices', 'Close answers with measurable impact'],
      },
      strengths: ['Clear architecture split', 'Good database and AI-service separation'],
      risks: ['Add more privacy details', 'Explain latency and fallback strategy'],
      coaching: 'Use a structured answer: context, architecture, tradeoffs, risks, and measurement.',
      hiringSignal: 'Promising',
      followUpQuestion: 'How would you make this reliable under production traffic?',
      rubric: { clarity: 86, depth: 82, relevance: 90, structure: 84 },
      model: 'mock-local',
    },
  )
}

export async function buildInterviewReport(payload: {
  targetRole: string
  answers: Array<{ question: string; transcript: string; nlp_score: number; cv_score: number; feedback: unknown }>
}) {
  return openRouterJson(
    'You are a hiring panel lead. Build a final interview report. Return strict JSON with fields: summary string, communicationSkills object, technicalKnowledge object, confidenceBehavior object, overallEvaluation object, strengths string[], risks string[], recommendation string, decision one of Strong shortlist|Shortlist|Needs practice|Reject, coachingPlan string[], roleFitScore number 0-100. communicationSkills must include grammarAccuracy, vocabularyUsage, fluency, answerRelevance numbers 0-100 plus notes string. technicalKnowledge must include technicalKeywordMatching, conceptUnderstanding, problemSolvingAbility, responseCorrectness numbers 0-100 plus notes string. confidenceBehavior must include eyeContact, facialExpressions, speakingConfidence, bodyPosture numbers 0-100 plus notes string. overallEvaluation must include interviewScore number 0-100, strengthsIdentification string[], weaknessDetection string[], improvementRecommendations string[].',
    payload,
    {
      summary: 'Candidate shows solid interview readiness with clear technical thinking and room to improve depth in tradeoff explanations.',
      communicationSkills: {
        grammarAccuracy: 88,
        vocabularyUsage: 84,
        fluency: 86,
        answerRelevance: 89,
        notes: 'Communication is clear and relevant, with opportunities to improve concise structuring.',
      },
      technicalKnowledge: {
        technicalKeywordMatching: 86,
        conceptUnderstanding: 84,
        problemSolvingAbility: 85,
        responseCorrectness: 83,
        notes: 'Good technical foundation with a need for stronger correctness proof and deeper tradeoff analysis.',
      },
      confidenceBehavior: {
        eyeContact: 86,
        facialExpressions: 84,
        speakingConfidence: 88,
        bodyPosture: 82,
        notes: 'Confident delivery signals overall; posture and visual engagement can be made more consistent.',
      },
      overallEvaluation: {
        interviewScore: 84,
        strengthsIdentification: ['Clear communication', 'Good architecture awareness'],
        weaknessDetection: ['Needs more production examples', 'Could quantify impact better'],
        improvementRecommendations: ['Use concrete metrics', 'Explain alternatives before final choices'],
      },
      strengths: ['Clear communication', 'Good architecture awareness'],
      risks: ['Needs more production examples', 'Could quantify impact better'],
      recommendation: 'Shortlist with one focused technical follow-up round.',
      decision: 'Shortlist',
      coachingPlan: ['Use concrete metrics', 'Explain alternatives before final choices'],
      roleFitScore: 84,
    },
  )
}

export async function analyzeResume(payload: {
  fileName: string
  resumeText: string
  targetRole?: string
}) {
  return openRouterJson(
    'You are an expert resume reviewer for technical hiring. Analyze the resume for the target role. Return strict JSON with: resumeScore number 0-100, atsScore number 0-100, grammarScore number 0-100, roleFitScore number 0-100, summary string, strengths string[], corrections array of {"issue":"...","fix":"...","severity":"low|medium|high"}, grammarMistakes array of {"text":"...","suggestion":"...","reason":"..."}, missingKeywords string[], recommendedRewrite string[], actionPlan string[].',
    payload,
    {
      resumeScore: 78,
      atsScore: 74,
      grammarScore: 82,
      roleFitScore: 76,
      summary: 'Resume has a solid technical base but needs stronger measurable impact, cleaner grammar, and tighter alignment with the target role.',
      strengths: ['Clear project experience', 'Relevant full-stack keywords', 'Good education and skills structure'],
      corrections: [
        { issue: 'Project bullets describe work but not measurable impact.', fix: 'Add metrics such as latency reduced, users served, or time saved.', severity: 'high' },
        { issue: 'Skills section is broad.', fix: 'Group skills by Frontend, Backend, Database, AI, Tools.', severity: 'medium' },
      ],
      grammarMistakes: [
        { text: 'Worked on project which is used...', suggestion: 'Built a project that is used...', reason: 'More direct and professional phrasing.' },
      ],
      missingKeywords: ['REST APIs', 'PostgreSQL', 'Authentication', 'Deployment', 'Testing'],
      recommendedRewrite: ['Built a full-stack interview platform using React, Express, PostgreSQL, and OpenRouter AI with JWT authentication and AI-generated candidate reports.'],
      actionPlan: ['Add quantified impact to each project', 'Move strongest project to the top', 'Add deployment links and GitHub links'],
    },
  )
}

export async function generateRoadmap(payload: {
  goal: string
  currentLevel: string
  timeline: string
  hoursPerWeek: number
}) {
  return openRouterJson(
    'You are an expert career mentor. Generate a clear ideal preparation roadmap. Return strict JSON with: title string, overview string, roadmapScore number 0-100, phases array of {"phase":"...","duration":"...","goal":"...","topics":["..."],"projects":["..."],"resources":["..."],"checkpoints":["..."]}, weeklyPlan array of {"week":"...","focus":"...","tasks":["..."]}, milestones string[], mistakesToAvoid string[], finalProject string, interviewPrep string[].',
    payload,
    {
      title: `${payload.goal} Roadmap`,
      overview: 'A practical roadmap that starts with fundamentals, builds projects, adds production skills, and ends with interview preparation.',
      roadmapScore: 90,
      phases: [
        {
          phase: 'Foundation',
          duration: '2 weeks',
          goal: 'Understand the core building blocks.',
          topics: ['HTML/CSS/JavaScript fundamentals', 'Git and GitHub', 'TypeScript basics'],
          projects: ['Personal portfolio', 'Todo app with local storage'],
          resources: ['MDN Web Docs', 'TypeScript Handbook'],
          checkpoints: ['Explain async JS', 'Build reusable components'],
        },
        {
          phase: 'MERN + Postgres Build',
          duration: '4 weeks',
          goal: 'Build production-style full-stack apps.',
          topics: ['React routing', 'Express APIs', 'Postgres schema design', 'JWT authentication'],
          projects: ['Auth dashboard', 'AI interview app'],
          resources: ['React docs', 'Postgres docs', 'Express docs'],
          checkpoints: ['Deploy frontend and backend', 'Connect database securely'],
        },
      ],
      weeklyPlan: [
        { week: 'Week 1', focus: 'Fundamentals', tasks: ['Revise JavaScript', 'Build UI components', 'Practice Git'] },
        { week: 'Week 2', focus: 'Frontend depth', tasks: ['React Router', 'Forms', 'API integration'] },
      ],
      milestones: ['Build 3 deployed projects', 'Write clean README files', 'Complete 5 mock interviews'],
      mistakesToAvoid: ['Learning without building', 'Skipping deployment', 'Ignoring database design'],
      finalProject: 'Build a full-stack AI-powered platform with auth, database, dashboard, and AI-generated reports.',
      interviewPrep: ['Explain every project architecture', 'Practice system design basics', 'Prepare behavioral stories'],
    },
  )
}
