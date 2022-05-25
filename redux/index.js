const { createStore } = require("./redux.js");

const reducer = (
  state = {
    firstName: "Matthijs",
    lastName: "Groen",
  },
  action
) => {
  return state;
};

const store = createStore(reducer);

console.log(store.getState());
