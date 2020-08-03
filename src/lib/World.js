import { Chunk } from 'awoo-core'

const ChunkSize = 32
const round = p => ((p % ChunkSize) + ChunkSize) % ChunkSize
const chunkOffset = p => Math.floor(p / ChunkSize)

const isEmpty = item => item.type === undefined

const chunksHandler = reader => {
  return {
    get (target, chunkName, receiver) {
      if (!target[chunkName]) {
        const chunk = Chunk.fromName(chunkName)
        target[chunkName] = chunk
        // TODO: handle missed chunk
        return chunk.loadWorld(reader).then(() => chunk)
      }
      return Promise.resolve(target[chunkName])
    }
  }
}

/**
 * @property {FileChunkReader} chunkReader
 */
class World {
  constructor ({ chunkReader }) {
    this.chunks = new Proxy({}, chunksHandler(chunkReader))
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
    return this.getChunkItem(fromX, fromY)
      .then(item => {
        if (isEmpty(item)) {
          throw Error(`someone try to move air(${fromX}, ${fromY}) to (${toX}, ${toY})`)
        }
        console.log(`item from (${item.x}, ${item.y}) moving to (${toX}, ${toY})`)
        const chunk = item.chunk
        return this.addItem(toX, toY, item).then(newChunk => {
          chunk.removeItem(round(fromX), round(fromY))
          if (chunk.chunkName !== newChunk.chunkName) {
            // item's chunk is changed, maybe can async
            return this.loadNearChunks(chunkOffset(toX), chunkOffset(toY))
              .then(() => item)
          }
          return item
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
    return Promise.all(loaders)
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
    return Promise.resolve(
      Object.values(this.chunks).filter(chunk => chunk.isDirty)
    )
      .then(chunks => {
        const processes = []
        // chunks.forEach(chunk => {
        //   const data = chunk.export()
        //   processes.push(
        //     this.chunkReader
        //       .saveData(chunk.chunkName, data)
        //       .catch(err => console.log(err))
        //   )
        // })
        return processes
      })
      .then(chunks => {
        chunks.forEach(chunk => (chunk.isDirty = false))
      })
  }
}

export default World
