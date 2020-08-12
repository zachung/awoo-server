import logger from '../Logger'
import db from '../../db/Db'
import * as webPush from 'web-push'
import dotenv from 'dotenv'

dotenv.config()

const vapidKeys = {
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY
}
webPush.setVapidDetails(
  'mailto:zach50931@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

const Desc = '/announce {msg}'

const announce = msg => {
  const options = {
    icon: 'images/icon.png',
    body: msg,
    title: 'Awoo App'
  }
  logger.info(`announcement: ${msg}`)
  const subscriptions = db.getSubscriptions()
  const map = subscriptions.map(subscription =>
    webPush.sendNotification(subscription, JSON.stringify(options))
  )
  return Promise.all(map)
}

export default function (game, player, msg) {
  announce(msg).catch(err => logger.error(err))
}
