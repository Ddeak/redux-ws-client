import humps from 'humps'

const makeTypes = (serviceName, typeNames) => {
  var types = {}
  for (let typeName of typeNames) {
    typeName = humps.camelize(`${serviceName}_${typeName}`)
    types[typeName] = humps.decamelize(typeName).toUpperCase()
  }
  return types
}

const makeActions = (types, custom) => {
  var actions = {}
  for (let key of Object.keys(types)) {
    actions[key] = (data, next) => {
      let action = {
        types,
        type: types[key],
        data,
        next
      }
      return custom ? Object.assign({}, action, custom) : action
    }
  }
  return actions
}

export { makeActions, makeTypes }
