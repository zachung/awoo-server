import fs from 'fs'
import { ChunkReader } from 'awoo-core'

const saveFolder = 'save/'
const defaultFolder = 'world/'

class FileChunkReader extends ChunkReader {
  constructor () {
    super()
    if (!fs.existsSync(saveFolder)) {
      fs.mkdirSync(saveFolder)
    }
  }

  fetchData (chunk) {
    return new Promise((resolve, reject) => {
      const path = saveFolder + chunk + '.json'
      fs.readFile(path, (err, data) => {
        if (err) {
          if (err.code !== 'ENOENT') {
            // load chunk failed
            reject(err)
            return
          }
          // save file not exist (no such file)
          console.log('save file not exist (no such file)')
          const path = defaultFolder + chunk + '.json'
          fs.readFile(path, (err, data) => {
            if (err) {
              reject(err)
              return
            }
            const json = JSON.parse(data)
            resolve(json)
          })
          return
        }
        const json = JSON.parse(data)
        console.log(json.items['1:0'])
        resolve(json)
      })
    })
  }

  saveData (chunk, data) {
    const path = saveFolder + chunk + '.json'
    return new Promise((resolve, reject) => {
      fs.writeFile(path, JSON.stringify(data), reject)
      resolve()
    })
  }
}

export default FileChunkReader
