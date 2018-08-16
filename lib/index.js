'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// The MIT License
// Copyright (C) 2017-Present Shota Matsuda

function isThennable(value) {
  return value !== null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && typeof value.then === 'function';
}

function collectActions(action, dispatch, getState, actions) {
  if (typeof action === 'function') {
    var retval = action(function (action) {
      return collectActions(action, dispatch, getState, actions);
    }, getState);
    if (isThennable(retval)) {
      return retval.then(function () {
        return actions;
      });
    }
    return actions;
  }
  dispatch(action);
  actions.push(action);
  return actions;
}

function captureActions(action, dispatch, getState) {
  return collectActions(action, dispatch, getState, []);
}

function captureLastAction(action, dispatch, getState) {
  var actions = captureActions(action, dispatch, getState);
  if (isThennable(actions)) {
    return actions.then(function (actions) {
      return actions[actions.length - 1];
    });
  }
  return actions[actions.length - 1];
}

function handleAction(action) {
  if (action.error) {
    throw action.payload;
  }
  return action.payload;
}

function capture(action, dispatch, getState) {
  var lastAction = captureLastAction(action, dispatch, getState);
  if (isThennable(lastAction)) {
    return lastAction.then(handleAction);
  }
  return handleAction(lastAction);
}

exports.captureActions = captureActions;
exports.captureLastAction = captureLastAction;
exports.capture = capture;
exports.default = capture;
