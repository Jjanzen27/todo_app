import { Template } from './templates.js';
import { Api } from './api.js';


class TodoApp {
  constructor() {
    this.todoList = new TodoList();
    this.templates = new Template();
    this.api = new Api();
    this.modalLayer = document.getElementById("modal_layer");
    this.home;
    this.activePage;
    this.init();
  }
  
  init() {
    this.getTodosFromServer()
      .then(() => {
        this.renderUI("All");
      });
  }
  
  // CRUD server operations
  
  getTodosFromServer() { //
    return this.api.getAllTodos()
      .then(list => {
        this.todoList.addTodosFromServer(list);
      });
  }
  
  getTodoFromServer(id) {
    return this.api.getTodo(id);
  }
  
  addTodoToServer(todo) {
    return this.api.addTodo(todo)
      .then(() => {
        this.hideModal();
        this.getTodosFromServer()
          .then(() => this.renderUI(this.samePage()));
      });
  }
  
  updateTodoOnServer(todo) {
    return this.api.updateTodo(todo)
      .then(() => this.getTodosFromServer());
  }
  
  deleteTodoFromServer(todo) {
    return this.api.deleteTodo(todo.id);
  }
  
  // Operations for rendering
  renderUI(identifier) {
    let completed = this.checkIfCompletedList();
    
    let list = this.todoList.findList(identifier, completed);
    
    this.renderSidebar();
    this.renderMain(list);
  }
  
  renderSidebar() {
    let container = document.getElementById("sidebar");
    this.empty(container);
    
    container.innerHTML += this.templates.sidebar_menu({collection: this.todoList.formatForTemplate()});
    
    this.home = document.querySelector('dl[data-title="All"]');
    
    if (this.activePage) {
      this.activate(this.activePage);
    } else {
      this.activate(this.home);
    }
    
    this.bindSidebarEvents();
  }
  
  renderMain(list) {
    let container = document.getElementById("items");
    this.empty(container);
    
    container.innerHTML += this.templates.todo_list_main(list);
    
    this.bindMainEvents();
  }
  
  renderModal(data) {
    this.modalLayer.innerHTML = this.templates.modal(data);
    this.bindModalEvents(data);
    this.showModal();
  }
  
  // Operations for event binding
  
  bindSidebarEvents() {
    let sidebarItems = document.getElementsByClassName("sidebar_item");
    
    for (let i = 0; i < sidebarItems.length; i += 1)  {
      sidebarItems[i].addEventListener("click", (e) => {
        this.handleNavigation(e);
      });
    }
  }
  
  bindMainEvents() {
    this.bindAddNewEvent();
    this.bindDeleteEvents();
    this.bindCompleteEvents();
    this.bindEditEvents();
    this.bindSidebarToggle();
  }
  
  bindAddNewEvent() {
    let newTodoButton = document.getElementById("new_item");
    newTodoButton.addEventListener("click", () => this.renderModal());
  }
  
  bindDeleteEvents() {
    let deleteButtons = document.getElementsByClassName("delete");
    for (let i = 0; i < deleteButtons.length; i += 1) {
      deleteButtons[i].addEventListener("click", (e) => {
        this.handleDeleteEvent(e);
      });
    }
  }
  
  bindCompleteEvents() {
    let todoList = document.getElementsByClassName("list_item");
    for (let i = 0; i < todoList.length; i += 1) {
      todoList[i].addEventListener("click", (e) => {
        this.handleCompleteEvent(e);
      });
    }
  }
  
  bindEditEvents() {
    let todoItems = document.getElementsByClassName("edit_btn");
    for (let i = 0; i < todoItems.length; i += 1) {
      todoItems[i].addEventListener("click", (e) => {
        this.handleEditEvent(e);
      });
    }
  }
  
  bindSidebarToggle() {
    let sidebar_toggle = document.getElementById("sidebar_toggle");
    sidebar_toggle.addEventListener("click", () => {
      this.handleSidebarToggle();
    });
  }
  
  bindModalEvents(data) {
    this.selectModalElements();
    this.modalLayer.addEventListener("click", (e) => this.handleHideModal(e));
    if (data) {
      this.bindEditModalEvents();
    } else {
      this.bindNewModalEvents();
    }
  }
  
  bindEditModalEvents() {
    this.form.addEventListener("submit", (e) => this.handleSubmitUpdatedTodo(e));
    this.completeButton.addEventListener("click", (e) => this.handleCompleteTodo(e));
  }
  
