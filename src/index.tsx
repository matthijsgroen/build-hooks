import { Component, createRoot, m, useCallback, useState } from "matthijs";

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

export const App: Component = () => {
  const [counter, setCounter] = useState(0);

  const clickHandler = () => {
    setCounter((c) => c + 1);
  };

  return (
    <div class={counter >= 10 && counter < 13 ? "high" : undefined}>
      <MyText>
        Hello <strong>world!</strong> {counter}
      </MyText>
      <MyButton onClick={clickHandler} label={"Click me!"} />
    </div>
  );
};

root.render(<App />);
