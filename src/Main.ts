import { Enemy } from "./Enemy.js";
import { Player } from "./Player.js";
import { Projectile } from "./Projectile.js";
import { events } from './Events.js'
import { Circle, Drawable, Point, Rectangle } from "./utils/Geometry.js";
import { room } from './room/Room.js'
import { renderDebug, renderRoom, renderRoomDebug, renderUi, renderUnits, UiData } from "./Renderer.js";
import { Drone } from './enemies/Drone.js'
import { Jumper } from './enemies/Jumper.js'
import { Shadow } from './enemies/Shadow.js'
import { Droid } from './enemies/Droid.js'
import { editor } from "./editor.js";
import { WallEdge } from "./room/WallEdge.js";
import { WallInside } from "./room/WallInside.js";
import { Explosion } from "./Explosion.js";
import { config } from "./config.js";
import { ExtraLife } from './items/ExtraLife.js'
import { GameKey } from './items/GameKey.js'
import { KeyHole } from './items/KeyHole.js'
import { MysteryItem } from './items/MysteryItem.js'
import { GameItem } from "./items/GameItem.js";
import { Timer } from './utils/Timer.js'


let debug = false
let isRunning = true
let shadowSpawned = false
const infinity = 10000000
const state: UiData = {
  score: 0,
  lifes: config.lifesAtStart,
  room: config.startingRoom,
  level: 'black',
  keys: []
}
let lastKillOrRoomChange = 0
const currentRoom: {
  edges: WallEdge[],
  insides: WallInside[],
  item: GameItem | undefined
} = { edges: [], insides: [], item: undefined }
const unitClasses = {
  drone: Drone,
  jumper: Jumper,
  droid: Droid
}

ExtraLife.onCollect = () => {
  state.lifes++
  renderUi(state)
  currentRoom.item = undefined
}

GameKey.onCollect = (type) => {
  state.keys.push(type)
  room.itemCollected('key', type)
  currentRoom.item = undefined
  renderUi(state)
}

KeyHole.onCollect = (type) => {
  if (!state.keys.includes(type)) { return }
  currentRoom.item = undefined
  room.itemCollected('keyhole', type)
  state.keys = state.keys.filter(a => a !== type)
  room.deleteEdge(type)
  currentRoom.edges = room.edges
  renderUi(state)
}

MysteryItem.onCollect = (action, amount) => {
  if (action === 'life') {
    state.lifes += amount
  } else if (action === 'points') {
    state.score += amount
  }
  currentRoom.item = undefined
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
      if (room.circleCollision(c, true)) {
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

const onRoomChange = (roomNum: number, pos?: Point) => {
  state.room = roomNum
  Projectile.playerProjectiles.length = 0
  Projectile.enemyProjectiles.length = 0
  Enemy.enemies.length = 0
  player.stop()
  player.pos = new Point(-1, -1)
  room.loadRoom(state.room)
  player.pos = pos ?? room.spawnPoint
  currentRoom.edges = room.edges
  currentRoom.insides = room.insides
  currentRoom.item = room.item
  renderRoom(currentRoom.insides)
  renderUi(state)
  spawnEnemies(room.units, room.spawnAreas)
  shadowSpawned = false
  lastKillOrRoomChange = Date.now()
  if (debug) {
    renderRoomDebug(currentRoom.edges.flatMap(a => a.vecs))
  }
}

const player = new Player(new Point(-100, -100))
room.loadRoom(state.room)
onRoomChange(state.room)

events.onMovementChange((isMoving, angle) => {
  if (!isMoving) {
    player.stop()
  } else {
    player.move(angle ?? 0, infinity)
  }
})
events.onAction('debug', () => {
  debug = !debug
  if (!debug) {
    renderDebug([])
    renderRoomDebug([])
  } else {
    renderRoomDebug(currentRoom.edges.flatMap(a => a.vecs))
  }
})
events.onAction('editor', () => {
  if (!editor.isEnabled()) {
    Projectile.playerProjectiles.length = 0
    Projectile.enemyProjectiles.length = 0
    Enemy.enemies.length = 0
    player.stop()
    isRunning = false
    currentRoom.edges = []
    currentRoom.insides = []
    renderRoom([])
    renderRoomDebug([])
    renderDebug([])
    renderUnits([])
    editor.enable()
  }
})
events.onAction('pause', () => {
  console.log('pause')
  isRunning = false
  Timer.pause()
  setTimeout(() => {
    isRunning = true
    Timer.resume()
  }, 1000)
})
events.onShot((angle) => player.shoot(angle))

editor.onUpdate(() => renderRoom(editor.getObjects()))
Enemy.onKill = (wasLastEnemy: boolean) => {
  lastKillOrRoomChange = Date.now()
  state.score += config.killScore
  if (wasLastEnemy) { state.score += config.clearRoomScore }
  renderUi(state)
}

const lose = () => {
  console.log('game over')
}

player.onRoomChange = onRoomChange
player.onDeath = async () => {
  state.lifes--
  if (state.lifes === 0) {
    lose()
    return
  }
  isRunning = false
  await new Promise(resolve => setTimeout(resolve, 1000))
  isRunning = true
  onRoomChange(state.room)
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
  for (let i = 0; i < Projectile.playerProjectiles.length; i++) {
    Projectile.playerProjectiles[i].update()
  }
  for (let i = 0; i < Projectile.enemyProjectiles.length; i++) {
    Projectile.enemyProjectiles[i].update()
  }
  for (let i = 0; i < Enemy.enemies.length; i++) {
    Enemy.enemies[i].update(player.pos)
  }
  if (currentRoom.item !== undefined) {
    currentRoom.item.checkCollision(player)
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
  for (let i = 0; i < currentRoom.edges.length; i++) {
    objects[index++] = currentRoom.edges[i]
  }
  for (let i = 0; i < Explosion.explosions.length; i++) {
    objects[index++] = Explosion.explosions[i]
  }
  if (currentRoom.item !== undefined) {
    objects[index++] = currentRoom.item
  }
  renderUnits(objects)
  renderRoom(currentRoom.insides)
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
    renderDebug(objects)
  }
}

requestAnimationFrame(gameLoop)

//new Shadow(new Point(350, 350))
// new Drone(new Point(400, 400), 'blue')
// new Jumper(new Point(350, 300))
Enemy.enemies.sort(a => player.pos.calculateDistance(a.pos))
