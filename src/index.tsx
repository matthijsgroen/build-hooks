import { Component, createRoot, m } from "matthijs";

const root = createRoot(document.getElementById("root"));

const MyText: Component = ({ children }) => <p class="Foo">{children}</p>;

export const App: Component = () => {
  return (
    <div>
      <MyText>
        Hello <strong>world!</strong>
      </MyText>
    </div>
  );
};

root.render(<App />);
