import low from 'lowdb'

const FileSync = require('lowdb/adapters/FileSync')
const Users = 'users'

/**
 * @property {ItemData} itemData
 * @property {string} name
 * @property {boolean} admin
 * @property {Object} subscription
 */
class User {
  constructor (itemData) {
    this.itemData = itemData
    this.name = itemData.props.name
  }
}

class Db {
  constructor () {
    const adapter = new FileSync('save/db.json', {
      defaultValue: {
        [Users]: []
      }
    })
    this.db = low(adapter)
  }

  removeAdmin (name) {
    this.db
      .get(Users)
      .find({ name })
      .assign({ admin: false })
      .write()
  }

  setAdmin (name) {
    this.db
      .get(Users)
      .find({ name })
      .assign({ admin: true })
      .write()
  }

  isAdmin (name) {
    const user = this.getUser(name)
    return user ? user.admin === true : false
  }

  /**
   * @param name
   * @return {User}
   */
  getUser (name) {
    return this.db
      .get(Users)
      .find({ name })
      .value()
  }

  /**
   * @param name
   * @param {ItemData} itemData
   */
  updateUser (name, itemData) {
    if (!this.getUser(name)) {
      // new user
      const user = new User(itemData)
      this.db
        .get(Users)
        .push(user)
        .write()
    } else {
      const user = new User(itemData)
      this.db
        .get(Users)
        .find({ name })
        .assign(user)
        .write()
    }
  }

  updateSubscription (name, subscription) {
    this.db
      .get(Users)
      .find({ name })
      .assign({ subscription })
      .write()
  }
}

const db = new Db()

export default db
