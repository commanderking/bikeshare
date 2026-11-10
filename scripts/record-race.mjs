// Renders the bike growth race to a smooth, frame-exact MP4.
//
// Screen recorders sample the browser on the wall clock, so any frame that paints
// slower than 1/60 s shows up as a duplicated (stuttering) frame. Here instead
// Playwright's fake clock owns time: each loop iteration advances it by exactly
// one frame, runs that frame's requestAnimationFrame callbacks, and screenshots
// the result — so the output is 60 fps no matter how long each frame took to
// render. CSS transitions run on the browser's real clock instead, so each frame
// also pauses them and steps them forward by the same amount.
//
//   usage: node scripts/record-race.mjs [durationSec=135] [out=recordings/bike_growth_race.mp4]
//   env:   RACE_URL (default http://localhost:3000/visualizations/bike_growth_race)
//          SCALE    device pixel ratio; 2 renders the same 1080p layout at 4K (default 2)
//          START    seconds into the race to begin recording, for test clips (default 0)
//
// Audio is not captured — any soundtrack must be added in post.

import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { chromium } from 'playwright'

// autoplay=0 so we can start the race ourselves (via spacebar), making frame 0
// the start of the race.
const URL = `${
  process.env.RACE_URL ?? 'http://localhost:3000/visualizations/bike_growth_race'
}?autoplay=0`
const DURATION_SEC = Number(process.argv[2] ?? 135)
const OUT_PATH = process.argv[3] ?? 'recordings/bike_growth_race.mp4'

// The layout is always 1080p (so it matches the fullscreen view); SCALE sets the
// pixel density, like a retina display. YouTube gives 4K uploads a higher bitrate
// tier even for viewers watching at 1080p, so 2 is the default.
const WIDTH = 1920
const HEIGHT = 1080
const SCALE = Number(process.env.SCALE ?? 2)
const START_SEC = Number(process.env.START ?? 0)
const FPS = 60
const FRAME_MS = 1000 / FPS
const TOTAL_FRAMES = Math.round(DURATION_SEC * FPS)
const SKIPPED_FRAMES = Math.round(START_SEC * FPS)

const startFfmpeg = () => {
  const ffmpeg = spawn(
    'ffmpeg',
    [
      '-y',
      '-loglevel', 'error',
      '-f', 'image2pipe',
      '-vcodec', 'png',
      '-framerate', String(FPS),
      '-i', '-',
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-crf', '18',
      '-pix_fmt', 'yuv420p', // required for YouTube / QuickTime playback
      '-movflags', '+faststart',
      OUT_PATH,
    ],
    { stdio: ['pipe', 'inherit', 'inherit'] }
  )
  return ffmpeg
}

const writeFrame = async (ffmpeg, pngBuffer) => {
  if (!ffmpeg.stdin.write(pngBuffer)) await once(ffmpeg.stdin, 'drain')
}

const openRaceInFullscreen = async (browser) => {
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: SCALE,
  })
  const page = await context.newPage()
  // Must be installed before navigation so the app only ever sees the fake clock.
  await page.clock.install()
  await page.goto(URL)

  // The button is only rendered once the data has loaded.
  const fullscreenButton = page.getByRole('button', { name: 'Full screen' })
  await fullscreenButton.waitFor({ timeout: 120_000 })
  await fullscreenButton.click()
  await page.waitForFunction(() => document.fullscreenElement != null)
  return page
}

// The fake clock doesn't reach CSS transitions (e.g. the row slide on an
// overtake): left alone they'd finish in a few screenshots' worth of real time.
// So each one is paused when first seen, starting at 0, and moved forward by
// exactly one frame per frame from then on.
const stepCssAnimations = (page, frameMs) =>
  page.evaluate((frameMs) => {
    window.__steppedAnimations ??= new WeakSet()
    for (const animation of document.getAnimations()) {
      if (window.__steppedAnimations.has(animation)) {
        animation.currentTime += frameMs
      } else {
        window.__steppedAnimations.add(animation)
        animation.pause()
        animation.currentTime = 0
      }
    }
  }, frameMs)

