import logger from './Logger'
import chalk from 'chalk'

const playerName = chalk.bold.green

const syncWorld = game => {
  return chunkNames => {
    const chunks = []
    chunkNames.forEach(chunkName => {
      chunks.push(game.world.chunks[chunkName])
    })
    return Promise.all(chunks).then(chunks => {
      const exports = {}
      chunks.forEach(chunk => exports[chunk.chunkName] = chunk.export())
      return exports
    })
  }
}

export default game => {
  return socket => {
    socket.on('new-player', name => {
      logger.info(`Well come back [${playerName(name)}]`)
      game
        .addPlayer({ name, x: 16, y: 16 })
        .then(player => {
          socket.player = player
          socket.emit('in-game', {
            x: player.globalX,
            y: player.globalY
          })
        })
        .catch(err => {
          console.log(err)
        })
      socket.on('sync-world', (chunkName, cb) => {
        syncWorld(game)([chunkName]).then(cb)
      })
      socket.on('move', ({ name, x, y }) => {
        const player = game.players[name]
        const chunksChanged = [player.chunk.chunkName]
        game.world.move(player.globalX, player.globalY, x, y).then(player => {
          chunksChanged.push(player.chunk.chunkName)
          syncWorld(game)(chunksChanged).then(exports => {
            socket.emit('sync-world', exports)
          })
          // TODO: broadcast to every player
        })
      })
      socket.on('disconnect', () => {
        logger.info(`Say goodbye to [${playerName(name)}]`)
      })
    })
  }
};
