export const disconnect = ({
  type: 'redux websocket disconnect'
})

export const response = ({ type }, data) => ({
  type: `${type}_RESPONSE`,
  local: true,
  data
})
