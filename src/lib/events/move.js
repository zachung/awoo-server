import MoveException from '../exceptions/MoveException'
import db from '../../db/Db'

const changeFace = (fromX, fromY, toX, toY) => {
  const dx = toX - fromX
  const dy = toY - fromY
  let d = ''
  if (dy < 0) {
    d = '1'
  } else if (dy > 0) {
    d = '2'
  } else {
    d = '0'
  }
  if (dx < 0) {
    d = `1${d}`
  } else if (dx > 0) {
    d = `2${d}`
  } else {
    d = `0${d}`
  }
  return d
}

/** @this Messenger */
export default function (socket, game, { name, x, y }, cb) {
  const player = game.players[name]
  const fromX = player.globalX
  const fromY = player.globalY
  const face = changeFace(fromX, fromY, x, y)
  game.world
    .move(fromX, fromY, x, y)
    .then(item => {
      // update blocks
      if (face !== undefined) {
        item.props.face = face
      }
      Promise.all([
        game.world.getChunkItem(fromX, fromY),
        game.world.getChunkItem(x, y)
      ]).then(items => {
        const data = []
        items.forEach(item => data.push(item.toData()))
        this.syncBlocks(data)
        // 存放用戶資料
        db.updateUser(name, player.toData())
        // 回呼
        cb()
      })
    })
    .catch(err => {
      if (err instanceof MoveException) {
        const item = err.item
        if (item) {
          if (face !== undefined) {
            item.props.face = face
          }
          // sync item status
          this.syncBlocks([item.toData()])
        }
        err = err.message
      }
      // 回呼失敗原因
      cb(err)
    })
}
