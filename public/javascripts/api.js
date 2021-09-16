export class Api {
  constructor() {
    this.todosUrl = "/api/todos";
  }
  
  getAllTodos() {
    return fetch(this.todosUrl)
      .then(response => response.json())
      .catch(err => alert(err));
  }
  
  getTodo(id) {
    return fetch(this.todosUrl + '/' + id)
      .then(response => response.json())
      .catch(err => alert(err));
  }
  
  addTodo(todoData) {
    return fetch(this.todosUrl, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    })
      .then(response => console.log(response.json()))
      .catch(err => alert(err));
  }
  
  updateTodo(todoData) {
    return fetch(this.todosUrl + '/' + todoData.id, {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    })
      .then(response => response.json())
      .catch(err => alert(`${this.errorMessage}\n${String(err)}`));
  }
  
  deleteTodo(todoId) {
    fetch(`${this.todosUrl}/${todoId}`, {
      method: 'DELETE',
    });
  }
}