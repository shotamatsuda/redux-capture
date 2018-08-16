// The MIT License
// Copyright (C) 2017-Present Shota Matsuda

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import capture, { captureActions } from '../../src/index'

const { expect } = chai
const mockStore = configureStore([thunk])
chai.use(chaiAsPromised)

describe('capture', () => {
  let store = null

  beforeEach(() => {
    store = mockStore({})
  })

  describe('capture()', () => {
    it('returns payload of action', () => {
      const action = {
        type: 'ACTION',
        payload: {}
      }
      expect(capture(action, store.dispatch)).equal(action.payload)
      expect(store.getActions()).members([action])
    })

    it('throws payload if action is error', () => {
      const action = {
        type: 'ACTION',
        payload: new Error(),
        error: true
      }
      expect(() => {
        capture(action, store.dispatch)
      }).throws(action.payload)
      expect(store.getActions()).members([action])
    })

    it('returns payload of thunk action', () => {
      const action = {
        type: 'ACTION',
        payload: {}
      }
      const thunkAction = dispatch => {
        dispatch(action)
      }
      expect(capture(thunkAction, store.dispatch)).equal(action.payload)
      expect(store.getActions()).members([action])
    })

    it('throws payload if thunk action is error', () => {
      const action = {
        type: 'ACTION',
        payload: new Error(),
        error: true
      }
      const thunkAction = dispatch => {
        dispatch(action)
      }
      expect(() => {
        capture(thunkAction, store.dispatch)
      }).throws(action.payload)
      expect(store.getActions()).members([action])
    })

    it('returns payload of nested thunk action', () => {
      const action = {
        type: 'ACTION',
        payload: {}
      }
      const thunkAction = dispatch => {
        dispatch(dispatch => {
          dispatch(dispatch => {
            dispatch(action)
          })
        })
      }
      expect(capture(thunkAction, store.dispatch)).equal(action.payload)
      expect(store.getActions()).members([action])
    })

    it('returns payload of the last thunk action', () => {
      const action1 = {
        type: 'ACTION_1',
        payload: {}
      }
      const action2 = {
        type: 'ACTION_2',
        payload: {}
      }
      const action3 = {
        type: 'ACTION_3',
        payload: {}
      }
      const thunkAction = dispatch => {
        dispatch(dispatch => dispatch(action1))
        dispatch(dispatch => dispatch(action2))
        dispatch(dispatch => dispatch(action3))
      }
      expect(capture(thunkAction, store.dispatch)).equal(action3.payload)
      expect(store.getActions()).ordered.members([action1, action2, action3])
    })

    it('returns payload of async thunk action', async () => {
      const action = {
        type: 'ACTION',
        payload: {}
      }
      const thunkAction = async dispatch => {
        dispatch(action)
      }
      await expect(capture(thunkAction, store.dispatch))
        .fulfilled.then(result => {
          expect(result).equal(action.payload)
        })
      expect(store.getActions()).members([action])
    })

    it('throws payload if async thunk action is error', async () => {
      const action = {
        type: 'ACTION',
        payload: new Error(),
        error: true
      }
      const thunkAction = async dispatch => {
        dispatch(action)
      }
      await expect(capture(thunkAction, store.dispatch))
        .rejected.then(error => {
          expect(error).equal(action.payload)
        })
      expect(store.getActions()).members([action])
    })

    it('handles nested async thunk action', async () => {
      const action = {
        type: 'ACTION',
        payload: {}
      }
      const thunkAction = async dispatch => {
        dispatch(async dispatch => {
          dispatch(async dispatch => {
            dispatch(action)
          })
        })
      }
      await expect(capture(thunkAction, store.dispatch))
        .fulfilled.then(result => {
          expect(result).equal(action.payload)
        })
      expect(store.getActions()).members([action])
    })

    it('returns payload of the last async thunk action', async () => {
      const action1 = {
        type: 'ACTION_1',
        payload: {}
      }
      const action2 = {
        type: 'ACTION_2',
        payload: {}
      }
      const action3 = {
        type: 'ACTION_3',
        payload: {}
      }
      const thunkAction = async dispatch => {
        await dispatch(async dispatch => dispatch(action1))
        await dispatch(async dispatch => dispatch(action2))
        await dispatch(async dispatch => dispatch(action3))
      }
      await expect(capture(thunkAction, store.dispatch))
        .fulfilled.then(result => {
          expect(result).equal(action3.payload)
        })
      expect(store.getActions()).ordered.members([action1, action2, action3])
    })

    it('returns payload of the last async thunk action in order', async () => {
      const action1 = {
        type: 'ACTION_1',
        payload: {}
      }
      const action2 = {
        type: 'ACTION_2',
        payload: new Error(),
        error: true
      }
      const action3 = {
        type: 'ACTION_3',
        payload: {}
      }
      const promise1 = new Promise((resolve, reject) => setTimeout(resolve, 1))
      const promise2 = promise1.then(() => {
        return new Promise((resolve, reject) => setTimeout(resolve, 1))
      })
      const promise3 = promise2.then(() => {
        return new Promise((resolve, reject) => setTimeout(resolve, 1))
      })
      const thunkAction = async dispatch => {
        await Promise.all([
          dispatch(async dispatch => {
            await promise3
            dispatch(action1)
          }),
          dispatch(async dispatch => {
            await promise2
            dispatch(action2)
          }),
          dispatch(async dispatch => {
            await promise1
            dispatch(action3)
          })
        ])
      }
      await expect(capture(thunkAction, store.dispatch))
        .fulfilled.then(result => {
          expect(result).equal(action1.payload)
        })
      expect(store.getActions()).ordered.members([action3, action2, action1])
    })

    it('throws payload if the last async thunk action is error', async () => {
      const action1 = {
        type: 'ACTION_1',
        payload: new Error(),
        error: true
      }
      const action2 = {
        type: 'ACTION_2',
        payload: new Error(),
        error: true
      }
      const action3 = {
        type: 'ACTION_3',
        payload: {}
      }
      const promise1 = new Promise((resolve, reject) => setTimeout(resolve, 1))
      const promise2 = promise1.then(() => {
        return new Promise((resolve, reject) => setTimeout(resolve, 1))
      })
      const promise3 = promise2.then(() => {
        return new Promise((resolve, reject) => setTimeout(resolve, 1))
      })
      const thunkAction = async dispatch => {
        await Promise.all([
          dispatch(async dispatch => {
            await promise3
            dispatch(action1)
          }),
          dispatch(async dispatch => {
            await promise2
            dispatch(action2)
          }),
          dispatch(async dispatch => {
            await promise1
            dispatch(action3)
          })
        ])
      }
      await expect(capture(thunkAction, store.dispatch))
        .rejected.then(result => {
          expect(result).equal(action1.payload)
        })
      expect(store.getActions()).ordered.members([action3, action2, action1])
    })
  })

  describe('captureActions()', () => {
    it('returns action', () => {
      const action = {
        type: 'ACTION',
        payload: {}
      }
      expect(captureActions(action, store.dispatch)).members([action])
      expect(store.getActions()).members([action])
    })

    it('returns action even if it is error', () => {
      const action = {
        type: 'ACTION',
        payload: new Error(),
        error: true
      }
      expect(captureActions(action, store.dispatch)).members([action])
      expect(store.getActions()).members([action])
    })

    it('returns thunk action', () => {
      const action = {
        type: 'ACTION',
        payload: {}
      }
      const thunkAction = dispatch => {
        dispatch(action)
      }
      expect(captureActions(thunkAction, store.dispatch)).members([action])
      expect(store.getActions()).members([action])
    })

    it('returns thunk action even if it is error', () => {
      const action = {
        type: 'ACTION',
        payload: new Error(),
        error: true
      }
      const thunkAction = dispatch => {
        dispatch(action)
      }
      expect(captureActions(thunkAction, store.dispatch)).members([action])
      expect(store.getActions()).members([action])
    })

    it('returns nested thunk action', () => {
      const action = {
        type: 'ACTION',
        payload: {}
      }
      const thunkAction = dispatch => {
        dispatch(dispatch => {
          dispatch(dispatch => {
            dispatch(action)
          })
        })
      }
      expect(captureActions(thunkAction, store.dispatch)).members([action])
      expect(store.getActions()).members([action])
    })

    it('returns thunk actions', () => {
      const action1 = {
        type: 'ACTION_1',
        payload: {}
      }
      const action2 = {
        type: 'ACTION_2',
        payload: {}
      }
      const action3 = {
        type: 'ACTION_3',
        payload: {}
      }
      const thunkAction = dispatch => {
        dispatch(dispatch => dispatch(action1))
        dispatch(dispatch => dispatch(action2))
        dispatch(dispatch => dispatch(action3))
      }
      expect(captureActions(thunkAction, store.dispatch))
        .ordered.members([action1, action2, action3])
      expect(store.getActions()).ordered.members([action1, action2, action3])
    })

    it('returns async thunk action', async () => {
      const action = {
        type: 'ACTION',
        payload: {}
      }
      const thunkAction = async dispatch => {
        dispatch(action)
      }
      await expect(captureActions(thunkAction, store.dispatch))
        .fulfilled.then(result => {
          expect(result).members([action])
        })
      expect(store.getActions()).members([action])
    })

    it('returns async thunk action even if it is error', async () => {
      const action = {
        type: 'ACTION',
        payload: new Error(),
        error: true
      }
      const thunkAction = async dispatch => {
        dispatch(action)
      }
      await expect(captureActions(thunkAction, store.dispatch))
        .fulfilled.then(result => {
          expect(result).members([action])
        })
      expect(store.getActions()).members([action])
    })

    it('handles nested async thunk action', async () => {
      const action = {
        type: 'ACTION',
        payload: {}
      }
      const thunkAction = async dispatch => {
        dispatch(async dispatch => {
          dispatch(async dispatch => {
            dispatch(action)
          })
        })
      }
      await expect(captureActions(thunkAction, store.dispatch))
        .fulfilled.then(result => {
          expect(result).members([action])
        })
      expect(store.getActions()).members([action])
    })

    it('returns async thunk actions', async () => {
      const action1 = {
        type: 'ACTION_1',
        payload: {}
      }
      const action2 = {
        type: 'ACTION_2',
        payload: {}
      }
      const action3 = {
        type: 'ACTION_3',
        payload: {}
      }
      const thunkAction = async dispatch => {
        await dispatch(async dispatch => dispatch(action1))
        await dispatch(async dispatch => dispatch(action2))
        await dispatch(async dispatch => dispatch(action3))
      }
      await expect(captureActions(thunkAction, store.dispatch))
        .fulfilled.then(result => {
          expect(result).ordered.members([action1, action2, action3])
        })
      expect(store.getActions()).ordered.members([action1, action2, action3])
    })

    it('returns async thunk actions in order', async () => {
      const action1 = {
        type: 'ACTION_1',
        payload: {}
      }
      const action2 = {
        type: 'ACTION_2',
        payload: {}
      }
      const action3 = {
        type: 'ACTION_3',
        payload: {}
      }
      const promise1 = new Promise((resolve, reject) => setTimeout(resolve, 1))
      const promise2 = promise1.then(() => {
        return new Promise((resolve, reject) => setTimeout(resolve, 1))
      })
      const promise3 = promise2.then(() => {
        return new Promise((resolve, reject) => setTimeout(resolve, 1))
      })
      const thunkAction = async dispatch => {
        await Promise.all([
          dispatch(async dispatch => {
            await promise3
            dispatch(action1)
          }),
          dispatch(async dispatch => {
            await promise2
            dispatch(action2)
          }),
          dispatch(async dispatch => {
            await promise1
            dispatch(action3)
          })
        ])
      }
      await expect(captureActions(thunkAction, store.dispatch))
        .fulfilled.then(result => {
          expect(result).ordered.members([action3, action2, action1])
        })
      expect(store.getActions()).ordered.members([action3, action2, action1])
    })
  })
})
