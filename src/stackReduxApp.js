import { applyMiddleware, combine, combineReducers } from 'redux'
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

    const middleware = applyMiddleware(websocket(opts))
    const enhancerFunc = enhancer ? combine(enhancer, middleware) : middleware
    return createStore(reducer, initial, enhancerFunc)
  }
}

export default stackReduxApp
