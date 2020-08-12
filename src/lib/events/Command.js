import move from '../commands/Move'
import set from '../commands/Set'
import announce from '../commands/Announce'

const commands = {
  move,
  set,
  announce
}

/** @this Messenger */
export default function (socket, game, { cmd, args }, cb) {
  if (!commands.hasOwnProperty(cmd)) {
    cb(`Invalid command: ${cmd}`)
    return
  }
  commands[cmd](game, socket.player, args, cb)
}
