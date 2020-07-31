import { Chunk } from 'awoo-core'

const ChunkSize = 32
const round = p => ((p % ChunkSize) + ChunkSize) % ChunkSize
const chunkOffset = p => Math.floor(p / ChunkSize)

const chunkLoc = (x, y) => {
  return x.toString() + '_' + y.toString()
}

const isEmpty = item => item.type === undefined

/**
 * @property {FileChunkReader} chunkReader
 */
class World {
  constructor ({ chunkReader }) {
    this.chunks = {}
    this.chunkReader = chunkReader
  }

  move (fromX, fromY, toX, toY) {
    const item = this.getChunkItem(fromX, fromY)
    if (isEmpty(item)) {
      // move air ?
      return Promise.resolve()
    }
    const chunk = item.chunk

    return new Promise((resolve, reject) => {
      const newChunk = this.getChunkByLoc(toX, toY)
      if (!newChunk) {
        return this.loadChunk(chunkOffset(toX), chunkOffset(toY)).then(resolve)
      }
      resolve(newChunk)
    }).then(newChunk => {
      const x = round(toX)
      const y = round(toY)
      newChunk.addItem(item, x, y)
      chunk.removeItem(round(fromX), round(fromY))
      item.setLocalPosition(x, y)
      if (chunk.chunkName !== newChunk.chunkName) {
        // item's chunk is changed, maybe can async
        return this.loadNearChunks(chunkOffset(toX), chunkOffset(toY))
      }
    })
  }

  loadChunk (chunkX, chunkY) {
    const curChunkInx = chunkLoc(chunkX, chunkY)
    if (this.chunks[curChunkInx]) {
      return Promise.resolve()
    }
    const chunk = new Chunk(chunkX, chunkY)
    this.addChunk(chunk)
    return chunk.loadWorld(this.chunkReader).then(() => chunk)
  }

  loadNearChunks (chunkX, chunkY) {
    // check nearest chunk is loaded
    const loaders = []
    for (let x = chunkX - 1; x <= chunkX + 1; x++) {
      for (let y = chunkY - 1; y <= chunkY + 1; y++) {
        loaders.push(this.loadChunk(x, y))
      }
    }
    return Promise.all(loaders)
  }

  addChunk (chunk) {
    this.chunks[chunkLoc(chunk.offsetX, chunk.offsetY)] = chunk
    chunk.setStage(this)
  }

  getChunkItem (x, y) {
    const chunk = this.getChunkByLoc(x, y)
    if (!chunk) {
      return
    }
    return chunk.getItem(round(x), round(y))
  }

  getChunkByLoc (x, y) {
    const chunkInx = chunkLoc(chunkOffset(x), chunkOffset(y))
    return this.chunks[chunkInx]
  }

  save () {
    return Promise.resolve(
      Object.values(this.chunks).filter(chunk => chunk.isDirty)
    )
      .then(chunks => {
        const processes = []
        chunks.forEach(chunk => {
          const data = chunk.export()
          processes.push(
            this.chunkReader.saveData(chunk.chunkName, data)
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