// Playwright's fake requestAnimationFrame is no good for frame-exact capture:
// - it fires on a fixed 16 ms grid (62.5/s), so against 60 fps output every 24th
//   frame holds two animation frames — a visible hitch 2.5x a second;
// - it yields a real browser task after every callback, and each Biker runs its
//   own loop, so one frame cost ~100 ms just to advance.
// So rAF is swapped for a queue that the recorder flushes once per frame, in one
// call, at the exact frame time. Installed after load, since loading itself needs
// frames; callers look rAF up on every call, so they move to the queue on their
// next frame.
const installAnimationFrameQueue = (page) =>
  page.evaluate(() => {
    let nextId = 1
    const queue = new Map()
    window.requestAnimationFrame = (callback) => {
      queue.set(nextId, callback)
      return nextId++
    }
    window.cancelAnimationFrame = (id) => queue.delete(id)
    window.__flushAnimationFrame = (timestamp) => {
      const callbacks = [...queue.values()]
      queue.clear()
      for (const callback of callbacks) callback(timestamp)
    }
  })

// Steps exactly one frame: timers via the fake clock (runFor takes whole ms, so it
// alternates 16/17), then rAF and CSS at the exact fractional frame time.
const createFrameStepper = async (page) => {
  const startMs = await page.evaluate(() => performance.now())
  let framesRun = 0
  let elapsedMs = 0
  return async () => {
    framesRun++
    const targetMs = framesRun * FRAME_MS
    await page.clock.runFor(Math.round(targetMs) - Math.round(elapsedMs))
    await page.evaluate(
      (timestamp) => window.__flushAnimationFrame(timestamp),
      startMs + targetMs
    )
    await stepCssAnimations(page, targetMs - elapsedMs)
    elapsedMs = targetMs
  }
}

// Fullscreen paints nothing until the race's first played frame lands, so step
// until the picture changes and treat that as frame 0.
const advanceToFirstPaintedFrame = async (page, stepFrame) => {
  const blank = await page.screenshot({ type: 'png' })
  for (let attempt = 0; attempt < 10; attempt++) {
    await stepFrame()
    const png = await page.screenshot({ type: 'png' })
    if (!png.equals(blank)) return png
  }
  throw new Error('race never painted after pressing Space')
}

const recordFrames = async (page, ffmpeg) => {
  // Freeze time, then hand it out one frame at a time. Pausing in the past throws,
  // and the clock keeps ticking while we ask for it, so pause a little ahead.
  const pageNow = await page.evaluate(() => Date.now())
  await page.clock.pauseAt(pageNow + 1000)
  await page.clock.runFor(500) // let the fullscreen layout settle
  await installAnimationFrameQueue(page)
  await page.keyboard.press('Space')

  const stepFrame = await createFrameStepper(page)
  const firstFrame = await advanceToFirstPaintedFrame(page, stepFrame)
  if (SKIPPED_FRAMES === 0) {
    await writeFrame(ffmpeg, firstFrame)
  } else {
    // Played, not jumped, so every animation arrives in the state it would be in.
    for (let frameIndex = 0; frameIndex < SKIPPED_FRAMES; frameIndex++)
      await stepFrame()
    await writeFrame(ffmpeg, await page.screenshot({ type: 'png' }))
  }

  for (let frameIndex = 1; frameIndex < TOTAL_FRAMES; frameIndex++) {
    await stepFrame()
    await writeFrame(ffmpeg, await page.screenshot({ type: 'png' }))
    if (frameIndex % FPS === 0)
      process.stdout.write(`\r${frameIndex / FPS}s / ${DURATION_SEC}s`)
  }
  process.stdout.write('\n')
}

const main = async () => {
  const browser = await chromium.launch()
  const ffmpeg = startFfmpeg()
  try {
    const page = await openRaceInFullscreen(browser)
    await recordFrames(page, ffmpeg)
  } finally {
    ffmpeg.stdin.end()
    await once(ffmpeg, 'close')
    await browser.close()
  }
  console.log(`wrote ${OUT_PATH}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
