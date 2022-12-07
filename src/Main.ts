import { Enemy } from "./Enemy.js";
import { Player } from "./Player.js";
import { Projectile } from "./Projectile.js";
import { events } from './Events.js'
import { Circle, Drawable, Point, Rectangle } from "./utils/Geometry.js";
import { roomManager } from './room/RoomManager.js'
import {
  renderDebug, renderIntro, renderUi, renderUnits, UiData, removeIntro, removeStart
  , displayPause, removePause
} from "./Renderer.js";
import { Drone } from './enemies/Drone.js'
import { Jumper } from './enemies/Jumper.js'
import { Shadow } from './enemies/Shadow.js'
import { Droid } from './enemies/Droid.js'
import { editor } from "./editor.js";;
import { Explosion } from "./Explosion.js";
import { config } from "./config.js";
import { ExtraLife } from './items/ExtraLife.js'
import { GameKey } from './items/GameKey.js'
import { KeyHole } from './items/KeyHole.js'
import { MysteryItem } from './items/MysteryItem.js'
import { Timer } from './utils/Timer.js'
import { Room } from "./room/Room.js";
import { Direction4, oppositeDirection4 } from "./utils/Directions.js";

roomManager.initialize()
let debug = false
let isRunning = true
let shadowSpawned = false
const state: UiData = {
  highScore: 0,
  score: 0,
  lifes: config.lifesAtStart,
  room: config.room.start,
  level: 'black',
  keys: []
}
let lastKillOrRoomChange = 0
let room: Room
const unitClasses = {
  drone: Drone,
  jumper: Jumper,
  droid: Droid
}
let isPlayedDead = false

// const audioContext = new AudioContext();
// const audioElement = new Audio('./assets/audio/step.mp3')
// const track = audioContext.createMediaElementSource(audioElement)
// track.connect(audioContext.destination);
// audioElement.loop = true
// audioElement.play() // TODO


const increaseScore = (amount: number) => {
  state.score += amount
  if (state.highScore < state.score) {
    state.highScore = state.score
  }
}

ExtraLife.onCollect = () => {
  state.lifes++
  renderUi(state)
  room.item = undefined
}

GameKey.onCollect = (type) => {
  state.keys.push(type)
  room.item = undefined
  renderUi(state)
}

KeyHole.onCollect = (type, edgeToDelete) => {
  if (!state.keys.includes(type)) { return }
  room.item = undefined
  state.keys = state.keys.filter(a => a !== type)
  room.deleteEdge(edgeToDelete)
  renderUi(state)
}

MysteryItem.onCollect = (action, amount) => {
  if (state.room === 0) {
    increaseScore(500)// The item in 1st room always gives 500 points
  } else if (action === 'life') {
    state.lifes += amount
  } else if (action === 'points') {
    increaseScore(amount)
  }
  room.item = undefined
  renderUi(state)
}

const spawnEnemies = (units: { drone?: number, jumper?: number }, spawnAreas: Rectangle[]) => {
  const wallDistance = 35
  const canvasW = 1400
  const canvasH = 800
  let iterations = 0
  let blue = true
  for (const [name, count] of Object.entries(units)) {
    const UnitClass = unitClasses[name as keyof typeof unitClasses]
    for (let i = 0; i < count; i++) {
      if (iterations > 1000) { break }
      iterations++
      const randX = ~~(Math.random() * canvasW)
      const randY = ~~(Math.random() * canvasH)
      const pos = new Point(randX, randY)
      if (!spawnAreas.some(a => a.pointCollision(pos))) {
        i--
        continue
      }
      const c = new Circle(pos, wallDistance)
      let isColliding = false
      if (roomManager.circleCollision(c, true)) {
        i--
        continue
      }
      if (player.hitbox.circleCollision(c)) {
        i--
        continue
      }
      for (let j = 0; j < Enemy.enemies.length; j++) {
        if (iterations > 1000) { break }
        if (Enemy.enemies[j].hitbox.circleCollision(c)) {
          i--
          isColliding = true
          break
        }
      }
      if (isColliding) { continue }
      new UnitClass(c.center, blue ? 'blue' : 'purple')
      blue = !blue
    }
  }
}

const handleBarrierTrigger = () => {
  room.barriers.length = 0
  spawnEnemies(room.enemies, room.spawnAreas)
}

const handleWin = () => {
  isRunning = false
  console.log('WIN')
}

// TODO RENDER EDGES BEFORE WALLS

const onRoomChange = (roomNum: number, sideOrPos: Direction4 | Point) => {
  if (roomNum === config.room.winningRoom) {
    handleWin()
    return
  }
  state.room = roomNum
  Projectile.playerProjectiles.length = 0
  Projectile.enemyProjectiles.length = 0
  Enemy.enemies.length = 0
  player.stop()
  player.speed = config.player.speed
  player.pos = new Point(-1, -1)
  if (typeof sideOrPos === 'string') {
    room = roomManager.loadRoom(state.room, oppositeDirection4(sideOrPos))
    player.pos = room.spawnPoint
  } else {
    room = roomManager.loadRoom(state.room, room.spawnSide)
    player.pos = sideOrPos ?? room.spawnPoint
  }
  renderUi(state)
  if (!room.hasBarriers) {
    spawnEnemies(room.enemies, room.spawnAreas)
  }
  shadowSpawned = false
  lastKillOrRoomChange = Date.now()
}

const player = new Player(new Point(-100, -100))

events.onAnyKeydown(() => {
  removeStart()
  renderIntro()
  events.onAnyKeydown(() => {
    removeIntro()
    onRoomChange(state.room, config.room.startSide as Direction4)
    requestAnimationFrame(gameLoop)
  })
})

