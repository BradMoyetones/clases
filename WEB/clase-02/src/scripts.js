// ==================================================
// CONSTANTS - Centralizacion de todos los selectores
// ==================================================
const SELECTORS = {
    CARD_TEMPLATE: "#card",
    EMPTY_MESSAGE_TEMPLATE: "#empty-message",
    CONTAINER: "#cards",
    FORM: '#form',
    TOOLBAR: "#toolbar",
    INPUT_ID: "#form-input-id",
    MODAL_OVERLAY: "#modalOverlay",
    MODAL_BOX: "#modalBox",
    DATE_DISPLAY: "[data-now]",
    MODAL_TITLE: "[data-title-modal]",
    MODAL_DESCRIPTION: "[data-description-modal]",
    MODAL_BUTTON: "[data-button-modal]",
    TAB_ALL: "[data-tab='all']",
    TAB_OPEN: "[data-tab='open']",
    TAB_CLOSED: "[data-tab='closed']",
    TAB_ARCHIVED: "[data-tab='archived']",
    THEME_TOGGLE: '[data-theme-toggle]'
}

const STORAGE_KEY = "todos"
const THEME_STORAGE_KEY = "app-theme"

const MODAL_STATES = {
    CREATE: {
        title: 'Create Task',
        description: 'Complete input data for todo',
        button: 'Create'
    },
    UPDATE: {
        title: 'Update Task',
        description: 'Complete input data for todo',
        button: 'Save'
    }
}

const FILTER_TYPES = {
    ALL: 'all',
    OPEN: 'open',
    CLOSED: 'closed',
    ARCHIVED: 'archived'
}

const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
}

// ===============================================================
// STATE MANAGEMENT - Gestion centralizada del estado o de la data
// ===============================================================
const TodoState = {
    currentFilter: FILTER_TYPES.ALL,

    // Traer todos los registros
    getAll(){
        try{
            const ordered = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
            if(Array.isArray(ordered)) {
                return ordered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            }
            return []
        }catch(error){
            console.log(error)
            this.save([])
            return [];
        }
    },

    // Para guardar todo el array de registros
    save(todos){
        try{
            localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
        }catch (error){
            console.log(error)
        }
    },

    // Para encontrar los registros por filtro
    getFiltered() {
        const todos = this.getAll();

        switch(this.currentFilter){
            case FILTER_TYPES.ALL:
                return todos.filter(todo => !todo.isArchived);
            
            case FILTER_TYPES.OPEN:
                return todos.filter(todo => !todo.isArchived && !todo.completedAt)
            
            case FILTER_TYPES.CLOSED:
                return todos.filter(todo => !todo.isArchived && todo.completedAt)

            case FILTER_TYPES.ARCHIVED:
                return todos.filter(todo => todo.isArchived)

            default: 
                return todos
        }
    },

    // Encontrar un registro por su id
    findById(id){
        return this.getAll().find(todo => todo.id === id)
    },

    // Crear una registro proporcionando el objeto
    create(todoData) {
        const todos = this.getAll();

        const newTodo = {
            id: crypto.randomUUID(),
            isArchived: false,
            createdAt: new Date().toISOString(),
            completedAt: null,
            ...todoData
        }

        todos.push(newTodo)
        this.save(todos)
        return newTodo
    },

    // Actualizar un registro proporcionando su id y su objeto de datos
    update(id, updates){
        const todos = this.getAll()
        const index = todos.findIndex(todo => todo.id === id)

        if(index === -1) return null;

        todos[index] = { ...todos[index], ...updates}
        this.save(todos)
        return todos[index]
    },

    // Eliminar un registro por su id
    delete(id) {
        const todos = this.getAll().filter(todo => todo.id !== id)
        this.save(todos)
    },

    // Para cambiar el estado del completado
    toggleComplete(id){
        const todo = this.findById(id)
        if(!todo) return null

        return this.update(id, {
            completedAt: todo.completedAt ? null : new Date().toISOString()
        })
    },

    // Para cambiar el estado del archivado
    toggleArchive(id){
        const todo = this.findById(id)
        if(!todo) return null

        return this.update(id, {
            isArchived: !todo.isArchived
        })
    },

    // Obtener stats de los tabs en las vista (all, open .... .. )
    getStats(){
        const todos = this.getAll()

        return {
            all: todos.filter(todo => !todo.isArchived).length,
            open: todos.filter(todo => !todo.completedAt && !todo.isArchived).length,
            closed: todos.filter(todo => !todo.isArchived && todo.completedAt).length,
            archived: todos.filter(todo => todo.isArchived).length
        }
    }
}

