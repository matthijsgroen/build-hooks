const createStore = (reducer, initialState) => {
  let state = reducer(initialState, { type: "__INIT" });

  return {
    getState: () => state,
    dispatch: (action) => {
      const newState = reducer(state, action);
      if (state !== newState) {
        state = newState;
      }
    },
  };
};

module.exports = {
  createStore,
};
