import { Enemy } from "./Enemy.js";
import { Player } from "./Player.js";
import { Projectile } from "./Projectile.js";
import { events } from './Events.js'
import { Circle, Drawable, Point, Rectangle } from "./utils/Geometry.js";
import { roomManager } from './room/RoomManager.js'
import {
  renderDebug, renderIntro, renderUi, renderUnits, UiData, removeIntro, removeStart
  , displayPause, removePause, displayWin
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
import { AudioPlayer } from "./AudioPlayer.js";
import { Tween } from "./utils/Tween.js";

const audioPlayer = new AudioPlayer('other')
roomManager.initialize()
let difficulty: keyof typeof config.speedMultipliers
let debug = false
let isRunning = false
let shadowSpawned = false
const state: {
  highScore: number
  score: number,
  keys: string[]
} = {
  highScore: 0,
  score: 0,
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

const updateUi = () => {
  renderUi({
    highScore: state.highScore,
    score: state.score,
    lifes: player.lifes,
    room: room.roomNumber,
    level: 'black',
    keys: state.keys
  })
}

const increaseScore = (amount: number) => {
  state.score += amount
  if (state.highScore < state.score) {
    state.highScore = state.score
  }
}

ExtraLife.onCollect = () => {
  audioPlayer.play('itemCollect')
  player.lifes++
  updateUi()
  room.item = undefined
}

GameKey.onCollect = (type) => {
  audioPlayer.play('keyCollect')
  state.keys.push(type)
  room.item = undefined
  updateUi()
}

KeyHole.onCollect = (type, edgeToDelete) => {
  audioPlayer.play('keyCollect')
  if (!state.keys.includes(type)) { return }
  room.item = undefined
  state.keys = state.keys.filter(a => a !== type)
  room.deleteEdge(edgeToDelete)
  updateUi()
}

MysteryItem.onCollect = (action, amount) => {
  audioPlayer.play('itemCollect')
  if (room.roomNumber === 0) {
    increaseScore(500)// The item in 1st room always gives 500 points
  } else if (action === 'life') {
    player.lifes += amount
  } else if (action === 'points') {
    increaseScore(amount)
  }
  room.item = undefined
  updateUi()
}

const spawnEnemies = (units: { drone?: number, droid?: number, jumper?: number }, spawnAreas: Rectangle[]) => {
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
  displayWin()
}


const onRoomChange = (roomNum: number, sideOrPos: Direction4 | Point) => {
  AudioPlayer.stop()
  AudioPlayer.resume()
  if (roomNum === config.room.winningRoom) {
    handleWin()
    return
  }
  Projectile.playerProjectiles.length = 0
  Projectile.enemyProjectiles.length = 0
  Enemy.enemies.length = 0
  player.stop()
  player.speed = config.player.speed
  player.pos = new Point(-1, -1)
  if (typeof sideOrPos === 'string') {
    room = roomManager.loadRoom(roomNum, oppositeDirection4(sideOrPos))
    player.pos = room.spawnPoint
  } else {
    room = roomManager.loadRoom(roomNum, room.spawnSide)
    player.pos = sideOrPos ?? room.spawnPoint
  }
  updateUi()
  if (!room.hasBarriers) {
    spawnEnemies(room.enemies, room.spawnAreas)
  }
  shadowSpawned = false
  lastKillOrRoomChange = Date.now()
}

const player = new Player(new Point(-100, -100))

const handleIntroKeydown = (key: string) => {
  if (config.controls.keyboard.changeDifficulty === key ||
    config.controls.gamepad.changeDifficulty.toString() === key) {
    difficulty = config.difficulties[
      (config.difficulties.indexOf(difficulty) + 1) % config.difficulties.length] as any
    renderIntro(difficulty, state.score, state.highScore)
    events.onAnyKeydown((key) => handleIntroKeydown(key))
    return
  }
  Tween.speedMultiplier = config.speedMultipliers[difficulty]
  restartGame()
}

events.onAnyKeydown(() => {
  removeStart()
  difficulty = 'novice'
  renderIntro(difficulty)
  events.onAnyKeydown((key) => handleIntroKeydown(key))
})

events.onMovementChange((isMoving, angle) => {
  if (!isRunning) { return }
  if (!isMoving) {
    player.stop()
  } else {
    player.move(angle ?? 0)
  }
})
events.onAction('shoot', () => {
  if (isRunning) { player.shoot() }
})
events.onAction('debug', () => {
  debug = !debug
  if (!debug) {
    renderDebug([])
  } else {
    renderDebug([])
  }
})
events.onAction('editor', () => {
  if (!isRunning) { return }
  AudioPlayer.stop()
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
const pause = () => {
  if (!isRunning) { return }
  new Droid(new Point(700, 400), 'blue')
  lastKillOrRoomChange = Date.now() - lastKillOrRoomChange
  isRunning = false
  Timer.pause()
  displayPause()
  events.onAnyKeydown(() => {
    removePause()
    lastKillOrRoomChange = Date.now() - lastKillOrRoomChange
    AudioPlayer.resume()
    isRunning = true
    Timer.resume()
  })
}
events.onAction('menu', () => pause())

events.onBlur(() => pause())

editor.onUpdate(() => renderUnits(editor.getObjects()))
Enemy.onKill = (wasLastEnemy: boolean) => {
  lastKillOrRoomChange = Date.now()
  increaseScore(config.killScore)
  if (wasLastEnemy) {
    increaseScore(config.clearRoomScore)
    player.speed = config.player.roomClearSpeed
  }
  updateUi()
}

const restartGame = () => {
  AudioPlayer.stop()
  AudioPlayer.resume()
  isRunning = true
  isPlayedDead = false
  state.score = 0
  state.keys = []
  player.lifes = config.lifesAtStart
  isRunning = true
  shadowSpawned = false
  roomManager.initialize()
  player.revive()
  Timer.resume()
  removeIntro()
  onRoomChange(config.room.start, config.room.startSide as Direction4)
  requestAnimationFrame(gameLoop)
}

const handleLose = () => {
  renderIntro(difficulty, state.score, state.highScore)
  events.onAnyKeydown((key) => handleIntroKeydown(key))
  isRunning = false
}

player.onRoomChange = onRoomChange
player.onDeath = async () => {
  AudioPlayer.stop()
  Timer.pause()
  updateUi()
  isPlayedDead = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  player.revive()
  AudioPlayer.resume()
  if (player.lifes === 0) {
    handleLose()
    return
  }
  isPlayedDead = false
  Timer.resume()
  onRoomChange(room.roomNumber, room.spawnPoint)
}

const shadowPositions = [[0, 0], [1400, 0], [0, 800], [1400, 800]] as const 

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