  bindNewModalEvents() {
    this.form.addEventListener("submit", (e) => this.handleSubmitNewTodo(e));
    this.completeButton.addEventListener("click", (e) => this.handleRejectComplete(e));
  }
  
  // Operations for event handling
  
  handleSidebarToggle() {
    let sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("show");
  }
  
  handleNavigation(e) {
    let active = e.currentTarget;
    this.activate(active);
    
    let section = active.closest("section");
    let completed;
    
    let identifier = active.getAttribute("data-title");
    if (section.classList.contains("completed")) {
      completed = true;
    }
    
    let list = this.todoList.findList(identifier, completed);
    
    this.renderMain(list);
  }
  
  handleSubmitNewTodo(e) {
    e.preventDefault();
    let todoData = new FormData(this.form);
    let newTodo = this.todoList.addTodoFromForm(todoData);
    if (newTodo) { 
      this.addTodoToServer(newTodo);
      this.hideModal();
      this.renderUI("All");
    }
  }
  
  handleSubmitUpdatedTodo(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    
    let todoData = new FormData(this.form);
    let updatedTodo = this.todoList.validateTodo(this.currentTodo.id, todoData);
    if (updatedTodo) { 
      this.updateTodoOnServer(updatedTodo);
      this.hideModal();
      this.renderUI(this.samePage());
    }
  }
  
  handleCompleteTodo(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    
    this.currentTodo.completed = true;
    this.todoList.completeLocalTodo(this.currentTodo.id);
    this.updateTodoOnServer(this.currentTodo);
    this.renderUI(this.samePage());
    this.hideModal();
  }
  
  handleRejectComplete(e) {
    e.preventDefault();
    alert("Cannot mark as complete as item has not been created yet!");
  }
  
  handleEditEvent(e) {
    e.preventDefault();
    let todo = e.target.closest('tr');
    this.api.getTodo(todo.id)
      .then(item => {
        this.currentTodo = item;
        this.renderModal(item);
        this.bindEditModalEvents();
      });
  }
  
  handleDeleteEvent(e) {
    let todo = e.target.closest('tr');
    this.api.deleteTodo(todo.id);
    this.todoList.deleteLocalTodo(todo.id);
    this.renderUI(this.samePage());
  }
  
  handleCompleteEvent(e) {
    if (e.target === e.currentTarget) {
      let todo = e.target.closest('tr');
      this.api.getTodo(todo.id)
        .then(task => {
          if (task.completed) {
            task.completed = false;
            this.todoList.uncompleteLocalTodo(task.id);
          } else {
            task.completed = true;
            this.todoList.completeLocalTodo(task.id);
          }
          this.updateTodoOnServer(task);
          this.renderUI(this.samePage(), true);
        });
    }
  }
  
  handleHideModal(e) {
    if (e.target === e.currentTarget) this.hideModal();
  }
  
  // Helper operations
  checkIfCompletedList() {
    if (this.activePage) {
      return this.activePage.closest("section").classList.contains("completed");
    }
  }
  
  samePage() {
    return document.querySelector("#page").getAttribute("data_page");
  }
  
  selectModalElements() {
    this.formModal = document.getElementById("form_modal");
    this.form = document.querySelector("form");
    this.completeButton = document.querySelector(".complete_button");
  }
  
  empty(container) {
    while (container.lastChild) {
      container.lastChild.remove();
    }
  }
  
  activate(active) {
    let currentActive = document.querySelector(".active");
    if (currentActive) {currentActive.classList.remove("active")}
    
    this.activePage = active;
    this.activePage.classList.add("active");
  }
  
  hideModal() {
    this.formModal.classList.replace("show", "hide");
    this.modalLayer.classList.replace("show", "hide");
  }
  
  showModal() {
    this.formModal.classList.replace("hide", "show");
    this.modalLayer.classList.replace("hide", "show");
  }
  
} 

function TodoList() {
  this.allTodos = [];
}

TodoList.prototype.addTodoFromForm = function(formData) {
  let todo = new Todo(formData);
  if (this.hasValidTitle(todo)) {
    this.allTodos.push(todo);
    return todo;
  }
  return undefined;
};

TodoList.prototype.addTodosFromServer = function(todos) {
  this.allTodos = [];
  todos.forEach((todo) => {
    let item = new Todo(todo);
    this.allTodos.push(item);
  });
  return this.allTodos;
};

