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
  const [newItem, setNewItem] = useState("");

  const handleInput = useEvent((e: InputEvent) => {
    setNewItem((e.currentTarget as HTMLInputElement).value);
  });

  const handleAdd = useEvent((e: KeyboardEvent) => {
    if (e.key == "Enter") {
      setTodoItems((c) => c.concat({ done: false, task: newItem }));
      setNewItem("");
    }
  });

  const handleTodo = useEvent((e: InputEvent) => {
    const todoItem = Number(
      (e.currentTarget as HTMLInputElement).getAttribute("data-id")
    );
    const checked = (e.currentTarget as HTMLInputElement).checked;

    setTodoItems((items) =>
      items.map((e, i) => (i === todoItem ? { ...e, done: checked } : e))
    );
  });
  const itemsLeft = todoItems.filter((e) => !e.done).length;

  return (
    <section>
      <header>
        <h1>todos</h1>
        <input
          type="text"
          value={newItem}
          onInput={handleInput}
          onKeydown={handleAdd}
          placeholder="What needs to be done?"
        />
      </header>
      <section>
        <ul>
          {todoItems.map((item, index) => (
            <li class={item.done && "completed"}>
              <div>
                <input
                  type="checkbox"
                  checked={item.done}
                  data-id={index}
                  onClick={handleTodo}
                />
                <label>{item.task}</label>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <footer>
        <span>
          {itemsLeft === 1 ? "1 item left" : `${itemsLeft} items left`}
        </span>
      </footer>
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
