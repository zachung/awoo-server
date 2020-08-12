import move from '../commands/move'
import set from '../commands/set'
import announce from '../commands/announce'

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
