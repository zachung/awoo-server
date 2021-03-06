import fs from 'fs'
import { Chunk, ChunkReader } from 'awoo-core'
import logger from './Logger'

const saveFolder = 'save/'
const defaultFolder = 'world/'

const readFromFile = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err)
        return
      }
      const json = JSON.parse(data)
      resolve(json)
    })
  })
}

class FileChunkReader extends ChunkReader {
  constructor () {
    super()
    if (!fs.existsSync(saveFolder)) {
      fs.mkdirSync(saveFolder)
    }
  }

  fetchData (chunk) {
    return readFromFile(saveFolder + chunk + '.json').catch(err => {
      if (err.code !== 'ENOENT') {
        // load chunk failed
        throw err
      }
      // save file not exist (no such file)
      return readFromFile(defaultFolder + chunk + '.json')
    })
  }

  saveData (chunk, data) {
    const path = saveFolder + chunk + '.json'
    return new Promise((resolve, reject) => {
      fs.writeFile(path, JSON.stringify(data), reject)
      resolve()
    })
  }

  chunkHandler () {
    /**
     * @type {FileChunkReader|ChunkReader}
     */
    const reader = this
    return {
      get (target, chunkName, receiver) {
        if (!target[chunkName]) {
          const chunk = Chunk.fromName(chunkName)
          target[chunkName] = chunk
          return chunk
            .loadWorld(reader)
            .then(() => chunk)
            .catch(err => {
              // handle missed chunk
              logger.info(`initialing ${chunkName}..`)
              return reader.saveData(chunkName, {
                grounds: [],
                items: []
              }).then(() => {
                const chunk = Chunk.fromName(chunkName)
                target[chunkName] = chunk
                return chunk.loadWorld(reader).then(() => chunk)
              })
            })
        }
        return Promise.resolve(target[chunkName])
      }
    }
  }
}

export default FileChunkReader
