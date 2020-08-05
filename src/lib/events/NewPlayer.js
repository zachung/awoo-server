import logger from '../Logger'
import chalk from 'chalk'

const playerName = chalk.bold.green

const addPlayer = (game, name) => {
  const randomPoint = () => Math.floor(Math.random() * 6) + 10
  const x = randomPoint()
  const y = randomPoint()
  return game.addPlayer({ name, x, y }).catch(() => addPlayer(game, name))
}

/** @this Messenger */
export default function (socket, game, name) {
  logger.info(`Well come back [${playerName(name)}]`)
  addPlayer(game, name).then(player => {
    player.props.name = name
    socket.player = player
    this.inGame(player)
  })
};
