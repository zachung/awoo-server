import db from '../../db/Db'
import logger from '../Logger'

/** @this Messenger */
export default function (socket, game, subscription) {
  const name = socket.player.props.name
  db.updateSubscription(name, subscription)
  if (!subscription) {
    logger.info(`${name} is unsubscribed`)
  } else {
    logger.info(`${name} is subscribed`)
  }
}
