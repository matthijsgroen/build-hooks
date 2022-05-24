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

const combineReducers = (reducers) => (state, action) =>
  Object.entries(reducers).reduce((state, [key, reducer]) => {
    const subState = state[key];
    const updatedState = reducer(subState, action);
    return subState !== updatedState
      ? { ...state, [key]: updatedState }
      : state;
  }, state || {});

const UPDATE_FIRSTNAME = "updateFirstname";
const personReducer = (state, action) => {
  if (action.type === "__INIT") {
    return { firstName: "Matthijs", lastName: "Groen" };
  }
  if (action.type === UPDATE_FIRSTNAME) {
    return { ...state, firstName: action.payload };
  }
  return state;
};

const UPDATE_PROFESSION = "updateProfession";
const professionReducer = (state, action) => {
  if (action.type === "__INIT") {
    return { profession: "Data Entry Specialist", years: 11 };
  }
  if (action.type === UPDATE_PROFESSION) {
    return { ...state, profession: action.payload };
  }
  return state;
};

const store = createStore(personReducer);

const unsubscribe = store.subscribe(() => {
  console.log(store.getState());
});

console.log(store.getState());

store.dispatch({ type: UPDATE_FIRSTNAME, payload: "Hiddo" });
