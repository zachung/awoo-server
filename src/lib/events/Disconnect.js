import logger from '../Logger'
import chalk from 'chalk'

const playerName = chalk.bold.green

/** @this Messenger */
export default function (socket, game) {
  const name = socket.player.props.name
  logger.info(`Say goodbye to [${playerName(name)}]`)
  const player = game.players[name]
  if (!player) {
    return
  }
  const x = player.globalX
  const y = player.globalY
  game.world.removeItem(x, y)
  delete game.players[name]
  // broadcast to every player
  game.world.getChunkItem(x, y).then(item => this.syncBlocks([item.toData()]))
};