// ==========================================================
// DOM UTILITIES - Funciones helper para manipulacion del DOM
// ==========================================================
const DOMUtils = {
    // Obtener elemento o lanzar error si no existe
    getElement(selector){
        const element = document.querySelector(selector)
        if(!element){
            console.error(`Element not found: ${selector}`);
        }

        return element
    },

    // Agregar clases con animación
    addClasses(element, ...classes){
        element?.classList.add(...classes)
    },

    // Remover clases con animación
    removeClasses(element, ...classes){
        element?.classList.remove(...classes)
    },

    // Toggle clases
    toggleClasses(element, ...classes){
        classes.forEach(cls => element?.classList.toggle(cls))
    },

    // Formatear fecha
    formatDate(dateString){
        return new Date(dateString).toLocaleTimeString("es-CO", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        })
    },

    // Formatear fecha actual
    formatNow(){
        return new Date(dateString).toLocaleDateString("en-EU", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            weekday: "long"
        })
    }
}

// ====================================
// MODAL MANAGEMENT - Gestión del modal
// ====================================
const ModalManager = {
    isOpen: false,
    overlay: null,
    modal: null,
    form: null,
    inputId: null,

    init() {
        this.overlay = DOMUtils.getElement(SELECTORS.MODAL_OVERLAY)
        this.modal = DOMUtils.getElement(SELECTORS.MODAL_BOX)
        this.form = DOMUtils.getElement(SELECTORS.FORM)
        this.inputId = DOMUtils.getElement(SELECTORS.INPUT_ID)

        this.inputId?.addEventListener('input', () => this.updateModalContent())
    },

    open(){
        DOMUtils.removeClasses(this.overlay, 'opacity-0', 'pointer-events-none')
        DOMUtils.removeClasses(this.modal, 'opacity-0', 'scale-90')
        DOMUtils.addClasses(this.modal, 'opacity-100', 'scale-100')
        this.isOpen = true
    },

    close(){
        DOMUtils.addClasses(this.modal, 'opacity-90', 'opacity-0')
        DOMUtils.removeClasses(this.modal, 'opacity-100', 'opacity-100')
        DOMUtils.addClasses(this.overlay, 'opacity-0', 'pointer-events-none')
        this.isOpen = false
        this.reset()
    },

    toggle(){
        this.isOpen ? this.close() : this.open()
    },

    reset(){
        this.form?.reset();
        if(this.inputId) this.inputId.value = ''
        this.updateModalContent()
    },

    updateModalContent(){
        const isEditing = this.inputId?.value.trim().length > 0;
        const state = isEditing ? MODAL_STATES.UPDATE : MODAL_STATES.CREATE

        const titleEl = this.modal?.querySelector(SELECTORS.MODAL_TITLE)
        const descEl = this.modal?.querySelector(SELECTORS.MODAL_DESCRIPTION)
        const btnEl = this.modal?.querySelector(SELECTORS.MODAL_BUTTON)

        if(titleEl) titleEl.textContent = state.title
        if(descEl) descEl.textContent = state.description
        if(btnEl) btnEl.textContent = state.button
    },

    fillForm(todo) {
        if(!this.form || !todo) return;

        this.form.elements['id'].value = todo.id
        this.form.elements['title'].value = todo.title
        this.form.elements['description'].value = todo.description
        this.form.elements['isArchived'].checked = Boolean(todo.isArchived)
    }
}

// =========================================
// UI UPDATES - Actualización de la interfaz
// =========================================
const UIManager = {
    container: null,
    cardTemplate: null,
    emptyTemplate: null,
    toolbar: null,

    init(){
        this.container = DOMUtils.getElement(SELECTORS.CONTAINER)
        this.cardTemplate = DOMUtils.getElement(SELECTORS.CARD_TEMPLATE)
        this.emptyTemplate = DOMUtils.getElement(SELECTORS.EMPTY_MESSAGE_TEMPLATE)
        this.toolbar = DOMUtils.getElement(SELECTORS.TOOLBAR)

        // Inicializar fecha
        const dateDisplay = DOMUtils.getElement(SELECTORS.DATE_DISPLAY)
        if(dateDisplay) dateDisplay.textContent = DOMUtils.formatNow()
    },

    updateStats(){
        if(!this.toolbar) return

        const stats = TodoState.getStats()

        const allEl = this.toolbar.querySelector('[data-all-length]')
        const openEl = this.toolbar.querySelector('[data-open-length]')
        const closedEl = this.toolbar.querySelector('[data-closed-length]')
        const archivedEl = this.toolbar.querySelector('[data-archived-length]')

        if(allEl) allEl.textContent = stats.all
        if(openEl) openEl.textContent = stats.open
        if(closedEl) closedEl.textContent = stats.closed
        if(archivedEl) archivedEl.textContent = stats.archived
    },

    showEmptyMessage(){
        if(!this.emptyTemplate || !this.container) return;
    }
}









