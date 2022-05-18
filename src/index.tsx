import { Component, createRoot, m, useEvent, useState } from "matthijs";

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

type TodoItem = {
  task: string;
  done: boolean;
};

const TodoList: Component = () => {
  const [todoItems, setTodoItems] = useState<TodoItem[]>([
    { task: "task 1", done: false },
  ]);

  return (
    <section>
      <h1>todos</h1>
      <ul>
        {todoItems.map((item, index) => (
          <li class={item.done && "completed"}>
            <label>{item.task}</label>
          </li>
        ))}
      </ul>
    </section>
  );
};

export const App: Component = () => {
  const [counter, setCounter] = useState(0);

  const clickHandler = useEvent(() => {
    setCounter((c) => c + 1);
  });

  return (
    <div class={counter > 10 && counter < 13 ? "high" : undefined}>
      <MyText>
        Hello <strong>world!</strong> {counter}
      </MyText>
      <MyButton onClick={clickHandler} label={"Click me!"} />
      <TodoList />
    </div>
  );
};

root.render(<App />);
