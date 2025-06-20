import React, { useEffect, useState } from "react";
import {
  configureStore,
  createSlice,
  createSelector,
} from "@reduxjs/toolkit";
import { Provider, useDispatch, useSelector } from "react-redux";

// Utility
const capitalize = (s) => s.charAt(0).toUpperCase().concat(s.slice(1));
const filterList = ["all", "completed", "todo"];

const fetchTodos = () =>
  fetch("https://jsonplaceholder.typicode.com/todos")
    .then((data) => data.json())
    .then((todos) => todos.slice(0, 3));

// Redux Slice
const initialState = {
  todos: [],
  filter: "all",
  globalId: 3000,
};

const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    addTodo(state, action) {
      state.todos.push({
        title: action.payload.title,
        id: state.globalId + 1,
        completed: false,
      });
      state.globalId += 1;
    },
    deleteTodo(state, action) {
      state.todos = state.todos.filter((todo) => todo.id !== action.payload.id);
    },
    toggleTodo(state, action) {
      state.todos = state.todos.map((todo) =>
        todo.id === action.payload.id
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    },
    changeFilter(state, action) {
      state.filter = action.payload.filter;
    },
    initializeTodos(state, action) {
      state.todos = action.payload.todos;
    },
  },
});

const {
  addTodo,
  deleteTodo,
  toggleTodo,
  changeFilter,
  initializeTodos,
} = todosSlice.actions;

const store = configureStore({ reducer: todosSlice.reducer });

// Selector with Filtering
const selectTodos = (state) => state.todos;
const selectFilter = (state) => state.filter;

const selectFilteredTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => {
    return todos.filter((todo) => {
      if (filter === "completed") return todo.completed;
      if (filter === "todo") return !todo.completed;
      return true;
    });
  }
);

// Components
function TodoApp() {
  return (
    <Provider store={store}>
      <TodosPage />
    </Provider>
  );
}

function TodosPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    fetchTodos().then((todos) => dispatch(initializeTodos({ todos })));
  }, [dispatch]);

  return (
    <div>
      <TodoForm />
      <TodoFilter />
      <TodoList />
    </div>
  );
}

function TodoForm() {
  const [title, setTitle] = useState("");
  const dispatch = useDispatch();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (title.trim() !== "") {
          dispatch(addTodo({ title }));
          setTitle("");
        }
      }}
    >
      <label htmlFor="todo-title">Title</label>
      <input
        id="todo-title"
        type="text"
        name="todo-title"
        onChange={(e) => setTitle(e.target.value)}
        value={title}
      />
      <button type="submit">Make</button>
    </form>
  );
}

function TodoList() {
  const todos = useSelector(selectFilteredTodos);
  const dispatch = useDispatch();

  const handleToggle = (id) => () => dispatch(toggleTodo({ id }));
  const handleDelete = (id) => (e) => {
    e.stopPropagation();
    dispatch(deleteTodo({ id }));
  };

  return (
    <ul>
      {todos.map(({ title, completed, id }) => (
        <li key={id} onClick={handleToggle(id)}>
          <h5>{title}</h5>
          <div>
            {completed ? "☑️" : "✏️"}
            <button onClick={handleDelete(id)}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function TodoFilter() {
  const filter = useSelector((state) => state.filter);
  const dispatch = useDispatch();

  return (
    <div>
      <label htmlFor="filter">Filter</label>
      <select
        onChange={(e) => dispatch(changeFilter({ filter: e.target.value }))}
        id="filter"
        name="filter"
        value={filter}
      >
        {filterList.map((filterText) => (
          <option key={filterText} value={filterText}>
            {capitalize(filterText)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default TodoApp;
