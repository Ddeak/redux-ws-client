import io from 'socket.io-client'
import { actions } from './action'

const websocket = ({ websocketUrl }) => store => {
  const socket = io(websocketUrl)
  socket.on('server_message', action => store.dispatch(action))
  socket.on('disconnect', () => store.dispatch(actions.disconnect()))

  return next => action => {
    action.types = action.types || {}
    if (!action.fromApi && !action.local) {
      const callback = action.next || (resultsFromApi => store.dispatch(actions.response(action, resultsFromApi)))
      socket.emit('client_message', action, callback)
    }

    return next(action)
  }
}

export default websocket
