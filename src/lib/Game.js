import World from './World'
import FileChunkReader from './FileChunkReader'

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
      .then(() => (this.isStart = true))
  }

  worldSaveLoop () {
    return new Promise((resolve, reject) => {
      console.log('world saving...')
      this.world.save().then(resolve)
    })
      .then(() => {
        console.log('world saved')
      })
      .catch(err => {
        console.log(err)
      })
      .finally(() => {
        // retry 5s after
        setTimeout(() => {
          this.worldSaveLoop()
        }, SaveDelayMicroSeconds)
      })
  }
}

export default Game
