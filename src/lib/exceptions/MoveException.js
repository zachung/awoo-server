import { Item } from 'awoo-core'

/**
 * @property {Item} item
 */
class MoveException {
  constructor (message, item = undefined) {
    this.message = message
    this.item = item
  }
}

export default MoveException
