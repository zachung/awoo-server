import Move from '../commands/Move'

const commands = {
  move: Move
}

/** @this Messenger */
export default function (socket, game, { cmd, args }, cb) {
  if (!commands.hasOwnProperty(cmd)) {
    cb(`Invalid command: ${cmd}`)
    return
  }
  commands[cmd](game, socket.player, args, cb)
}
