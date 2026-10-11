// Renders the bike growth race to a smooth, frame-exact MP4.
//
// Screen recorders sample the browser on the wall clock, so any frame that paints
// slower than 1/60 s shows up as a duplicated (stuttering) frame. Here instead
// Playwright's fake clock drives requestAnimationFrame: each loop iteration
// advances time by exactly one frame, waits for the paint, and screenshots it —
// so the output is 60 fps no matter how long each frame took to render.
//
//   usage: node scripts/record-race.mjs [durationSec=180] [out=recordings/bike_growth_race.mp4]
//   env:   RACE_URL (default http://localhost:3000/visualizations/bike_growth_race)
//          SCALE    device pixel ratio; 2 renders the same 1080p layout at 4K (default 2)
//
// Audio is not captured — any soundtrack must be added in post.

import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { chromium } from 'playwright'

const URL =
  process.env.RACE_URL ?? 'http://localhost:3000/visualizations/bike_growth_race'
const DURATION_SEC = Number(process.argv[2] ?? 180)
const OUT_PATH = process.argv[3] ?? 'recordings/bike_growth_race.mp4'

// The layout is always 1080p (so it matches the fullscreen view); SCALE sets the
// pixel density, like a retina display. YouTube gives 4K uploads a higher bitrate
// tier even for viewers watching at 1080p, so 2 is the default.
const WIDTH = 1920
const HEIGHT = 1080
const SCALE = Number(process.env.SCALE ?? 2)
const FPS = 60
const TOTAL_FRAMES = Math.round(DURATION_SEC * FPS)

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
    // The race autoplays unless reduced motion is set; we want to start it
    // ourselves (via spacebar) so frame 0 is the start of the race.
    reducedMotion: 'reduce',
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

// Steps the fake clock exactly one frame at a time. runFor takes whole ms, so
// alternating 16/17 keeps the average at exactly 1/FPS s.
const createFrameStepper = (page) => {
  let framesRun = 0
  let elapsedMs = 0
  return async () => {
    framesRun++
    const targetMs = Math.round((framesRun * 1000) / FPS)
    await page.clock.runFor(targetMs - elapsedMs)
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
  await page.keyboard.press('Space')

  const stepFrame = createFrameStepper(page)
  await writeFrame(ffmpeg, await advanceToFirstPaintedFrame(page, stepFrame))

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
