import Move from '../commands/Move'
import Set from '../commands/Set'

const commands = {
  move: Move,
  set: Set
}

/** @this Messenger */
export default function (socket, game, { cmd, args }, cb) {
  if (!commands.hasOwnProperty(cmd)) {
    cb(`Invalid command: ${cmd}`)
    return
  }
  commands[cmd](game, socket.player, args, cb)
}
