import Game from './lib/Game'

const game = new Game()
game.start()
  .then(() => {
    return game.world.move(0, 0, 1, 5)
  })
