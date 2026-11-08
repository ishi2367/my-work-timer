function workerUrl() {
  return new URL(`${import.meta.env.BASE_URL}offline-worker.js`, window.location.origin).href
}

export function canSaveOffline(): boolean {
  return import.meta.env.PROD && 'serviceWorker' in navigator
}

export function isSavedOffline(): boolean {
  return canSaveOffline() && navigator.serviceWorker.controller?.scriptURL === workerUrl()
}

export async function saveOffline(): Promise<void> {
  const registration = await navigator.serviceWorker.register(workerUrl(), { updateViaCache: 'none' })
  const worker = registration.installing ?? registration.waiting ?? registration.active
  if (!worker) throw new Error('Offline worker unavailable')
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => finish(false), 30_000)
    function finish(activated: boolean) {
      window.clearTimeout(timer)
      worker?.removeEventListener('statechange', check)
      if (activated) resolve()
      else reject(new Error('Offline worker did not activate'))
    }
    function check() {
      if (worker?.state === 'activated') finish(true)
      if (worker?.state === 'redundant') finish(false)
    }
    worker.addEventListener('statechange', check)
    check()
  })
  void navigator.storage?.persist?.().catch(() => false)
}
