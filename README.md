Redux Capture
=============

Captures all the actions dispatched by sync or async [thunk actions](https://github.com/reduxjs/redux-thunk).

[![Travis](https://img.shields.io/travis/shotamatsuda/redux-capture/master.svg?style=flat-square)](https://travis-ci.org/shotamatsuda/redux-capture)
[![Codecov](https://img.shields.io/codecov/c/github/shotamatsuda/redux-capture.svg?style=flat-square)](https://codecov.io/gh/shotamatsuda/redux-capture)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=flat-square)](https://standardjs.com)
[![npm version](https://img.shields.io/npm/v/redux-capture.svg?style=flat-square)](https://www.npmjs.com/package/redux-capture)
[![License](http://img.shields.io/badge/license-MIT-lightgrey.svg?style=flat-square)](http://mit-license.org)

## Installation

```sh
npm install redux-capture
```

## Motivation

Suppose we have an async [thunk action](https://github.com/reduxjs/redux-thunk) that fetches data and dispatches it as [FSA compliant action](https://github.com/redux-utilities/flux-standard-action):

```js
const WILL_FETCH_DATA = 'WILL_FETCH_DATA'
const DID_FETCH_DATA = 'DID_FETCH_DATA'

function fetchData (path) {
  return async dispatch => {
    // Notify that we are fetching data
    dispatch({ type: WILL_FETCH_DATA })
    try {
      const response = await fetch(new URL(path, 'https://example.com'))
      if (!response.ok) {
        throw new Error(`Failed to fetch with status ${response.status}`)
      }
      // Dispatch the data as action payload.
      dispatch({
        type: DID_FETCH_DATA,
        payload: await response.json()
      })
    } catch (error) {
      // Dispatch an error action if it failed to do so.
      dispatch({
        type: DID_FETCH_DATA,
        payload: error,
        error: true
      })
    }
  }
}
```

And we want `isFetching` state as follows:

```js
import { handleActions } from 'redux-actions'

const defaultState = {
  counter: 0,
  isFetching: false
}

const reducer = handleActions({
  [WILL_FETCH_DATA]: (state, action) => {
    const counter = state.counter + 1
    return {
      ...state,
      counter,
      isFetching: counter > 0
    }
  },

  [DID_FETCH_DATA]: (state, action) => {
    const counter = state.counter - 1
    return {
      ...state,
      counter,
      isFetching: counter > 0
    }
  }
}, defaultState)
```

This will work as it’s supposed to. The `counter` will increment as `fetchData` are dispatched and decrement as they finish, changing `isFetching` to correct values.

In many cases, we want to make other actions that rely on such actions like `fetchData`, so to reuse its state transitions. Redux Capture allows you to capture actions dispatched by thunk actions.

```js
import { capture } from 'redux-capture'

const FETCH_USERS = 'FETCH_USERS'
const FETCH_GUESTS = 'FETCH_GUESTS'

function fetchUsers () {
  return async dispatch => {
    try {
      // This will be payload of the last action dispatched by fetchData, or
      // throw error if it’s an error action.
      const data = await capture(fetchData('/users'), dispatch)
      dispatch({
        type: FETCH_USERS,
        payload: data.filter(user => !user.isDeleted)
      })
    } catch (error) {
      dispatch({
        type: FETCH_USERS,
        payload: error,
        error: true
      })
    }
  }
}

function fetchGuests () {
  return async dispatch => {
    try {
      // Same discussion above. This capture returns users.
      const users = await capture(fetchUsers(), dispatch)
      dispatch({
        type: FETCH_GUESTS,
        payload: users.filter(user => user.isGuest)
      })
    } catch (error) {
      dispatch({
        type: FETCH_GUESTS,
        payload: error,
        error: true
      })
    }
  }
}
```

Or capture the last action itself or all the actions when FSA is not your preference.

```js
import { captureLastAction, captureActions } from 'redux-capture'

const lastAction = await captureLastAction(fetchUsers(), dispatch)
// { type: FETCH_USERS, ... }

const actions = await captureActions(fetchUsers(), dispatch)
// [
//   { type: WILL_FETCH_DATA, ... },
//   { type: DID_FETCH_DATA, ... },
//   { type: FETCH_USERS, ... }
// ]
```

## API Reference

### `capture(action, dispatch [, getState])`

- `action` : object | function
- `dispatch` : function
- `getState` : (Optional) function

When `action` is an action object, this returns its `payload`. Throws `payload` if its `error` is true.

When `action` is a sync thunk action, this returns its `payload` of the last action dispatched by it. Throws `payload` if `error` of the last action is true.

When `action` is an async thunk action, this returns Promise that resolves `payload` of the last action, or rejects with `payload` if `error` of the last action is true.

### `captureLastAction(action, dispatch [, getState])`

- `action` : object | function
- `dispatch` : function
- `getState` : (Optional) function

Returns the last action dispatched by `action`, or Promise that resolves it.

### `captureActions(action, dispatch [, getState])`

- `action` : object | function
- `dispatch` : function
- `getState` : (Optional) function

Returns an array of all the actions dispatched by `action`, or Promise that resolves it.

## License

MIT
