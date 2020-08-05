import logger from '../Logger'
import chalk from 'chalk'

const playerName = chalk.bold.green

const addPlayer = (game, name) =>
  game.addPlayer({ name }).catch(() => addPlayer(game, name))

/** @this Messenger */
export default function (socket, game, name) {
  logger.info(`Well come back [${playerName(name)}]`)
  addPlayer(game, name).then(player => {
    player.props.name = name
    socket.player = player
    this.inGame(player)
  })
}
