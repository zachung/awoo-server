import logger from '../Logger'
import { Item, Chunk } from 'awoo-core'

const Desc = '/set {type:id} {x} {y}'

function addItem (key, x, y, game, name, errors) {
  return game.world.getChunkItem(x, y).then(oldItem => {
    console.log(oldItem.type, oldItem.id)
    if (oldItem && oldItem.type === 2 && oldItem.id === 0) {
      // 不複寫 player (2:0)
      return Promise.resolve()
    }
    return game.world.removeItem(x, y).then(() => {
      const item = Item.fromData([key, '', x, y])
      if (item.type === 0 && item.id === 0) {
        return Promise.resolve()
      }
      return game.world
        .addItem(x, y, item)
        .then(() => item.toData())
        .catch(err => {
          errors.push(err)
        })
    })
  })
}

export default function (game, player, [key, x, y], cb) {
  const name = player.props.name
  if (key === undefined || x === undefined || y === undefined) {
    cb(Desc)
    return
  }
  const errors = []
  const promises = []

  let [fromX1, fromX2] = x.split(':')
  let [fromY1, fromY2] = y.split(':')
  fromX2 = fromX2 || fromX1
  fromY2 = fromY2 || fromY1
  for (let x = fromX1; x <= fromX2; x++) {
    for (let y = fromY1; y <= fromY2; y++) {
      promises.push(addItem(key, x, y, game, name, errors))
    }
  }

  Promise.all(promises)
    .then(blockData => {
      logger.info(`${name} added ${key} to (${x},${y})`)
      game.messenger.syncBlocks(blockData.filter(data => !!data))
    })
    .catch(err => {
      cb(err)
    })
}
