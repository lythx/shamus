import { Enemy } from "./Enemy.js";
import { Player } from "./Player.js";
import { Projectile } from "./Projectile.js";
import { events } from './Events.js'
import { Circle, Drawable, Point, Rectangle } from "./utils/Geometry.js";
import { roomManager } from './room/RoomManager.js'
import { renderDebug, renderUi, renderUnits, UiData } from "./Renderer.js";
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
  highScore: 0, // TODO
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
  if (action === 'life') {
    state.lifes += amount
  } else if (action === 'points') {
    state.score += amount
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
onRoomChange(state.room, config.room.startSide as Direction4)

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
  console.log('pause') // todo
  isRunning = false
  Timer.pause()
  setTimeout(() => {
    isRunning = true
    Timer.resume()
  }, 1000)
})

editor.onUpdate(() => renderUnits(editor.getObjects()))
Enemy.onKill = (wasLastEnemy: boolean) => {
  lastKillOrRoomChange = Date.now()
  state.score += config.killScore
  if (wasLastEnemy) { state.score += config.clearRoomScore }
  renderUi(state)
}

const handleLose = () => {
  console.log('game over')
}

player.onRoomChange = onRoomChange
player.onDeath = async () => {
  state.lifes--
  Timer.pause()
  renderUi(state)
  await new Promise(resolve => setTimeout(resolve, 1000))
  player.revive()
  if (state.lifes === 0) {
    handleLose()
    return
  }
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

requestAnimationFrame(gameLoop)

//new Shadow(new Point(350, 350))
// new Drone(new Point(400, 400), 'blue')
// new Jumper(new Point(350, 300))
Enemy.enemies.sort(a => player.pos.calculateDistance(a.pos)) // todo
