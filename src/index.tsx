import { Component, createRoot, m } from "matthijs";

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
  const clickHandler = () => {
    console.log("Click!");
  };

  return (
    <div>
      <MyText>
        Hello <strong>world!</strong>
      </MyText>
      <MyButton onClick={clickHandler} label={"Click me!"} />
    </div>
  );
};

root.render(<App />);
