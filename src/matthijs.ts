type VAttributes = Record<string, unknown>;
type VNode = VElement | string;
type VElement = {
  tag: string;
  attributes: VAttributes;
  children: VNode[];
};

type Producer = () => VElement;

type Renderer = {
  render: (contents: Producer) => void;
};

const element = (
  tag: string,
  props: VAttributes,
  children: VNode[]
): VElement => {
  const attributes: VAttributes = {};

  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith("__")) {
      // hide internals
      continue;
    }
    if (value === true) {
      attributes[key] = key;
    }
    if (value !== undefined && value !== false) {
      attributes[key] = `${value}`;
    }
  }
  return {
    tag,
    attributes,
    children,
  };
};

export const createRoot = (root: HTMLElement): Renderer => {
  const render = (contents: Producer) => {
    const result = contents();

    console.log(result);
  };

  return {
    render,
  };
};

type JSXChildNodes = Producer | string | number | boolean | null;

const processChildNodes = (children: JSXChildNodes[]) =>
  children
    .flat()
    .filter(
      (c): c is Producer | string =>
        typeof c === "string" ||
        typeof c === "function" ||
        typeof c === "number"
    )
    .map<VNode>((c) => (typeof c === "function" ? c() : `${c}`));

/**
 * `m` is our Pragma function. All JSX code will automatically trigger this function.
 * See the `tsconfig.json` for the JSX config
 */
export const m = (
  tagOrComponent: string | Component,
  attributes: Record<string, any>,
  ...children: JSXChildNodes[]
): Producer => {
  // "Built-in" components, "div", "p"
  if (typeof tagOrComponent === "string") {
    return () =>
      element(tagOrComponent, attributes, processChildNodes(children));
  }
  // User created functional components
  return (): VElement => tagOrComponent({ ...attributes, children })();
};

export type Component<Props extends {} = {}> = (
  p: Props & { children?: JSXChildNodes[] }
) => Producer;
