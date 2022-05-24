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

const UPDATE_FIRSTNAME = "updateFirstname";

const reducer = (state, action) => {
  if (action.type === "__INIT") {
    return { firstName: "Matthijs", lastName: "Groen" };
  }
  if (action.type === UPDATE_FIRSTNAME) {
    return { ...state, firstName: action.payload };
  }
};

const store = createStore(reducer);

const unsubscribe = store.subscribe(() => {
  console.log(store.getState());
});

console.log(store.getState());

store.dispatch({ type: UPDATE_FIRSTNAME, payload: "Hiddo" });
