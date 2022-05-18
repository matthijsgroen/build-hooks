---
marp: true
---

# Building React

---

# 1. Setup

> Create project

1. Using Parcel
2. 'Hello world'

---

# 2. Setup JSX

> Typescript configuration

1. Point JSX handling to our own file
2. The 'pragma' function

---

# 3. Creating Render root and VDOM

> What is a virtual DOM, and why have it

1. Hello world using our VDOM (single render)

---

# 4. Event handling

> Adding event handler to button

1. Explain no rerender, because no state change

---

# 5. Hooks

> Setup of hooks

1. Explain magic of 'useRef'
2. Explain limitations of "our" implementation
3. Build useRef
4. Build useState (and trigger rerender)

---

# 6. Dom Diffing / Reconciliation process

1. Explain why (Speed, resets animations / transitions)
2. Explain limitations of "our" implementation
3. Build useCallback / useEvent

---

# 7. Creating our TODO app

1. Input element and its 'DOM' state
   > Why does the clearing not work?
2. Event delegation in React / Synthetic events

---

# 8. Redux, useEffect & useContext
