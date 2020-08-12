import logger from '../Logger'
import chalk from 'chalk'

const playerName = chalk.bold.green

const addPlayer = (game, name) =>
  game.addPlayer({ name }).catch(() => addPlayer(game, name))

/** @this Messenger */
export default function (socket, game, name, cb) {
  logger.info(`Well come back [${playerName(name)}]`)
  game
    .addPlayer({ name })
    .then(player => {
      player.props.name = name
      socket.player = player
      this.broadcastOnlineCount(game.playerCount)
      cb(null, {
        x: player.globalX,
        y: player.globalY,
      })
    })
    .catch(cb)
}
