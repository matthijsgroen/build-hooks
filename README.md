# Learning by Building: React & Redux

This is the code repository for the talk: "Learning by Building: React & Redux"

By creating an own implementation of React and Redux you'll gain insights in the inner workings.

Topics covered:

- Redux
  - state
  - dispatch
  - listeners
  - combineReducers
- React
  - JSX
  - Virtual DOM
  - Reconciliation (Dom Diffing)
  - Hooks (useRef, useState, useCallback, useEvent)
  - Controlled Inputs
  - ~useEffect, useContext~
  - Creating a TodoMVC App

# Concept

This repo works as a slideshow. By using the commands from `git-slide-deck` (see section: "How To Run") the codebase will be checked out in a different state for each slide. So your local codebase is a slide, which you can inspect, run or experiment with, until you go to the next slide.

# How to run

The main branch contains the end result for both:

to run the Redux part:

```sh
node redux/index.js
```

to run the React part:

```sh
yarn start
```

to run the slides:

```
yarn global add git-slide-deck
git slide-deck present
```
