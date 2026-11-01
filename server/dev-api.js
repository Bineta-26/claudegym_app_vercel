// Local stand-in for Vercel's serverless functions.
// Every file in /api (except _lib and other "_" files) becomes a route, exactly like on Vercel:
//   api/stats.js        -> /api/stats
//   api/auth/login.js   -> /api/auth/login
import express from 'express'
import { readdirSync, existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'
import { databaseUrl } from '../api/_lib/db.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const apiDir = path.join(root, 'api')
const PORT = Number(process.env.API_PORT) || 3001

if (existsSync(path.join(root, '.env'))) process.loadEnvFile(path.join(root, '.env'))

function findRoutes(dir) {
  const routes = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) routes.push(...findRoutes(full))
    else if (entry.name.endsWith('.js')) {
      const rel = path.relative(apiDir, full).replace(/\\/g, '/').replace(/\.js$/, '').replace(/(^|\/)index$/, '')
      routes.push({ url: '/api' + (rel ? '/' + rel : ''), file: full })
    }
  }
  return routes
}

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '100kb' }))

const routes = findRoutes(apiDir)
for (const { url, file } of routes) {
  const mod = await import(pathToFileURL(file).href)
  app.all(url, async (req, res) => {
    try {
      await mod.default(req, res)
    } catch (err) {
      console.error(`[api] ${url} crashed:`, err)
      if (!res.headersSent) res.status(500).json({ error: 'Something went wrong on our side. Please try again.' })
    }
  })
}

app.use('/api', (req, res) => res.status(404).json({ error: `No API route at ${req.originalUrl}` }))
// Malformed JSON bodies
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'That request was not valid JSON.' })
  next(err)
})

app.listen(PORT, () => {
  console.log(`⚡ PulseFit API ready on http://localhost:${PORT} (${routes.length} routes: ${routes.map((r) => r.url).join(', ')})`)
  if (!databaseUrl()) console.log('⚠️  DATABASE_URL is not set: API calls will answer "database not connected".')
})
