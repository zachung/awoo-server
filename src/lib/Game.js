import World from './World'
import FileChunkReader from './FileChunkReader'
import logger from './Logger'
import { Item } from 'awoo-core'

const SaveDelayMicroSeconds = 10000

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

  start () {
    if (this.isStart) {
      return
    }
    return this.world
      .loadChunk(0, 0)
      .then(() => this.worldSaveLoop())
      .then(() => this.afterStart())
  }

  worldSaveLoop () {
    return this.world.save()
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

  /**
   * @param name
   * @param x
   * @param y
   * @returns {Promise<Item>}
   */
  addPlayer ({ name, x, y }) {
    if (this.players[name]) {
      return Promise.resolve(this.players[name])
    }
    const player = new Item({
      type: 2,
      id: 0
    })
    this.players[name] = player
    return this.world.addItem(x, y, player).then(() => player)
  }
}

export default Game
