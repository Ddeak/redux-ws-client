import io from 'socket.io-client'
import { response, disconnect } from './actions'

export default ({ websocketUrl }) => store => {
  const socket = io.connect(websocketUrl)

  socket.on('redux websocket server message', action => {
    action.fromServer = true
    store.dispatch(action)
  })

  socket.on('disconnect', () => store.dispatch(disconnect()))

  return next => action => {
    action.types = action.types || {}
    if (!action.fromServer && !action.local) {
      const callback = action.next || (resultsFromServer => store.dispatch(response(action, resultsFromServer)))
      socket.emit('redux websocket client message', action, callback)
    }

    return next(action)
  }
}
