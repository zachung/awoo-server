import World from './World'
import FileChunkReader from './FileChunkReader'
import logger from './Logger'
import { Item } from 'awoo-core'
import Messenger from './Messenger'

const SaveDelayMicroSeconds = 10000

const players = []

/**
 * @property {World} world
 */
class Game {
  constructor () {
    this.loading = false
    this.world = new World({
      chunkReader: new FileChunkReader()
    })
    this.players = {}
  }

  start (options) {
    if (this.isStart) {
      return
    }
    logger.level = options.debug ? 'debug' : 'info'
    return this.world
      .loadChunk(0, 0)
      .then(() => this.worldSaveLoop())
      .then(() => this.afterStart())
  }

  worldSaveLoop () {
    return this.world
      .save()
      .then(() => {
        logger.info('world saved')
      })
      .catch(err => {
        logger.error(`world save failed ${err}`)
      })
      .finally(() => {
        // retry 5s after
        setTimeout(() => {
          this.worldSaveLoop()
        }, SaveDelayMicroSeconds)
      })
  }

  afterStart () {
    this.isStart = true
  }

  listen (io) {
    this.messenger = new Messenger(this, io)
  }

  /**
   * @param name
   * @returns {Promise<Item>}
   */
  addPlayer ({ name }) {
    if (this.players[name]) {
      return Promise.reject(`${name} already online`)
    }
    const player = new Item({
      type: 2,
      id: 0
    })
    if (!players[name]) {
      const randomPoint = () => Math.floor(Math.random() * 6) + 10
      const x = randomPoint()
      const y = randomPoint()
      // record player's position
      players[name] = { x, y, online: true }
    }
    const { x, y } = players[name]

    return this.world
      .addItem(x, y, player)
      .catch(() => {
        // 與其他物件重疊，向x軸位移
        players[name].x++
        return this.addPlayer({ name })
      })
      .then(() => {
        this.players[name] = player
        return player
      })
  }

  removePlayer ({ name }) {
    const player = this.players[name]
    if (!player) {
      return
    }
    const x = player.globalX
    const y = player.globalY
    // broadcast to every player
    this.world
      .removeItem(x, y)
      .then(() =>
        this.world
          .getChunkItem(x, y)
          .then(item => this.messenger.syncBlocks([item.toData()]))
      )
      .then(() => {
        delete this.players[name]
        players[name] = { x, y, online: false }
      })
  }
}

export default Game
