import Game from './lib/Game'

const game = new Game()
game.start()
  .then(() => {
    const item = game.world.getChunkItem(0, 0)
    console.log(item)
  })
  .then(() => {
    return game.world.move(0, 0, 1, 5)
  })
  .then(() => {
    const item = game.world.getChunkItem(0, 0)
    console.log(item)
  })
