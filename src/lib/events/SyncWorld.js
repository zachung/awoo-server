/** @this Messenger */
export default function (socket, game, chunkName, cb) {
  const chunkNames = [chunkName]
  const chunks = []
  chunkNames.forEach(chunkName => {
    chunks.push(game.world.chunks[chunkName])
  })
  return Promise.all(chunks)
    .then(chunks => {
      const exports = {}
      chunks.forEach(chunk => (exports[chunk.chunkName] = chunk.export()))
      return cb(exports)
    })
}
