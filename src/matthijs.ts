type Producer = () => void;

type Renderer = {
  render: (contents: Producer) => void;
};

export const createRoot = (root: HTMLElement): Renderer => {
  const render = () => {};

  return {
    render,
  };
};

/**
 * `m` is our Pragma function. All JSX code will automatically trigger this function.
 * See the `tsconfig.json` for the JSX config
 */
export const m = (
  tagOrComponent: string,
  attributes: Record<string, any>,
  ...children: unknown[]
): void => {
  console.log(tagOrComponent, attributes, children);
};
