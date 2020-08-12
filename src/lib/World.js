import { Chunk } from 'awoo-core'
import logger from './Logger'
import MoveException from './exceptions/MoveException'

const ChunkSize = 32
const round = p => ((p % ChunkSize) + ChunkSize) % ChunkSize
const chunkOffset = p => Math.floor(p / ChunkSize)

const isEmpty = item => item.type === undefined

/**
 * @property {FileChunkReader} chunkReader
 */
class World {
  constructor ({ chunkReader }) {
    this.chunks = new Proxy({}, chunkReader.chunkHandler())
    this.chunkReader = chunkReader
  }

  /**
   * move item
   * @param fromX
   * @param fromY
   * @param toX
   * @param toY
   * @returns {Promise<Item>}
   */
  move (fromX, fromY, toX, toY) {
    return this.getChunkItem(fromX, fromY).then(item => {
      const message = `(${fromX}, ${fromY}) to (${toX}, ${toY})`
      if (isEmpty(item)) {
        throw new MoveException(`someone try to move air ${message}`)
      }
      const name = item.props.name
      logger.debug(`[${name}] try moving from ${message}`)
      const chunk = item.chunk
      return this.addItem(toX, toY, item)
        .then(newChunk => {
          chunk.removeItem(round(fromX), round(fromY))
          if (chunk.chunkName !== newChunk.chunkName) {
            // item's chunk is changed, maybe can async
            return this.loadNearChunks(chunkOffset(toX), chunkOffset(toY)).then(
              () => item
            )
          }
          return item
        })
        .catch(err => {
          throw new MoveException(err, item)
        })
    })
  }

  addItem (toX, toY, item) {
    return this.getChunkByLoc(toX, toY).then(newChunk => {
      const x = round(toX)
      const y = round(toY)
      newChunk.addItem(item, x, y)
      item.setLocalPosition(x, y)
      return newChunk
    })
  }

  removeItem (fromX, fromY) {
    return this.getChunkByLoc(fromX, fromY).then(chunk => {
      chunk.removeItem(round(fromX), round(fromY))
    })
  }

  loadChunk (chunkX, chunkY) {
    const chunkName = Chunk.getChunkName(chunkX, chunkY)
    return this.chunks[chunkName]
  }

  loadNearChunks (chunkX, chunkY) {
    // check nearest chunk is loaded
    const loaders = []
    for (let x = chunkX - 1; x <= chunkX + 1; x++) {
      for (let y = chunkY - 1; y <= chunkY + 1; y++) {
        loaders.push(this.loadChunk(x, y))
      }
    }
    return Promise.all(loaders).catch(err => {
      logger.error(err.message)
    })
  }

  getChunkItem (x, y) {
    return this.getChunkByLoc(x, y).then(chunk => {
      return chunk.getItem(round(x), round(y))
    })
  }

  getChunkByLoc (x, y) {
    const chunkName = Chunk.getChunkName(chunkOffset(x), chunkOffset(y))
    return this.chunks[chunkName]
  }

  save () {
    return Promise.all(
      Object.values(this.chunks)
    )
      .then(chunks => {
        chunks = chunks.filter(chunk => chunk.isDirty)
        const processes = []
        chunks.forEach(chunk => {
          const data = chunk.export()
          // dont save user
          delete data.items['2:0']
          processes.push(
            this.chunkReader
              .saveData(chunk.chunkName, data)
              .catch(err => console.log(err))
          )
        })
        return processes
      })
      .then(chunks => {
        chunks.forEach(chunk => (chunk.isDirty = false))
      })
  }
}

export default World