events.onMovementChange((isMoving, angle) => {
  if (!isMoving) {
    player.stop()
  } else {
    player.move(angle ?? 0)
  }
})
events.onAction('shoot', () => player.shoot())
events.onAction('debug', () => {
  debug = !debug
  if (!debug) {
    renderDebug([])
  } else {
    renderDebug([])
  }
})
events.onAction('editor', () => {
  if (!editor.isEnabled()) {
    Projectile.playerProjectiles.length = 0
    Projectile.enemyProjectiles.length = 0
    Enemy.enemies.length = 0
    player.stop()
    isRunning = false
    renderDebug([])
    renderUnits([])
    editor.enable()
  }
})
events.onAction('menu', () => {
  isRunning = false
  Timer.pause()
  displayPause()
  events.onAnyKeydown(() => {
    removePause()
    isRunning = true
    Timer.resume()
  })
})

editor.onUpdate(() => renderUnits(editor.getObjects()))
Enemy.onKill = (wasLastEnemy: boolean) => {
  lastKillOrRoomChange = Date.now()
  increaseScore(config.killScore)
  if (wasLastEnemy) {
    increaseScore(config.clearRoomScore)
    player.speed = config.player.roomClearSpeed
  }
  renderUi(state)
}

const restartGame = () => {
  state.score = 0
  state.keys = []
  state.room = config.startingRoom
  state.lifes = config.lifesAtStart
  isRunning = true
  shadowSpawned = false
  roomManager.initialize()
  player.revive()
  Timer.resume()
  removeIntro()
  onRoomChange(state.room, config.room.startSide as Direction4)
  requestAnimationFrame(gameLoop)
}

const handleLose = () => {
  renderIntro()
  events.onAnyKeydown(() => restartGame())
  isRunning = false
}

player.onRoomChange = onRoomChange
player.onDeath = async () => {
  state.lifes--
  Timer.pause()
  isPlayedDead = true
  renderUi(state)
  await new Promise(resolve => setTimeout(resolve, 1000))
  player.revive()
  if (state.lifes === 0) {
    handleLose()
    return
  }
  isPlayedDead = false
  Timer.resume()
  onRoomChange(state.room, room.spawnPoint)
}

const shadowPositions = [[0, 0], [1400, 0], [0, 800], [1400, 800]] as const // TODO CONFIG

const spawnShadow = () => {
  shadowSpawned = true
  const coords = shadowPositions[~~(Math.random() * shadowPositions.length)]
  new Shadow(new Point(coords[0], coords[1]))
}

const gameLoop = () => {
  requestAnimationFrame(gameLoop)
  if (!isRunning) { return }
  if (shadowSpawned === false && lastKillOrRoomChange + config.shadow.spawnTimeout < Date.now()) {
    spawnShadow()
  }
  player.update()
  if (!isPlayedDead) {
    for (let i = 0; i < Projectile.playerProjectiles.length; i++) {
      Projectile.playerProjectiles[i].update()
    }
    for (let i = 0; i < Projectile.enemyProjectiles.length; i++) {
      Projectile.enemyProjectiles[i].update()
    }
    for (let i = 0; i < Enemy.enemies.length; i++) {
      Enemy.enemies[i].update(player.pos)
    }
    if (room.item !== undefined) {
      room.item.checkCollision(player)
    }
    if (room.hasBarriers) {
      for (let i = 0; i < Projectile.playerProjectiles.length; i++) {
        if (room.checkIfBarrierTriggered(Projectile.playerProjectiles[i].hitbox)) {
          handleBarrierTrigger()
        }
      }
    }
  }
  const objects: Drawable[] = [player]
  let index = 1
  for (let i = 0; i < Projectile.playerProjectiles.length; i++) {
    objects[index++] = Projectile.playerProjectiles[i]
  }
  for (let i = 0; i < Projectile.enemyProjectiles.length; i++) {
    objects[index++] = Projectile.enemyProjectiles[i]
  }
  for (let i = 0; i < Enemy.enemies.length; i++) {
    objects[index++] = Enemy.enemies[i]
  }
  for (let i = 0; i < Explosion.explosions.length; i++) {
    objects[index++] = Explosion.explosions[i]
  }
  for (let i = 0; i < room.barriers.length; i++) {
    objects[index++] = room.barriers[i]
  }
  for (let i = 0; i < room.insides.length; i++) {
    objects[index++] = room.insides[i]
  }
  for (let i = 0; i < room.edges.length; i++) {
    objects[index++] = room.edges[i]
  }
  if (room.item !== undefined) {
    objects[index++] = room.item
  }
  renderUnits(objects)
  if (debug) {
    const objects: Drawable[] = [player.hitbox]
    let index = 1
    for (let i = 0; i < Projectile.playerProjectiles.length; i++) {
      objects[index++] = Projectile.playerProjectiles[i].hitbox
      for (let j = 0; j < Projectile.playerProjectiles[i].debug.length; j++) {
        objects[index++] = Projectile.playerProjectiles[i].debug[j]
      }
    }
    for (let i = 0; i < Projectile.enemyProjectiles.length; i++) {
      objects[index++] = Projectile.enemyProjectiles[i].hitbox
    }
    for (let i = 0; i < Enemy.enemies.length; i++) {
      const e = Enemy.enemies[i]
      objects[index++] = e.hitbox
      for (let j = 0; j < e.debug.length; j++) { objects[index++] = e.debug[j] }
    }
    for (let i = 0; i < room.edges.length; i++) {
      for (let j = 0; j < room.edges[i].vecs.length; j++) {
        objects[index++] = room.edges[i].vecs[j]
      }
    }
    renderDebug(objects)
  }
}
