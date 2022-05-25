const { createStore } = require("./redux.js");

const UPDATE_FIRST_NAME = "updateFirstName";

const reducer = (
  state = {
    firstName: "Matthijs",
    lastName: "Groen",
  },
  action
) => {
  if (action.type === UPDATE_FIRST_NAME) {
    return { ...state, firstName: action.payload };
  }
  return state;
};

const store = createStore(reducer);

console.log(store.getState());

const unsubscribe = store.subscribe(() => {
  console.log(store.getState());
});

console.log(store.getState());

store.dispatch({ type: UPDATE_FIRST_NAME, payload: "Hiddo" });

unsubscribe();
