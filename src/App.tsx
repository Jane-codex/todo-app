import _React from "react";
import { Toaster } from "react-hot-toast";
import TodoList from "./components/TodoList";
import "./CSS/App.css";

function App() {
  return (
    <div className="App">
    <header className="header">
        <h1>My Todo App</h1>
      </header>
      <TodoList />

      {/* Toast notification container */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#333",
            color: "#fff",
            borderRadius: "10px",
            padding: "10px 16px",
          },
        }}
      />
    </div>
  );
}

export default App;






























/* import { FaPen, FaClipboardList } from "react-icons/fa";
import TodoList from "./components/TodoList";
import "./CSS/App.css";

  function App() {

    return (
      < div className="App">
        <div className="header">
          <div className="logoside">
        <FaPen />
        <h1>My Todo App</h1>
        <FaClipboardList />
          </div>
        </div>
    <TodoList />
      </div>
    );
  };

  export default App */

