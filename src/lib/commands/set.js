import logger from '../Logger'
import { Item, Chunk } from 'awoo-core'

const Desc = '/set {type:id} {x} {y}'

export default function (game, player, [key, x, y], cb) {
  const name = player.props.name
  if (key === undefined || x === undefined || y === undefined) {
    cb(Desc)
    return
  }
  const item = Item.fromData([key, '', x, y])
  game.world
    .addItem(x, y, item)
    .then(() => {
      logger.info(`${name} added ${key} to (${x},${y})`)
      game.messenger.syncBlocks([item.toData()])
    })
    .catch(err => {
      cb(err)
    })
}
