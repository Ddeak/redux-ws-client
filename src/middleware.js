import io from 'socket.io-client'
import { actions } from './action'

const websocket = ({ websocketUrl }) => store => {
  const socket = io.connect(websocketUrl)
  socket.on('server_message', action => store.dispatch(action))
  socket.on('disconnect', () => store.dispatch(actions.disconnect()))

  return next => action => {
    action.types = action.types || {}
    if (!action.fromServer && !action.local) {
      const callback = action.next || (resultsFromServer => store.dispatch(actions.response(action, resultsFromServer)))
      socket.emit('client_message', action, callback)
    }

    return next(action)
  }
}

export default websocket
