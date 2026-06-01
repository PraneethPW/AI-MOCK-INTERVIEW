import multer from 'multer'
import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { analyzeResume, generateRoadmap } from '../services/openrouter.js'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } })

router.use(requireAuth)

const roadmapSchema = z.object({
  goal: z.string().min(2),
  currentLevel: z.string().min(2),
  timeline: z.string().min(2),
  hoursPerWeek: z.number().int().min(1).max(80),
})

router.post('/resume/analyze', upload.single('resume'), async (req, res) => {
  const targetRole = String(req.body.targetRole || 'Software Developer')
  const pastedText = String(req.body.resumeText || '')
  const fileText = req.file?.buffer.toString('utf8') || ''
  const resumeText = `${pastedText}\n${fileText}`.trim()

  if (resumeText.length < 80) {
    return res.status(400).json({
      message: 'Resume text is too short. Upload a text-readable resume or paste the resume content.',
    })
  }

  const result = await analyzeResume({
    fileName: req.file?.originalname || 'pasted-resume',
    resumeText: resumeText.slice(0, 18000),
    targetRole,
  })

  res.json(result)
})

router.post('/roadmap/generate', async (req, res) => {
  const input = roadmapSchema.parse(req.body)
  const result = await generateRoadmap(input)
  res.json(result)
})

export { router as careerRouter }
