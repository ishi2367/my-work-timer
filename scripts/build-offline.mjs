import { createHash } from 'node:crypto'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const directory = 'dist'
const workerName = 'offline-worker.js'
const files = (await readdir(directory, { recursive: true, withFileTypes: true }))
  .filter(entry => entry.isFile() && entry.name !== workerName)
  .map(entry => join(entry.parentPath, entry.name).slice(directory.length + 1).replaceAll('\\', '/'))
  .sort()
if (!files.includes('index.html')) throw new Error('Missing built app')

const hash = createHash('sha256')
for (const file of files) hash.update(file).update(await readFile(join(directory, file)))
const worker = `
const prefix = 'my-work-timer-offline-v1:' + self.registration.scope + ':'
const cacheName = prefix + ${JSON.stringify(hash.digest('hex').slice(0, 16))}
const root = new URL(self.registration.scope)
const index = new URL('index.html', root).href
const assets = new Set(${JSON.stringify(files)}.map(file => new URL(file, root).href))

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName)
    await cache.addAll([...assets].map(url => new Request(url, { cache: 'reload' })))
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys()
    await Promise.all(names.filter(name => name.startsWith(prefix) && name !== cacheName).map(name => caches.delete(name)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', event => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  const launch = request.mode === 'navigate' && url.origin === root.origin && url.pathname === root.pathname
  const key = launch ? index : url.href
  if (!assets.has(key)) return
  event.respondWith((async () => {
    const cache = await caches.open(cacheName)
    return (await cache.match(key)) ?? fetch(request)
  })())
})
`
await writeFile(join(directory, workerName), worker.trimStart())
