import World from './World'
import FileChunkReader from './FileChunkReader'
import logger from './Logger'
import { Item } from 'awoo-core'
import Messenger from './Messenger'
import db from '../db/Db'

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

  get playerCount () {
    return Object.keys(this.players).length
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
    if (name.length > 10) {
      return Promise.reject(`name is invalid`)
    }
    if (this.players[name]) {
      return Promise.reject(`${name} already online`)
    }
    const user = db.getUser(name)
    let player, x, y
    if (user) {
      // 先前已建立的用戶
      player = Item.fromData(user.itemData)
      x = player.globalX
      y = player.globalY
    } else {
      // new player
      const randomPoint = () => Math.floor(Math.random() * 6) + 10
      x = randomPoint()
      y = randomPoint()
      player = new Item({
        type: 2,
        id: 0,
        props: {
          name
        }
      })
    }

    const addPlayer = (player, x, y) => {
      return this.world
        .addItem(x, y, player)
        .catch(() => {
          // 與其他物件重疊，向x軸位移
          return addPlayer(player, x + 1, y)
        })
        .then(() => {
          this.players[name] = player
          db.updateUser(name, player.toData())
          return player
        })
    }
    return addPlayer(player, x, y)
  }

  removePlayer ({ name }) {
    const player = this.players[name]
    if (!player) {
      return
    }
    const x = player.globalX
    const y = player.globalY
    // broadcast to every player
    return this.world
      .removeItem(x, y)
      .then(() =>
        this.world
          .getChunkItem(x, y)
          .then(item => this.messenger.syncBlocks([item.toData()]))
      )
      .then(() => {
        delete this.players[name]
      })
  }
}

export default Game
