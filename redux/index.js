const { createStore, combineReducers } = require("./redux-lite.js");

const UPDATE_FIRST_NAME = "updateFirstName";
const personReducer = (
  state = { firstName: "Matthijs", lastName: "Groen" },
  action
) => {
  if (action.type === UPDATE_FIRST_NAME) {
    return { ...state, firstName: action.payload };
  }
  return state;
};

const UPDATE_PROFESSION = "updateProfession";
const professionReducer = (
  state = {
    profession: "Data Entry Specialist",
    years: 11,
  },
  action
) => {
  if (action.type === UPDATE_PROFESSION) {
    return { ...state, profession: action.payload };
  }
  return state;
};

const store = createStore(
  combineReducers({
    person: personReducer,
    profession: professionReducer,
  })
);

const unsubscribe = store.subscribe(() => {
  console.log(store.getState());
});

console.log(store.getState());

store.dispatch({ type: UPDATE_FIRST_NAME, payload: "Hiddo" });

unsubscribe();

store.dispatch({ type: UPDATE_PROFESSION, payload: "Front-end Developer" });

console.log(store.getState());
