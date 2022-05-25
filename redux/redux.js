const createStore = (reducer, initialState) => {
  let state = reducer(initialState, { type: "__INIT" });

  return {
    getState: () => state,
  };
};

module.exports = {
  createStore,
};
