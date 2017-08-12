import invariant from 'invariant';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import isPlainObject from 'is-plain-object';
import logger from 'redux-logger';
import { install, loop, combineReducers } from 'redux-loop';

const checkModel = (model) => {
  const _model = { ...model };
  const { name, initialState, reducers, effects } = _model;
  invariant(
    name,
    'app.model: model should have a name',
  );
  invariant(
    !initialState || isPlainObject(initialState),
    'app.model: initialState should be an Object',
  );
  invariant(
    !effects || isPlainObject(effects),
    'app.model: effects should be an Object',
  );
  invariant(
    !reducers || isPlainObject(reducers),
    'app.model: reducers should be an Object',
  );
  return model;
};

const createReducer = (model) => {
  const handlers = {};
  const initialState = model.state;
  // Check whether certain action has side effect, if has
  // then create a loop object.
  const actionTypes = Object.keys(model.reducers);
  for (let i = 0, l = actionTypes.length; i < l; i += 1) {
    const actionType = actionTypes[i];
    const nameSpacedActionType = `${model.name}/${actionType}`;
    if (model.effects[actionType]) {
      handlers[nameSpacedActionType] = (state, action) => loop(
        model.reducers[actionType](state, action),
        model.effects[actionType](state, action),
      );
    } else {
      handlers[nameSpacedActionType] = model.reducers[actionType];
    }
  }

  return (state = initialState, action) => {
    if (Object.prototype.hasOwnProperty.call(handlers, action.type)) {
      return handlers[action.type](state, action);
    } else {
      return state;
    }
  };
};

const isHTMLElement = node => (
  typeof node === 'object' && node !== null && node.nodeType && node.nodeName
);

const render = (container, store, view) => {
  ReactDOM.render((
    <Provider store={store}>
      { view }
    </Provider>
  ), container);
};

const createLucio = (config = {}) => {
  const initialState = config.initialState || {};

  // Handling the reducers and effects here.
  function model(_model) {
    this._models.push(checkModel(_model));
  }

  // Set up the view of the reducer.
  function view(_view) {
    invariant(
      React.isValidElement(_view),
      'app.view: view should be a react component.',
    );
    this._view = _view;
  }

  // Mount the app inside the container.
  function start(container) {
    // container can be either string or domNode.
    if (typeof container === 'string') {
      container = document.querySelector(container);
      invariant(
        container,
        `app.start: could not query selector: ${container}`,
      );
    }
    invariant(
      !container || isHTMLElement(container),
      'app.start: container should be HTMLElement',
    );

    invariant(
      React.isValidElement(this._view),
      'app.view: view should be a react component.',
    );


    // Create reducers according to the model
    const reducers = {};
    for (let i = 0, l = this._models.length; i < l; i += 1) {
      const reducer = createReducer(this._models[i]);
      reducers[this._models[i].name] = reducer;
    }

    const combinedReducer = combineReducers({ ...reducers });

    const enhancer = compose(
      install(),
      applyMiddleware(logger),
    );

    const store = enhancer(createStore)(combinedReducer, initialState);
    render(container, store, this._view);
  }

  return {
    _models: [],
    model,
    view,
    start,
  };
};

export default createLucio;