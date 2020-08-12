import logger from '../Logger'
import MoveException from '../exceptions/MoveException'

const Desc = '/move {x} {y}'

export default function (game, player, [x, y], cb) {
  const fromX = player.globalX
  const fromY = player.globalY
  if (x === undefined || y === undefined) {
    cb(Desc)
    return
  }
  game.world
    .move(fromX, fromY, x, y)
    .then(item => {
      // update blocks
      Promise.all([
        game.world.getChunkItem(fromX, fromY),
        game.world.getChunkItem(x, y)
      ]).then(items => {
        const data = []
        items.forEach(item => data.push(item.toData()))
        game.messenger.syncBlocks(data)
      })
    })
    .catch(err => {
      if (err instanceof MoveException) {
        logger.error(err.message)
        cb(err.message.toString())
        return
      }
      console.log(err)
      cb(err)
    })
}
