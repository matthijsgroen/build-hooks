const createStore = (reducer, initialState) => {
  let state = reducer(initialState, { type: "__INIT" });
  let subscribers = [];

  return {
    subscribe: (f) => {
      subscribers = subscribers.concat(f);
      return () => {
        subscribers = subscribers.filter((subscriber) => subscriber !== f);
      };
    },
    getState: () => state,
    dispatch: (action) => {
      const newState = reducer(state, action);
      if (state !== newState) {
        state = newState;
        subscribers.forEach((f) => f());
      }
    },
  };
};

const reducer = (state, action) => {
  if (action.type === "__INIT") {
    return { firstName: "Matthijs", lastName: "Groen" };
  }
};

const store = createStore(reducer);

console.log(store.getState());
