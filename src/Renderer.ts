import { Drawable } from "./utils/Geometry.js"
import { config } from "./config.js"

export interface UiData {
  highScore: number
  score: number
  lifes: number
  room: number
  level: string
  keys: string[]
}
const intro = document.getElementById('intro') as HTMLDivElement
const introScore = document.getElementById('introScore') as HTMLDivElement
const introHighscore = document.getElementById('introHighscore') as HTMLDivElement
const introList = document.getElementById('introList') as HTMLDivElement
const keys = document.getElementById('keys') as HTMLDivElement
const scoreTop = document.getElementById('scoreTop') as HTMLDivElement
const scoreBottom = document.getElementById('scoreBottom') as HTMLDivElement
const lifes = document.getElementById('lifes') as HTMLDivElement
const room = document.getElementById('room') as HTMLDivElement
const level = document.getElementById('level') as HTMLDivElement
const canvas = document.getElementById('canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
const debugCanvas = document.getElementById('debugCanvas') as HTMLCanvasElement
const debugCtx = debugCanvas.getContext('2d') as CanvasRenderingContext2D
debugCtx.strokeStyle = config.debugColor
let isIntroListCreated = false

const createIntroList = () => {
  isIntroListCreated = true
  for (const e of config.intro.list) {
    const img = document.createElement('div')
    const text = document.createElement('div')
    img.style.backgroundImage = e[0]
    text.innerHTML = e[1]
    introList.appendChild(img)
    introList.appendChild(text)
  }
}

const renderIntro = (score: number = 0, highScore: number = 0) => {
  introScore.innerHTML = score.toString()
  introHighscore.innerHTML = highScore.toString()
  if (!isIntroListCreated) { createIntroList() }
  intro.style.display = 'grid'
}

const removeIntro = () => {
  intro.style.display = 'none'
}

const renderUi = (data: UiData) => {
  scoreTop.innerHTML = data.highScore.toString()
  scoreBottom.innerHTML = data.score.toString()
  lifes.innerHTML = ''
  for (let i = 0; i < data.lifes - 1; i++) {
    const div = document.createElement('div')
    lifes.appendChild(div)
  }
  room.innerHTML = data.room.toString()
  level.innerHTML = data.level
  keys.innerHTML = ''
  for (let i = 0; i < data.keys.length; i++) {
    const div = document.createElement('div')
    div.style.backgroundImage = `url('./assets/items/${config.gameKey.images[data.keys[i] as keyof typeof config.gameKey.images]}.png')`
    keys.appendChild(div)
  }
}

const renderUnits = (units: Drawable[]): void => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (let i = 0; i < units.length; i++) {
    units[i].draw(ctx)
  }
}

const renderDebug = (objects: Drawable[]): void => {
  debugCtx.clearRect(0, 0, debugCanvas.width, debugCanvas.height)
  for (let i = 0; i < objects.length; i++) {
    objects[i].draw(debugCtx)
  }
}

export { renderUnits, renderDebug, renderUi, renderIntro, removeIntro }
