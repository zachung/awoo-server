import logger from '../Logger'
import chalk from 'chalk'

const playerName = chalk.bold.green

/** @this Messenger */
export default function (socket, game) {
  const name = socket.player.props.name
  logger.info(`Say goodbye to [${playerName(name)}]`)
  game.removePlayer({ name })
};
