import logger from '../Logger'
import * as webPush from 'web-push'

const vapidKeys = {
  publicKey: `BIgJUwf48URPko1t0mzzaB2aydbjO03vjKipOpLQy8mS-xXNt8FakaKuui-6P_m2T72fBTFsHDIw-7ebnUvBTmQ`,
  privateKey: 'iITwLlTaTGuwmibJ2PgzVvsHen8ZkYmVui2lzvNRwe0'
}
webPush.setVapidDetails(
  'mailto:zach50931@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

const subscription = {
  endpoint:
    'https://fcm.googleapis.com/fcm/send/fVE82D5lhvU:APA91bHf0TSFv4NoNW9g-PxAvG8g_mlETaMzaCb81rowL6yvE4HDb0ZLPmwB6r2hi0uGf9QZRmff2UgjAoqBIziSCRNMHHk4Ry3LlAYSoi03SwxJnG0ateqC4B-Nj11dDPNv5jdZ7G6E',
  expirationTime: null,
  keys: {
    p256dh:
      'BB-hFq021vJyJgdMPSOxqFZ119R7Py-pB53mFz7YrbZQkGn-l9ZB-SRtF5TWT0h3nXALKm4ralJvCLxHxCIcjnU',
    auth: 'OrfgGuRhZ2Z0xokCwUvp7w'
  }
}

const Desc = '/announce {msg}'

const announce = msg => {
  const options = {
    icon: 'images/icon.png',
    body: msg
  }
  logger.info(`announcement: ${msg}`)
  return webPush.sendNotification(subscription, JSON.stringify(options))
}

export default function (game, player, _, cb) {
  announce('歡迎加入 Awoo 的世界').catch((...args) => {
    console.log(args)
  })
}