TodoList.prototype.deleteLocalTodo = function(id) {
  let filteredTodos = this.allTodos.filter((todo) => todo.id != id);
  return this.allTodos = filteredTodos;
};

TodoList.prototype.findTodoById = function(id) {
  return this.allTodos.filter((todo) => todo.id == id)[0];
};

TodoList.prototype.validateTodo = function(id, formData) {
  let todo = this.findTodoById(id);

  let update = new Todo(formData);
  
  if (this.hasValidTitle(update)) {
    update.id = todo.id;
    update.completed = todo.completed;
  
    this.deleteLocalTodo(update.id);
  
    return update;
  }
  return undefined;
};

TodoList.prototype.completeLocalTodo = function(id) {
  let todo = this.findTodoById(id);
  todo.completed = true;
};

TodoList.prototype.uncompleteLocalTodo = function(id) {
  let todo = this.findTodoById(id);
  todo.completed = false;
};

TodoList.prototype.filterByCompleted = function() {
  return this.allTodos.filter((todo) => todo.completed);
};

TodoList.prototype.filterByNotCompleted = function() {
  return this.allTodos.filter((todo) => !todo.completed);
};

TodoList.prototype.getMonthYear = function(todo) {
  if (todo.month && todo.year) {
    return `${todo.month}/${this.formatYear(todo.year)}`;
  } else {
    return "No Due Date";
  }
};

TodoList.prototype.groupByMonthYear = function(todos) {
  let todoList = {};
  
  todos.forEach(todo => {
    let dueDate = this.getMonthYear(todo);
  
    if (todoList.hasOwnProperty(dueDate)) {
      todoList[dueDate].push(todo);
    } else {
      todoList[dueDate] = [todo];
    }
  });
  
  return todoList;
};

TodoList.prototype.templateTodos = function(list) {
  let todos = this.groupByMonthYear(list);
  let template = [];
  
  for (let [key, value] of Object.entries(todos)) {
    let obj = {
      label: key,
      todos: value,
    };
    
    template.push(obj);
  }
  
  return this.sortByDueDate(template);
};

TodoList.prototype.sortByDueDate = function(list) {
  if (list.length >= 1) {
  
    list = list.sort((a, b) => {
      return a.label.split("").reverse().join() > b.label.split("").reverse().join() ? 1 : -1;
    });
    
    if (list[list.length - 1].label === "No Due Date") {
      let todo = list.pop();
      list.unshift(todo);
    }
  }
  
  return list || [];
};

TodoList.prototype.formatForTemplate = function() {
  let all = this.templateTodos(this.allTodos);
  let completed = this.templateTodos(this.filterByCompleted());
  
  return [ { label: "All Todos",
             todos: all,
             length: this.allTodos.length,
           },
           { label: "Completed",
             todos: completed,
             length: this.filterByCompleted().length,
             completed: true,
           },
         ];
};

TodoList.prototype.findList = function(identifier, completed=false) {
  let list;
  
  if (completed) {
    list = this.filterByCompleted();
  } else {
    list = this.allTodos;
  }
  
  if (identifier === "All") {
    return { label: "All Todos", todos: this.allTodos };
  } else if (identifier === "Completed") {
    return { label: "Completed", todos: this.filterByCompleted() };
  } else if (identifier === "No") {
    return { label: "No Due Date", todos: this.groupByMonthYear(list)["No Due Date"] };
  } else {
    return { label: identifier, todos: this.groupByMonthYear(list)[identifier] };
  }
};


TodoList.prototype.formatYear = function(year) {
  return year.slice(2, 4);
};

TodoList.prototype.hasValidTitle = function(todo) {
  return todo.title.trim().length >= 3 ? true : alert("You must enter a title at least 3 characters long.");
};

function Todo(data) {
  let todo;
  if (data instanceof FormData) {
    todo = this.createObjectFrom(data);
  } else {
    todo = data;
  }

  return {
    id: todo.id || null,
    title: todo.title,
    day: todo.day,
    month: todo.month,
    year: todo.year,
    completed: todo.completed,
    description: todo.description,
  };
}

Todo.prototype.createObjectFrom = function(todoData) {
  return Object.fromEntries([...todoData.entries()]);
};

document.addEventListener("DOMContentLoaded", () => {
  new TodoApp();
})