import { applyMiddleware, combine, combineReducers } from 'redux'
import thunk from 'redux-thunk'
import websocket from './middleware'
import isPlainObject from 'lodash/isPlainObject'
import isFunction from 'lodash/isFunction'

const wrapReducer = reducer => {
  return (state, action) => {
    action.types = action.types || {}
    return reducer(state, action)
  }
}

const buildReducer = definition => {
  if (isPlainObject(definition)) {
    const reducers = Object
      .keys(definition)
      .reduce((res, key) => ({...res, [key]: buildReducer(definition[key])}), {})
    return wrapReducer(combineReducers(reducers))
  }
  else if (isFunction(definition)) { return wrapReducer(definition) }
  else { throw new Error('One of your services is exporting an invalid reducer definition') }
}

const extractReducers = services => {
  return Object
    .keys(services)
    .reduce((res, key) => ({...res, [key]: services[key].reducer}), {})
}

const stackReduxApp = opts => {
  return createStore => (services, initial, enhancer) => {
    const reducer = buildReducer(extractReducers(services))

    const ware = [thunk]
    if (opts.websocketUrl) ware.push(websocket(opts))

    const middleware = applyMiddleware(...ware)
    const enhancerFunc = enhancer ? combine(enhancer, middleware) : middleware
    const store = createStore(reducer, initial, enhancerFunc)

    return store
  }
}

export { stackReduxApp }