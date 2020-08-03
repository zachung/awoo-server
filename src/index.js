import { createServer } from 'http'
import Server from 'socket.io'
import Game from './lib/Game'
import events from './lib/events'

const game = new Game()
game.start()

const server = createServer()
const io = new Server(server)

io.on('connect', events(game))
server.listen(3000)
