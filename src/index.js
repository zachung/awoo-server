import { createServer } from 'http'
import Server from 'socket.io'
import dotenv from 'dotenv'
import Game from './lib/Game'

dotenv.config()

const game = new Game()
const server = createServer()
const io = new Server(server)

game.listen(io)
game.start({
  debug: process.env.DEBUG
})

server.listen(process.env.PORT)
