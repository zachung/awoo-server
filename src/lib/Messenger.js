import new_player from './events/new_player'
import sync_world from './events/sync_world'
import move from './events/move'
import disconnect from './events/disconnect'
import say from './events/say'
import command from './events/command'
import subscription from './events/subscription'

class Messenger {
  constructor (game, io) {
    const events = {
      new_player,
      sync_world,
      move,
      disconnect,
      say,
      command,
      subscription
    }

    this.io = io
    io.on('connect', socket => {
      this.socket = socket
      for (const name in events) {
        socket.on(name, events[name].bind(this, socket, game))
      }
    })
  }

  syncBlocks (itemDataArray) {
    this.io.emit('sync_blocks', itemDataArray)
  }

  say ({ name, message }) {
    this.io.emit('message', { name, message })
  }

  broadcastOnlineCount (count) {
    this.io.emit('current_online', count)
  }
}

export default Messenger
