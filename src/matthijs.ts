type VAttributes = Record<string, unknown>;
type VEvents = Record<string, EventListener>;
type VNode = VElement | string;
type VElement = {
  tag: string;
  attributes: VAttributes;
  events: VEvents;
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
  const events: VEvents = {};
  const attributes: VAttributes = {};

  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith("__")) {
      // hide internals
      continue;
    }
    if (typeof value === "function") {
      if (key.startsWith("on")) {
        const eventName = key.slice(2).toLowerCase();
        events[eventName] = value as EventListener;
      }
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
    events,
    children,
  };
};

const patchAttributes = (element: HTMLElement, node: VElement) => {
  const addAttributes = Object.keys(node.attributes);

  for (const key of addAttributes) {
    element.setAttribute(key, `${node.attributes[key]}`);
  }
};

const patchEventListeners = (element: HTMLElement, node: VElement) => {
  const addEvents = Object.keys(node.events);

  for (const eventName of addEvents) {
    element.addEventListener(eventName, node.events[eventName]);
  }
};

/**
 * Update an HTML element with children and attributes
 */
const patch = (element: HTMLElement, node: VElement) => {
  patchAttributes(element, node);
  patchEventListeners(element, node);

  for (const child of node.children) {
    if (typeof child === "string") {
      const textNode = document.createTextNode(child);
      element.appendChild(textNode);
    } else {
      const newNode = document.createElement(child.tag);

      patch(newNode as HTMLElement, child);
      element.appendChild(newNode);
    }
  }
};

export const createRoot = (root: HTMLElement): Renderer => {
  const render = (contents: Producer) => {
    callIndex = 0;

    const result = contents();

    // reconciliation
    initialRender = false;

    Array.from(root.childNodes).forEach((c) => root.removeChild(c));
    patch(root, element("root", {}, [result]));
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

/**
 * This is where the hooks live.
 *
 * We keep a list of references as one big array.
 * every time a Ref is used, the pointer moves one place up.
 */

let callIndex = 0;
let refs = [];
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
