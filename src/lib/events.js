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
    socket.on('new_player', name => {
      logger.info(`Well come back [${playerName(name)}]`)
      game
        .addPlayer({ name, x: 16, y: 16 })
        .then(player => {
          socket.player = player
          socket.emit('in_game', {
            x: player.globalX,
            y: player.globalY
          })
        })
        .catch(err => {
          console.log(err)
        })
      socket.on('sync_world', (chunkName, cb) => {
        syncWorld(game)([chunkName]).then(cb)
      })
      socket.on('move', ({ name, x, y }, cb) => {
        const player = game.players[name]
        const fromX = player.globalX
        const fromY = player.globalY
        game.world.move(fromX, fromY, x, y).then(player => {
          // update blocks
          Promise.all([
            game.world.getChunkItem(fromX, fromY),
            game.world.getChunkItem(x, y),
          ])
            .then(items => {
              const data = []
              items.forEach(item => data.push(item.toData()))
              socket.emit('sync_blocks', data)
              // broadcast to every player
              socket.broadcast.emit('sync_blocks', data)
              cb()
            })
        }).catch(cb)
      })
      socket.on('disconnect', () => {
        logger.info(`Say goodbye to [${playerName(name)}]`)
        const player = game.players[name]
        const x = player.globalX
        const y = player.globalY
        game.world.removeItem(x, y)
        // broadcast to every player
        game.world.getChunkItem(x, y).then(item => {
          socket.broadcast.emit('sync_blocks', [item.toData()])
        })
      })
    })
  }
};
