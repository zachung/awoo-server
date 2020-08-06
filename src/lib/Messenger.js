import new_player from './events/NewPlayer'
import sync_world from './events/SyncWorld'
import move from './events/Move'
import disconnect from './events/Disconnect'
import say from './events/Say'

class Messenger {
  constructor (game, io) {
    const events = {
      new_player,
      sync_world,
      move,
      disconnect,
      say
    }

    this.io = io
    io.on('connect', socket => {
      this.socket = socket
      for (const name in events) {
        socket.on(name, events[name].bind(this, socket, game))
      }
    })
  }

  inGame (player) {
    this.socket.emit('in_game', {
      x: player.globalX,
      y: player.globalY
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
