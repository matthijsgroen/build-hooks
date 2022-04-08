import { Component, createRoot, m, useState } from "matthijs";

const root = createRoot(document.getElementById("root"));

const MyText: Component = ({ children }) => <p class="Foo">{children}</p>;

const MyButton: Component<{ label: string; onClick: () => void }> = ({
  label,
  onClick,
}) => (
  <button onClick={onClick} type="button">
    {label}
  </button>
);

const TodoList: Component = () => {
  const [todoItems, setTodoItems] = useState(["task 1", "task 2"]);

  return (
    <div>
      <h2>Todo list</h2>
      <ul>
        {todoItems.map((item) => (
          <li>{item}</li>
        ))}
      </ul>

      <MyButton
        onClick={() => setTodoItems((c) => c.concat(`Task ${c.length + 1}`))}
        label={"Add todo item"}
      />
    </div>
  );
};

export const App: Component = () => {
  const [counter, setCounter] = useState(0);

  return (
    <div>
      <MyText>
        Hello <strong>world!</strong> {counter}
      </MyText>
      <MyButton onClick={() => setCounter((c) => c + 1)} label={"Click me!"} />
      <TodoList />
    </div>
  );
};

root.render(<App />);
