type Renderer = {
  render: (contents: RenderNode) => void;
};

export type RenderNode = (() => RenderResult[]) | string;
export type RenderResult = HTMLElement | string;

const renderElement = (elem: RenderNode | RenderNode[]): RenderResult[] =>
  ([] as RenderNode[])
    .concat(elem)
    .reduce<RenderResult[]>(
      (r, e) => r.concat(typeof e === "function" ? e() : `${e}`),
      []
    );

/**
 * Update an HTML element with children and attributes
 */
const updateElement = (
  element: HTMLElement,
  attributes: Record<string, string>,
  children: RenderResult[]
) => {
  for (const [key, value] of Object.entries(attributes)) {
    if (key.startsWith("__")) {
      // hide internals
      continue;
    }
    if (typeof value === "function") {
      if (key.startsWith("on")) {
        const eventName = key.slice(2).toLowerCase();
        element.addEventListener(eventName, value);
      }
      continue;
    }
    element.setAttribute(key, value);
  }
  for (const child of children) {
    if (typeof child === "string") {
      const textNode = document.createTextNode(child);
      element.appendChild(textNode);
    } else {
      element.appendChild(child);
    }
  }
};

export const createRoot = (root: HTMLElement): Renderer => {
  let cacheContents: RenderNode;

  const render = (contents: RenderNode) => {
    cacheContents = contents;
    callIndex = 0;

    const result = renderElement(contents);
    // Update our 'global' initial render, so that the refs are kept.
    initialRender = false;

    // Clear the contents of our root element. (No DOM Diffing)
    Array.from(root.children).forEach((c) => root.removeChild(c));
    updateElement(root, {}, result);
  };

  // Place a 'global' function (used by setState)
  // to trigger a rerender

  let timeout: ReturnType<typeof setTimeout>;
  rerender = () => {
    // Use clear timeout to trigger a single render if multiple 'rerenders' where triggered within 5ms
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      render(cacheContents);
    }, 5);
  };

  return {
    render,
  };
};

/**
 * `m` is our Pragma function. All JSX code will automatically trigger this function.
 * See the `tsconfig.json` for the JSX config
 */
export const m = (
  elem: string | Component,
  attributes: Record<string, any>,
  ...children: RenderNode[]
): RenderNode => {
  // "Built-in" components, "div", "p"
  if (typeof elem === "string") {
    return (): [HTMLElement] => {
      const element = document.createElement(elem);
      updateElement(
        element,
        attributes,
        children.reduce((r, child) => r.concat(renderElement(child)), [])
      );
      return [element];
    };
  }
  // User created functional components
  return (): RenderResult[] => {
    const compResult = elem({ ...attributes, children });
    return renderElement(compResult);
  };
};

export type Component<Props extends {} = {}> = (
  p: Props & { children?: RenderNode[] }
) => RenderNode;

/**
 * This is where the hooks live.
 *
 * We keep a list of references as one big array.
 * every time a Ref is used, the pointer moves one place up.
 */

let callIndex = 0;
let refs = [];
let rerender: () => void;
let initialRender = true;

/**
 * useRef is our main hook. It gives a reference we can re-use in subsequent renders.
 */
export const useRef = <T>(initialValue: T): { current: T } => {
  callIndex++;
  if (initialRender === true) {
    // Set the value only on the initial render call
    refs[callIndex] = { current: initialValue };
  }
  return refs[callIndex];
};

type SetState<T> = (t: T | ((previous: T) => T)) => void;

/**
 * useState uses 'useRef' to keep track of its value and setter
 * when a new value is set, a 'rerender' call is triggered
 */
export const useState = <T>(
  initialState: T
): [value: T, setValue: SetState<T>] => {
  const getter = useRef(initialState);
  const setter = useRef<SetState<T>>((newValue: T | ((previous: T) => T)) => {
    if (typeof newValue === "function") {
      getter.current = (newValue as (p: T) => T)(getter.current);
    } else {
      getter.current = newValue;
    }
    rerender();
  });

  return [getter.current, setter.current];
};
