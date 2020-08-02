import World from './World'
import FileChunkReader from './FileChunkReader'
import logger from './Logger'
import readline from 'readline'

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

  afterStart() {
    this.isStart = true
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question('say hi', answer => {
      console.log(answer)
    })
  }
}

export default Game
