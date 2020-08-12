/** @this Messenger */
export default function (socket, game, message) {
  const name = socket.player.props.name
  this.say({ name, message })
}
