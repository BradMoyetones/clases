class TodoApp {
    constructor({ inputId, listId, btnId }) {
        this.input = document.getElementById(inputId)
        this.list = document.getElementById(listId)
        this.btn = document.getElementById(btnId)

        this.todos = JSON.parse(localStorage.getItem("todos")) || []

        this.btn.addEventListener("click", () => this.addTodo())

        this.render()
    }

    save() {
        localStorage.setItem("todos", JSON.stringify(this.todos))
    }

    addTodo() {
        const value = this.input.value.trim()
        if (!value) return

        this.todos.push(value)
        this.save()
        this.input.value = ""

        this.render()
    }

    removeTodo(index) {
        this.todos.splice(index, 1)
        this.save()
        this.render()
    }

    render() {
        this.list.innerHTML = ""

        this.todos.forEach((todo, index) => {
            const li = document.createElement("li")
            li.className = "flex justify-between items-center p-2 bg-gray-100 rounded"

            const text = document.createElement("span")
            text.textContent = todo

            const btn = document.createElement("button")
            btn.textContent = "Eliminar"
            btn.className = "text-red-500"
            btn.addEventListener("click", () => this.removeTodo(index))

            li.appendChild(text)
            li.appendChild(btn)

            this.list.appendChild(li)
        })
    }
}

// Inicializar
// new TodoApp({
//     inputId: "todoInput",
//     listId: "todoList",
//     btnId: "addBtn"
// })
