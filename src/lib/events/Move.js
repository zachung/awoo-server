/** @this Messenger */
export default function (socket, game, { name, x, y }, cb) {
  const player = game.players[name]
  const fromX = player.globalX
  const fromY = player.globalY
  game.world
    .move(fromX, fromY, x, y)
    .then(() => {
      // update blocks
      Promise.all([
        game.world.getChunkItem(fromX, fromY),
        game.world.getChunkItem(x, y)
      ]).then(items => {
        const data = []
        items.forEach(item => data.push(item.toData()))
        // TODO: update by client
        socket.emit('sync_blocks', data)
        this.syncBlocks(data)
        cb()
      })
    })
    .catch(cb)
};
