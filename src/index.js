// The MIT License
// Copyright (C) 2017-Present Shota Matsuda

function isThennable (value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.then === 'function'
  )
}

function collectActions (action, dispatch, getState, actions) {
  if (typeof action === 'function') {
    const retval = action(action => {
      return collectActions(action, dispatch, getState, actions)
    }, getState)
    if (isThennable(retval)) {
      return retval.then(() => actions)
    }
    return actions
  }
  dispatch(action)
  actions.push(action)
  return actions
}

export function captureActions (action, dispatch, getState) {
  return collectActions(action, dispatch, getState, [])
}

export function captureLastAction (action, dispatch, getState) {
  const actions = captureActions(action, dispatch, getState)
  if (isThennable(actions)) {
    return actions.then(actions => actions[actions.length - 1])
  }
  return actions[actions.length - 1]
}

function handleAction (action) {
  if (action.error) {
    throw action.payload
  }
  return action.payload
}

export function capture (action, dispatch, getState) {
  const lastAction = captureLastAction(action, dispatch, getState)
  if (isThennable(lastAction)) {
    return lastAction.then(handleAction)
  }
  return handleAction(lastAction)
}

export default capture
