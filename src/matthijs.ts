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

const patchAttributes = (
  element: HTMLElement,
  node: VElement,
  previousNode: VElement | undefined
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
};

const patchEventListeners = (
  element: HTMLElement,
  node: VElement,
  previousNode: VElement | undefined
) => {
  const removeEvents = previousNode ? Object.keys(previousNode.events) : [];
  const addEvents = Object.keys(node.events);

  for (const eventName of addEvents) {
    const listener = node.events[eventName];
    if (previousNode) {
      const prevListener = previousNode.events[eventName];

      if (prevListener !== listener) {
        // Replace listener
        element.removeEventListener(eventName, prevListener);
        element.addEventListener(eventName, listener);
      } // else: keep our current listener

      continue;
    }

    element.addEventListener(eventName, listener);
  }
  for (const eventName of removeEvents) {
    if (addEvents.includes(eventName)) continue;
    element.removeEventListener(eventName, previousNode.events[eventName]);
  }
};

/**
 * Update an HTML element with children and attributes
 */
const patch = (
  element: HTMLElement,
  node: VElement,
  previousNode: VElement | undefined
) => {
  patchAttributes(element, node, previousNode);
  patchEventListeners(element, node, previousNode);

  const nodeChildren = node.children;
  const prevNodeChildren = previousNode ? previousNode.children : [];
  const domChildren = Array.from(element.childNodes);

  for (const childIndex in node.children) {
    const index = Number(childIndex);

    const child = nodeChildren[index];
    const prevChild = prevNodeChildren[index];

    let prevDomNode = domChildren[index];

    if (typeof child === "string") {
      if (prevDomNode && prevDomNode.nodeType === Node.TEXT_NODE) {
        if (prevDomNode.textContent !== child) {
          prevDomNode.textContent = child;
        }
      } else {
        const textNode = document.createTextNode(child);
        element.appendChild(textNode);
      }
    } else {
      let newNode: ChildNode;

      if (
        !prevDomNode ||
        (prevDomNode.nodeType === Node.ELEMENT_NODE &&
          prevDomNode.nodeName !== child.tag.toUpperCase())
      ) {
        newNode = document.createElement(child.tag);
      } else {
        newNode = prevDomNode;
      }

      patch(
        newNode as HTMLElement,
        child,
        typeof prevChild !== "object" ? undefined : prevChild
      );
      if (prevDomNode !== newNode) {
        if (!prevDomNode) {
          element.appendChild(newNode);
        } else {
          element.replaceChild(newNode, prevDomNode);
        }
      }
    }
  }
};

export const createRoot = (root: HTMLElement): Renderer => {
  let previousRenderTree: VElement;
  let renderJsx: Producer;

  Array.from(root.childNodes).forEach((c) => root.removeChild(c));
  const render = (contents: Producer) => {
    callIndex = 0;
    renderJsx = contents;

    const result = contents();

    // Update our 'global' initial render, so that the refs are kept.
    initialRender = false;

    // reconciliation
    patch(
      root,
      element("root", {}, [result]),
      element("root", {}, [previousRenderTree])
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

type AnyFunction = (...args: any[]) => any;

export const useCallback = <TCallback extends AnyFunction>(
  callback: TCallback,
  deps: unknown[]
): TCallback => {
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
