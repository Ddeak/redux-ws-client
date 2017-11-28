# redux-ws-client
The client side implementation of the redux-websocket stack.

The intent of this project is to allow a simple development framework for app built with a React/Redux frontend, and a NodeJS backend. This project acts as the tool to allow clients to connect to the server/api, and use the a very similar coding style that is used in the client, while at the same time overcoming some of the async complications of standard react applications. 

Due to the use of socket.io, all connected applications can be updated in real-time. While this may not be applicable to all websites, it does mean that your users will always be looking at the most up-to-date data, which asking them to refresh their local state manually (via refresh or button clicks)


# How it works

## The framework

All client applications connect to a single instance of the server, which hosts a socket.io server. (Note that both an express and socket.io server can be exposed on the same port if applicable).

The core concept of the stack is, taking a principle from Redux where all actions are passed through all reducers, there are 'Handlers' on the server which serve the same purpose. So actions can be sent to the server, and there they will be processed by all Handlers.

### But how?

A piece of middleware is added to redux so that after the action has been processed by all client-side reducers, (if the correct flag is set) it will transmit the action up through the websocket connection to be handled on the server. 

To elaborate, a typical action flow may look like this:

1. Action dispatched 
2. Processed by all reducers
3. Sent up to server 
4. Processed by all Handlers 
5. Like reducers, each handler can 'intercept' the action 
6. Each handler can choose to send a 'response' to the client.

### How it looks in a reducer:

```
export default (state = {}, action) => {
  let { type, data } = action

  switch (type) {
    case 'SAY_HI': 
      // Act on the state locally.
    case 'SAY_HI_RESPONSE: 
      // A response from a handler on the server that has processed the 'SAY_HI' action
    default: return state
  }
}
```

### How the handler looks:

```
import { MakeHandler } from 'redux-websocket-server'

const handler = (action) => {
  let { type, data } = action
  
  switch (type) {
    case 'SAY_HI':
      return await sayHiToTheClient()
  }
}

export default MakeHandler(handler)
```

## Handlers

The server component has a concept of Handlers. Helpers are (currently) what are the equivalent of Reducers, but on the backend. They could easily be renamed to reducer, however doesn't actually do any reducing, it feels a bit odd to call them that.

Handlers do however have a similar syntax as reducers, in that they are functions that take in the action currently being handled. Generally it's best to deal with them in the same way, using a switch statement to extract the type, and any data. If using the MakeHandler helpder function, the returned value can be a Promise to allow for async calls. 

## So why would I want all this?

Simplicity and code-similarity. Take the following use-case as an example:

Your applications deals with displaying a list of users. You can add or delete from the list.

Say you want to add a new user. 
* You create an action ADD_USER, and dispatch it with the new users details. 
  * The reducers locally can handle the action.
  * You can even add the user to the table now, before anything happens on the database.
* It is transmitted up to the Server
  * The handlers process the request, you can asyncronously call an add to you DB for example. 
    * If it is successful, you can generate a success response
    * If it is a failure, you can generate an error response
* If appropriate, a response is sent back to the client
  * The response is just an action too! So it will be processed by all reducers.
* Want this change transmitted to all clients that are viewing the list? Simply add a 'broadcast' tag to the original action.

The example is a simple one, but it emphasises are few key points: 
1. It's easy for the developer to get an action up to the API. 
2. It's removed the need for plugins like Thunks or Sagas to handle async data.
3. Code in the front end is similar to code in the back end.
4. Keeping all applications up to date with the latest information is automated.
5. Everything is an action! So just React accordingly!
