type VAttributes = Record<string, unknown>;
type VEvents = Record<string, EventListener>;
type VChild = VNode | string | number;
type VNode = {
  tag: string;
  attributes: VAttributes;
  events: VEvents;
  children: VChild[];
};

type Producer = () => VNode;

type Renderer = {
  render: (contents: Producer) => void;
};

const element = (
  tag: string,
  attributes: VAttributes,
  children: VChild[]
): VNode => {
  const events: VEvents = {};
  const attrs: VAttributes = {};

  for (const [key, value] of Object.entries(attributes)) {
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
    if (value !== undefined) {
      attrs[key] = `${value}`;
    }
  }
  return {
    tag,
    attributes: attrs,
    events,
    children,
  };
};

/**
 * Update an HTML element with children and attributes
 */
const updateElement = (
  element: HTMLElement,
  node: VNode,
  previousNode: VNode | undefined
) => {
  const removeAttributes = previousNode
    ? Object.keys(previousNode.attributes)
    : [];
  const addAttributes = Object.keys(node.attributes);

  for (const key of addAttributes) {
    element.setAttribute(key, `${node.attributes[key]}`);
  }
  for (const key of removeAttributes) {
    if (addAttributes.includes(key)) continue;
    element.removeAttribute(key);
  }

  const addEvents = Object.keys(node.events);
  const removeEvents = previousNode ? Object.keys(previousNode.events) : [];
  for (const eventName of addEvents) {
    const listener = node.events[eventName];
    if (previousNode) {
      const prevListener = previousNode.events[eventName];
      if (prevListener !== listener) {
        element.removeEventListener(eventName, prevListener);
        element.addEventListener(eventName, listener);
      }
    } else {
      element.addEventListener(eventName, listener);
    }
  }
  for (const eventName of removeEvents) {
    if (addEvents.includes(eventName)) continue;
    element.removeEventListener(eventName, previousNode.events[eventName]);
  }

  let offSet = 0;
  for (const childIndex in node.children) {
    const index = Number(childIndex);
    const child = node.children[index];
    const prevChild = previousNode ? previousNode.children[index] : undefined;
    let domNode = Array.from(element.childNodes)[index + offSet];
    if (
      domNode &&
      domNode.nodeType === Node.TEXT_NODE &&
      index === 0 &&
      domNode.textContent.trim() === ""
    ) {
      offSet += 1;
      domNode = Array.from(element.childNodes)[index + offSet];
    }

    if (typeof child === "object" && "tag" in child) {
      let newNode: ChildNode;

      if (
        !domNode ||
        (domNode.nodeType === Node.ELEMENT_NODE &&
          domNode.nodeName !== child.tag.toUpperCase())
      ) {
        newNode = document.createElement(child.tag);
      } else {
        newNode = domNode;
      }

      updateElement(
        newNode as HTMLElement,
        child,
        typeof prevChild !== "object" ? undefined : prevChild
      );
      if (domNode !== newNode) {
        if (!domNode) {
          element.appendChild(newNode);
        } else {
          element.replaceChild(newNode, domNode);
        }
      }
    } else {
      const newText = `${child}`;
      if (domNode && domNode.nodeType === Node.TEXT_NODE) {
        if (domNode.textContent !== newText) {
          domNode.textContent = `${child}`;
        }
      } else {
        const textNode = document.createTextNode(newText);
        element.appendChild(textNode);
      }
    }
  }
};

export const createRoot = (root: HTMLElement): Renderer => {
  let previousRenderTree: VNode;
  let renderJsx: Producer;

  Array.from(root.children).forEach((c) => root.removeChild(c));
  const render = (contents: Producer) => {
    callIndex = 0;
    renderJsx = contents;

    const result = contents();

    //renderElement(contents);
    // Update our 'global' initial render, so that the refs are kept.
    initialRender = false;

    // Clear the contents of our root element. (No DOM Diffing)
    updateElement(
      root,
      {
        tag: "root",
        attributes: {},
        events: {},
        children: [result],
      },
      {
        tag: "root",
        attributes: {},
        events: {},
        children: [previousRenderTree],
      }
    );
    previousRenderTree = result;
  };

  // Place a 'global' function (used by setState)
  // to trigger a rerender

  let timeout: ReturnType<typeof setTimeout>;
  rerender = () => {
    // Use clear timeout to trigger a single render if multiple 'rerenders' where triggered within 5ms
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      render(renderJsx);
    }, 0);
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
    .map<VChild>((c) => (typeof c === "function" ? c() : `${c}`));

/**
 * `m` is our Pragma function. All JSX code will automatically trigger this function.
 * See the `tsconfig.json` for the JSX config
 */
export const m = (
  elem: string | Component,
  attributes: Record<string, any>,
  ...children: JSXChildNodes[]
): Producer => {
  // "Built-in" components, "div", "p"
  if (typeof elem === "string") {
    return () => element(elem, attributes, processChildNodes(children));
  }
  // User created functional components
  return (): VNode => elem({ ...attributes, children })();
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

export const useCallback = <T>(callback: T, deps: unknown[]): T => {
  const callbackRef = useRef(callback);
  const depsRef = useRef(deps);
  if (
    depsRef.current.length !== deps.length ||
    depsRef.current.some((e, i) => e !== deps[i])
  ) {
    callbackRef.current = callback;
    depsRef.current = deps;
  }
  return callbackRef.current;
};