// DATA
let data = JSON.parse(localStorage.getItem("todos")) || []
const cardTemplate = document.getElementById("card")
const container = document.getElementById("cards")
const emptyMessageTemplate = document.getElementById("empty-message")
const form = document.getElementById("form")
const toolbar = document.getElementById("toolbar")
const inputId = document.getElementById("form-input-id")


// Modal -----------------------------------------------------------
const overlay = document.getElementById("modalOverlay");
const modal = document.getElementById("modalBox");

let isOpen = false

function openModal() { 
    overlay.classList.remove("opacity-0", "pointer-events-none")
    modal.classList.remove("scale-90", "opacity-0")
    modal.classList.add("scale-100", "opacity-100")
    isOpen = true
}

function closeModal() { 
    modal.classList.add("scale-90", "opacity-0")
    modal.classList.remove("scale-100", "opacity-100")
    overlay.classList.add("opacity-0", "pointer-events-none")
    isOpen = false
    formReset()
}

function toggleModal(){
    isOpen ? closeModal() : openModal()
}
// ----------------------------------------------------------------


var observer = new MutationObserver(function(mutations){
    mutations.forEach(function (mutation) {
        console.log(mutation.target.value);

        if(mutation.target.value.trim().length === 0){
            modal.querySelector('[data-title-modal]').textContent = "Create Task"
            modal.querySelector('[data-description-modal]').textContent = "Complete input data for todo"
            modal.querySelector('[data-button-modal]').textContent = "Create"
        }else {
            modal.querySelector('[data-title-modal]').textContent = "Update Task"
            modal.querySelector('[data-description-modal]').textContent = "Complete input data for todo"
            modal.querySelector('[data-button-modal]').textContent = "Save"
        }
    });
})

var config = { attributes: true };

observer.observe(inputId, config)


function formReset(){
    inputId.value = ""
    form.reset()
}

function updateStats(){
    if(!toolbar || !Array.isArray(data)) return

    const allTasks = toolbar.querySelector('[data-all-length]')
    const openTasks = toolbar.querySelector('[data-open-length]')
    const closedTasks = toolbar.querySelector('[data-closed-length]')
    const archivedTasks = toolbar.querySelector('[data-archived-length]')

    allTasks.textContent = data.length
    openTasks.textContent = data.filter(todo => todo.completedAt === null).length
    closedTasks.textContent = data.filter(todo => todo.completedAt).length
    archivedTasks.textContent = data.filter(todo => todo.isArchived).length
}

// Definicion de fecha y dia de la semana al inicio
document.querySelector('[data-now]').textContent = new Date().toLocaleDateString("en-EU", {
    weekday: "long",
    month: "short",
    day: "2-digit",
    year: "numeric"
})

function emptyMessage(){
    const empty = emptyMessageTemplate.content.cloneNode(true)
    container.appendChild(empty)
}

function renderCard(formData, prepend = true) {
    if(!formData) return

    const emptyMessage = document.querySelector('[data-empty-message]')
    if(emptyMessage) emptyMessage.remove()

    const card = cardTemplate.content.cloneNode(true)
    const cardDiv = card.querySelector("[data-id]")

    cardDiv.setAttribute("data-id", formData.id)

    addViewTransitionAttributes(cardDiv, formData.id)
    card.querySelector("[data-title]").textContent = formData.title
    card.querySelector("[data-description]").textContent = formData.description
    card.querySelector("[data-detail]").textContent = new Date(formData.createdAt).toLocaleTimeString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    })

    const editBtn = card.querySelector(".edit")
    const deleteBtn = card.querySelector(".delete")

    editBtn.onclick = () => selectRow(formData.id)
    deleteBtn.onclick = () => destroy(formData.id)

    const toggleButtonArchive = card.querySelector(".toggle-archive")
    const toggleButtonComplete = card.querySelector(".toggle-complete")

    toggleButtonArchive.onclick = () => toggleArchive(formData.id)
    toggleButtonComplete.onclick = () => toggleComplete(formData.id)


    changeClassRow(card, formData)
    
    const transition = document.startViewTransition(() => {
        if(prepend){
            container.insertBefore(card, container.firstChild);
        }else {
            container.appendChild(card)
        }
    })
    transition.finished
}

function addViewTransitionAttributes(el, id){
    el.setAttribute('style', `view-transition-class: dataRow; view-transition-name: dataRow-${id}`)
}

function destroy(id){
    if(!Array.isArray(data)) return

    data = data.filter(todo => todo.id !== id)
    localStorage.setItem("todos", JSON.stringify(data))

    removeRow(id)
    updateStats()

    if(data.length === 0){
        emptyMessage()
    }
}

function removeRow(id){
    const row = container.querySelector(`div[data-id="${id}"]`)

    if(!row) return

    row.classList.add('fade-out')

    const transition = document.startViewTransition(() => {
        row.remove()
    })
    transition.finished
}

function selectRow(id){
    if(!Array.isArray(data) || !form) return
    const toDo = data.find(todo => todo.id === id)
    if(!toDo) return
    form.elements['id'].value= toDo.id
    form.elements['title'].value= toDo.title
    form.elements['description'].value= toDo.description
    form.elements['isArchived'].checked = Boolean(toDo.isArchived)
    toggleModal()
}

function updatedRow(id, todo){
    const row = container.querySelector(`div[data-id="${id}"]`)

    if(!row) return

    row.querySelector('[data-title]').textContent = todo.title
    row.querySelector('[data-description]').textContent = todo.description
    row.querySelector("[data-detail]").textContent = new Date(todo.createdAt).toLocaleTimeString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    })

    changeClassRow(row, todo)
}

function toggleArchive(id){
    const row = container.querySelector(`div[data-id="${id}"]`)
    const index = data.findIndex(todo => todo.id === id)
    let todo = data.find(todo => todo.id === id)

    todo = {
        ...todo,
        isArchived: todo.isArchived ? false : true
    }

    data[index] = todo
    localStorage.setItem("todos", JSON.stringify(data))
    updateStats()
}

function changeClassRow(row, todo) {
    if(!todo.completedAt){
        row.querySelector('[data-title]').classList.remove("line-through")

        // Boton
        row.querySelector('.toggle-complete').classList.remove("bg-primary")
        row.querySelector('.toggle-complete').classList.add("bg-muted")

        // Svg
        row.querySelector('.toggle-complete').querySelector('svg').classList.remove("opacity-100")
        row.querySelector('.toggle-complete').querySelector('svg').classList.add("opacity-0")
    } else {
        row.querySelector('[data-title]').classList.add("line-through")

        // Boton
        row.querySelector('.toggle-complete').classList.add("bg-primary")
        row.querySelector('.toggle-complete').classList.remove("bg-muted")

        // Svg
        row.querySelector('.toggle-complete').querySelector('svg').classList.add("opacity-100")
        row.querySelector('.toggle-complete').querySelector('svg').classList.remove("opacity-0")
    }
}

function toggleComplete(id){
    const row = container.querySelector(`div[data-id="${id}"]`)
    const index = data.findIndex(todo => todo.id === id)
    let todo = data.find(todo => todo.id === id)

    
    todo = {
        ...todo,
        completedAt: todo.completedAt ? null : new Date().toISOString()
    }
    
    changeClassRow(row, todo)

    data[index] = todo
    localStorage.setItem("todos", JSON.stringify(data))

    updateStats()
}

function renderCards(){
    container.innerHTML = ''

    if(!Array.isArray(data) || data.length === 0){
        emptyMessage()
        return
    }

    data.map(todo => renderCard(todo, false))
}

renderCards()
updateStats()

form.addEventListener("submit", function(e){
    e.preventDefault()

    const formData = new FormData(form)

    const title = formData.get('title')
    const description = formData.get('description')
    const isArchived = formData.get('isArchived')
    const editingId = formData.get('id')

    console.log(title, description, isArchived);
    
    if(title.trim().length === 0){
        toast({
            message: "Title is required",
            duration: 4000,
            autoClose: true,
            pauseOnHover: true
        });
        return
    }

    if(editingId.trim().length === 0){
        const todo = {
            id: crypto.randomUUID(),
            title: title,
            description: description,
            isArchived: isArchived ? true : false,
            createdAt: new Date().toISOString(),
            completedAt: null
        }
        data.push(todo)
        localStorage.setItem("todos", JSON.stringify(data))
        renderCard(todo)
        toggleModal()
        toast({
            message: "Created successfully",
            showIcon: true,
            iconAnimation: "default",
            iconTimingFunction: "ease",
            iconBorderRadius: "50%",
            iconType: "success",
        });
        form.reset()
        updateStats()
    }else {
        const index = data.findIndex(todo => todo.id === editingId)
        const todo = data.find(todo => todo.id === editingId)
        if(index !== -1){
            const updatedTodo = {
                id: editingId,
                title: title,
                description: description,
                isArchived: isArchived ? true : false,
                createdAt: todo.createdAt,
                completedAt: todo.completedAt
            }
            data[index] = updatedTodo
            localStorage.setItem("todos", JSON.stringify(data))

            updatedRow(editingId, updatedTodo)
            toggleModal()
            toast({
                message: "Updated successfully",
                showIcon: true,
                iconAnimation: "default",
                iconTimingFunction: "ease",
                iconBorderRadius: "50%",
                iconType: "success",
            });
            form.reset()
            inputId.value = ""
            updateStats()
        }
    }
})