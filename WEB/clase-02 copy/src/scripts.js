// ===================================================================
// CONSTANTS - Centralizamos todos los selectores y valores mágicos
// ===================================================================
const SELECTORS = {
    CARD_TEMPLATE: '#card',
    EMPTY_MESSAGE_TEMPLATE: '#empty-message',
    CONTAINER: '#cards',
    FORM: '#form',
    TOOLBAR: '#toolbar',
    INPUT_ID: '#form-input-id',
    MODAL_OVERLAY: '#modalOverlay',
    MODAL_BOX: '#modalBox',
    DATE_DISPLAY: '[data-now]',
    MODAL_TITLE: '[data-title-modal]',
    MODAL_DESCRIPTION: '[data-description-modal]',
    MODAL_BUTTON: '[data-button-modal]',
    TAB_ALL: '[data-tab="all"]',
    TAB_OPEN: '[data-tab="open"]',
    TAB_CLOSED: '[data-tab="closed"]',
    TAB_ARCHIVED: '[data-tab="archived"]',
    THEME_TOGGLE: '[data-theme-toggle]'
};

const STORAGE_KEY = 'todos';
const THEME_STORAGE_KEY = 'app-theme';

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
};

const FILTER_TYPES = {
    ALL: 'all',
    OPEN: 'open',
    CLOSED: 'closed',
    ARCHIVED: 'archived'
};

const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
};

// ===================================================================
// STATE MANAGEMENT - Gestión centralizada del estado
// ===================================================================
const TodoState = {
    currentFilter: FILTER_TYPES.ALL,
  
    // Obtener todos los todos del localStorage
    getAll() {
        try {
            const ordered = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
            if(Array.isArray(ordered)){
                return ordered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            }
            return [];
        } catch (error) {
            console.error('Error loading todos:', error);
            this.save([])
            return [];
        }
    },
  
    // Guardar todos en localStorage
    save(todos) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
        } catch (error) {
            console.error('Error saving todos:', error);
        }
    },
  
    // Obtener todos filtrados según el tab activo
    getFiltered() {
        const todos = this.getAll();
        
        switch (this.currentFilter) {
            case FILTER_TYPES.ALL:
                return todos.filter(todo => !todo.isArchived);
            
            case FILTER_TYPES.OPEN:
                return todos.filter(todo => !todo.completedAt && !todo.isArchived);
            
            case FILTER_TYPES.CLOSED:
                return todos.filter(todo => todo.completedAt && !todo.isArchived);
            
            case FILTER_TYPES.ARCHIVED:
                return todos.filter(todo => todo.isArchived);
            
            default:
                return todos;
        }
    },
  
    // Encontrar un todo por ID
    findById(id) {
        return this.getAll().find(todo => todo.id === id);
    },
  
    // Crear un nuevo todo
    create(todoData) {
        const todos = this.getAll();
        const newTodo = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            completedAt: null,
            isArchived: false,
            ...todoData
        };
        todos.push(newTodo);
        this.save(todos);
        return newTodo;
    },
  
    // Actualizar un todo existente
    update(id, updates) {
        const todos = this.getAll();
        const index = todos.findIndex(todo => todo.id === id);
        
        if (index === -1) return null;
        
        todos[index] = { ...todos[index], ...updates };
        this.save(todos);
        return todos[index];
    },
  
    // Eliminar un todo
    delete(id) {
        const todos = this.getAll().filter(todo => todo.id !== id);
        this.save(todos);
    },
  
    // Toggle completado
    toggleComplete(id) {
        const todo = this.findById(id);
        if (!todo) return null;
        
        return this.update(id, {
            completedAt: todo.completedAt ? null : new Date().toISOString()
        });
    },
  
    // Toggle archivado
    toggleArchive(id) {
        const todo = this.findById(id);
        if (!todo) return null;
        
        return this.update(id, {
            isArchived: !todo.isArchived
        });
    },
  
    // Obtener estadísticas
    getStats() {
        const todos = this.getAll();
        return {
            all: todos.filter(t => !t.isArchived).length,
            open: todos.filter(t => !t.completedAt && !t.isArchived).length,
            closed: todos.filter(t => t.completedAt && !t.isArchived).length,
            archived: todos.filter(t => t.isArchived).length
        };
    }
};

// ===================================================================
// DOM UTILITIES - Funciones helper para manipulación del DOM
// ===================================================================
const DOMUtils = {
    // Obtener elemento o lanzar error si no existe
    getElement(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            console.error(`Element not found: ${selector}`);
        }
        return element;
    },
    
    // Agregar clases con animación
    addClasses(element, ...classes) {
        element?.classList.add(...classes);
    },
    
    // Remover clases con animación
    removeClasses(element, ...classes) {
        element?.classList.remove(...classes);
    },
    
    // Toggle clases
    toggleClasses(element, ...classes) {
        classes.forEach(cls => element?.classList.toggle(cls));
    },
    
    // Formatear fecha
    formatDate(dateString) {
        return new Date(dateString).toLocaleTimeString('es-CO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    },
    
    // Formatear fecha actual
    formatNow() {
        return new Date().toLocaleDateString('en-EU', {
            weekday: 'long',
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        });
    }
};

// ===================================================================
// MODAL MANAGEMENT - Gestión del modal
// ===================================================================
const ModalManager = {
    isOpen: false,
    overlay: null,
    modal: null,
    form: null,
    inputId: null,
    
    init() {
        this.overlay = DOMUtils.getElement(SELECTORS.MODAL_OVERLAY);
        this.modal = DOMUtils.getElement(SELECTORS.MODAL_BOX);
        this.form = DOMUtils.getElement(SELECTORS.FORM);
        this.inputId = DOMUtils.getElement(SELECTORS.INPUT_ID);
        
        this.inputId?.addEventListener('input', () => this.updateModalContent());
    },
    
    open() {
        DOMUtils.removeClasses(this.overlay, 'opacity-0', 'pointer-events-none');
        DOMUtils.removeClasses(this.modal, 'scale-90', 'opacity-0');
        DOMUtils.addClasses(this.modal, 'scale-100', 'opacity-100');
        this.isOpen = true;
    },
    
    close() {
        DOMUtils.addClasses(this.modal, 'scale-90', 'opacity-0');
        DOMUtils.removeClasses(this.modal, 'scale-100', 'opacity-100');
        DOMUtils.addClasses(this.overlay, 'opacity-0', 'pointer-events-none');
        this.isOpen = false;
        this.reset();
    },
    
    toggle() {
        this.isOpen ? this.close() : this.open();
    },
    
    reset() {
        this.form?.reset();
        if (this.inputId) this.inputId.value = '';
        this.updateModalContent();
    },
    
    updateModalContent() {
        const isEditing = this.inputId?.value.trim().length > 0;
        const state = isEditing ? MODAL_STATES.UPDATE : MODAL_STATES.CREATE;
        
        const titleEl = this.modal?.querySelector(SELECTORS.MODAL_TITLE);
        const descEl = this.modal?.querySelector(SELECTORS.MODAL_DESCRIPTION);
        const btnEl = this.modal?.querySelector(SELECTORS.MODAL_BUTTON);
        
        if (titleEl) titleEl.textContent = state.title;
        if (descEl) descEl.textContent = state.description;
        if (btnEl) btnEl.textContent = state.button;
    },
    
    fillForm(todo) {
        if (!this.form || !todo) return;
        
        this.form.elements['id'].value = todo.id;
        this.form.elements['title'].value = todo.title;
        this.form.elements['description'].value = todo.description;
        this.form.elements['isArchived'].checked = Boolean(todo.isArchived);
        this.updateModalContent();
    }
};

// ===================================================================
// UI UPDATES - Actualización de la interfaz
// ===================================================================
const UIManager = {
    container: null,
    cardTemplate: null,
    emptyTemplate: null,
    toolbar: null,
  
    init() {
        this.container = DOMUtils.getElement(SELECTORS.CONTAINER);
        this.cardTemplate = DOMUtils.getElement(SELECTORS.CARD_TEMPLATE);
        this.emptyTemplate = DOMUtils.getElement(SELECTORS.EMPTY_MESSAGE_TEMPLATE);
        this.toolbar = DOMUtils.getElement(SELECTORS.TOOLBAR);
        
        // Inicializar fecha
        const dateDisplay = DOMUtils.getElement(SELECTORS.DATE_DISPLAY);
        if (dateDisplay) dateDisplay.textContent = DOMUtils.formatNow();
    },
  
    updateStats() {
        if (!this.toolbar) return;
        
        const stats = TodoState.getStats();
        
        const allEl = this.toolbar.querySelector('[data-all-length]');
        const openEl = this.toolbar.querySelector('[data-open-length]');
        const closedEl = this.toolbar.querySelector('[data-closed-length]');
        const archivedEl = this.toolbar.querySelector('[data-archived-length]');
        
        if (allEl) allEl.textContent = stats.all;
        if (openEl) openEl.textContent = stats.open;
        if (closedEl) closedEl.textContent = stats.closed;
        if (archivedEl) archivedEl.textContent = stats.archived;
    },
  
    showEmptyMessage() {
        if (!this.emptyTemplate || !this.container) return;
        
        const empty = this.emptyTemplate.content.cloneNode(true);
        this.container.appendChild(empty);
    },
  
    createCardElement(todo) {
        if (!this.cardTemplate) return null;
        
        const card = this.cardTemplate.content.cloneNode(true);
        const cardDiv = card.querySelector('[data-id]');
        
        if (!cardDiv) return null;
        
        // Configurar atributos
        cardDiv.setAttribute('data-id', todo.id);
        cardDiv.setAttribute('style', `view-transition-class: dataRow; view-transition-name: dataRow-${todo.id}`);
        
        // Configurar contenido
        const titleEl = card.querySelector('[data-title]');
        const descEl = card.querySelector('[data-description]');
        const detailEl = card.querySelector('[data-detail]');
        
        if (titleEl) titleEl.textContent = todo.title;
        if (descEl) descEl.textContent = todo.description;
        if (detailEl) detailEl.textContent = DOMUtils.formatDate(todo.createdAt);
        
        // Configurar botones
        const editBtn = card.querySelector('.edit');
        const deleteBtn = card.querySelector('.delete');
        const archiveBtn = card.querySelector('.toggle-archive');
        const completeBtn = card.querySelector('.toggle-complete');
        
        if (editBtn) editBtn.onclick = () => CardActions.edit(todo.id);
        if (deleteBtn) deleteBtn.onclick = () => CardActions.delete(todo.id);
        if (archiveBtn) archiveBtn.onclick = () => CardActions.toggleArchive(todo.id);
        if (completeBtn) completeBtn.onclick = () => CardActions.toggleComplete(todo.id);
        
        // Aplicar estilos según estado
        this.applyCardStyles(card, todo);
        
        return card;
    },
  
    applyCardStyles(cardElement, todo) {
        const titleEl = cardElement.querySelector('[data-title]');
        const completeBtn = cardElement.querySelector('.toggle-complete');
        const completeSvg = completeBtn?.querySelector('svg');
        
        if (todo.completedAt) {
            DOMUtils.addClasses(titleEl, 'line-through');
            DOMUtils.addClasses(completeBtn, 'bg-primary');
            DOMUtils.removeClasses(completeBtn, 'bg-muted');
            DOMUtils.addClasses(completeSvg, 'opacity-100');
            DOMUtils.removeClasses(completeSvg, 'opacity-0');
        } else {
            DOMUtils.removeClasses(titleEl, 'line-through');
            DOMUtils.removeClasses(completeBtn, 'bg-primary');
            DOMUtils.addClasses(completeBtn, 'bg-muted');
            DOMUtils.removeClasses(completeSvg, 'opacity-100');
            DOMUtils.addClasses(completeSvg, 'opacity-0');
        }
    },
  
    updateCard(id, todo) {
        const cardDiv = this.container?.querySelector(`div[data-id="${id}"]`);
        if (!cardDiv || !todo) return;
        
        const titleEl = cardDiv.querySelector('[data-title]');
        const descEl = cardDiv.querySelector('[data-description]');
        const detailEl = cardDiv.querySelector('[data-detail]');
        
        if (titleEl) titleEl.textContent = todo.title;
        if (descEl) descEl.textContent = todo.description;
        if (detailEl) detailEl.textContent = DOMUtils.formatDate(todo.createdAt);
        
        this.applyCardStyles(cardDiv, todo);
    },
  
    renderCard(todo, prepend = true) {
        if (!todo || !this.container) return;
        
        // Remover mensaje vacío si existe
        const emptyMsg = this.container.querySelector('[data-empty-message]');
        if (emptyMsg) emptyMsg.remove();
        
        const cardElement = this.createCardElement(todo);
        if (!cardElement) return;
        
        setTimeout(() => {
        if (document.startViewTransition) {
            const transition = document.startViewTransition(() => {
                if (prepend) {
                    this.container.insertBefore(cardElement, this.container.firstChild);
                } else {
                    this.container.appendChild(cardElement);
                }
            });
            transition.finished;
        } else {
            // Fallback sin animación
            if (prepend) {
                this.container.insertBefore(cardElement, this.container.firstChild);
            } else {
                this.container.appendChild(cardElement);
            }
        }
        }, 100);
    },
  
    removeCard(id) {
        const cardDiv = this.container?.querySelector(`div[data-id="${id}"]`);
        if (!cardDiv) return;
        
        DOMUtils.addClasses(cardDiv, 'fade-out');
        
        if (document.startViewTransition) {
            const transition = document.startViewTransition(() => {
                cardDiv.remove();
            });
            transition.finished;
        } else {
            cardDiv.remove();
        }
    
        setTimeout(() => {
            // Mostrar mensaje vacío si no hay más cards
            const remainingCards = this.container?.querySelectorAll('[data-id]');
            if (!remainingCards || remainingCards.length === 0) {
                this.showEmptyMessage();
            }
        }, 300);
    },
  
    renderAllCards() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        
        const todos = TodoState.getFiltered();
        
        if (todos.length === 0) {
            this.showEmptyMessage();
            return;
        }
        
        todos.forEach(todo => {
            const cardElement = this.createCardElement(todo);
            if (cardElement) {
                this.container.appendChild(cardElement);
            }
        });
    }
};

// ===================================================================
// CARD ACTIONS - Acciones sobre las tarjetas
// ===================================================================
const CardActions = {
    edit(id) {
        const todo = TodoState.findById(id);
        if (!todo) return;
        
        ModalManager.fillForm(todo);
        ModalManager.open();
    },
    
    delete(id) {
        TodoState.delete(id);
        UIManager.removeCard(id);
        UIManager.updateStats();
        
        NotificationManager.show('Deleted successfully', 'success');
    },
    
    toggleComplete(id) {
        const updatedTodo = TodoState.toggleComplete(id);
        if (!updatedTodo) return;
        
        UIManager.updateCard(id, updatedTodo);
        UIManager.updateStats();
        
        const shouldBeVisible = this.shouldTodoBeVisible(updatedTodo);
        if (!shouldBeVisible) {
            UIManager.removeCard(id);
        }
    },
    
    toggleArchive(id) {
        const updatedTodo = TodoState.toggleArchive(id);
        if (!updatedTodo) return;
        
        UIManager.updateStats();
        
        const shouldBeVisible = this.shouldTodoBeVisible(updatedTodo);
        if (!shouldBeVisible) {
            UIManager.removeCard(id);
        }
    },
    
    shouldTodoBeVisible(todo) {
        switch (TodoState.currentFilter) {
            case FILTER_TYPES.ALL:
                return !todo.isArchived;
            case FILTER_TYPES.OPEN:
                return !todo.completedAt && !todo.isArchived;
            case FILTER_TYPES.CLOSED:
                return todo.completedAt && !todo.isArchived;
            case FILTER_TYPES.ARCHIVED:
                return todo.isArchived;
            default:
                return true;
        }
    }
};

// ===================================================================
// FILTER MANAGER - Gestión de tabs y filtros
// ===================================================================
const FilterManager = {
    init() {
        const tabs = document.querySelectorAll('[data-tab]');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const filterType = e.currentTarget.getAttribute('data-tab');
                this.applyFilter(filterType);
            });
        });
    },
    
    applyFilter(filterType) {
        TodoState.currentFilter = filterType;
        
        // Actualizar estilos de tabs
        this.updateTabStyles(filterType);
        
        // Re-renderizar cards
        UIManager.renderAllCards();
    },
    
    updateTabStyles(activeFilter) {
        const tabs = document.querySelectorAll('[data-tab]');
        
        tabs.forEach(tab => {
        const tabFilter = tab.getAttribute('data-tab');
        const isActive = tabFilter === activeFilter;
        const badge = tab.querySelector('span');
        
        if (isActive) {
            DOMUtils.addClasses(tab, 'text-primary', 'font-bold');
            DOMUtils.removeClasses(tab, 'text-muted-foreground');
            
            if (badge) {
                DOMUtils.addClasses(badge, 'bg-primary', 'text-primary-foreground');
                DOMUtils.removeClasses(badge, 'bg-muted-foreground/20');
            }
        } else {
            DOMUtils.removeClasses(tab, 'text-primary', 'font-bold');
            DOMUtils.addClasses(tab, 'text-muted-foreground');
            
            if (badge) {
                DOMUtils.removeClasses(badge, 'bg-primary', 'text-primary-foreground');
                DOMUtils.addClasses(badge, 'bg-muted-foreground/20');
            }
        }
        });
    }
};

// ===================================================================
// FORM HANDLER - Manejo del formulario
// ===================================================================
const FormHandler = {
    form: null,
    
    init() {
        this.form = DOMUtils.getElement(SELECTORS.FORM);
        
        this.form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit(e);
        });
    },
    
    handleSubmit(e) {
        const formData = new FormData(this.form);
        
        const title = formData.get('title')?.trim() || '';
        const description = formData.get('description')?.trim() || '';
        const isArchived = formData.get('isArchived') === 'on';
        const editingId = formData.get('id')?.trim() || '';
        
        // Validación
        if (title.length === 0) {
            NotificationManager.show('Title is required', 'error');
            return;
        }
        
        if (editingId) {
            this.updateTodo(editingId, { title, description, isArchived });
        } else {
            this.createTodo({ title, description, isArchived });
        }
    },
    
    createTodo(data) {
        const newTodo = TodoState.create(data);
        
        const shouldBeVisible = CardActions.shouldTodoBeVisible(newTodo);
        if (shouldBeVisible) {
            UIManager.renderCard(newTodo, true);
        }
        
        UIManager.updateStats();
        ModalManager.close();
        NotificationManager.show('Created successfully', 'success');
    },
    
    updateTodo(id, updates) {
        const todo = TodoState.findById(id);
        if (!todo) return;
        
        // Preservar campos importantes
        const updatedTodo = TodoState.update(id, {
            ...updates,
            createdAt: todo.createdAt,
            completedAt: todo.completedAt
        });
        
        if (!updatedTodo) return;
        
        const shouldBeVisible = CardActions.shouldTodoBeVisible(updatedTodo);
        
        if (shouldBeVisible) {
            UIManager.updateCard(id, updatedTodo);
        } else {
            UIManager.removeCard(id);
        }
        
        UIManager.updateStats();
        ModalManager.close();
        NotificationManager.show('Updated successfully', 'success');
    }
};

// ===================================================================
// NOTIFICATION MANAGER - Gestión de notificaciones
// ===================================================================
const NotificationManager = {
    show(message, type = 'success') {
        if (typeof toast !== 'function') {
            console.warn('Toast library not loaded');
            return;
        }
        
        const config = {
            message,
            duration: 4000,
            autoClose: true,
            pauseOnHover: true
        };
        
        if (type === 'success') {
            config.showIcon = true;
            config.iconAnimation = 'default';
            config.iconTimingFunction = 'ease';
            config.iconBorderRadius = '50%';
            config.iconType = 'success';
        }
        
        toast(config);
    }
};


// ===================================================================
// THEME MANAGER - Gestión del tema claro/oscuro/sistema
// ===================================================================
const ThemeManager = {
    themes: {
        LIGHT: 'light',
        DARK: 'dark',
        SYSTEM: 'system'
    },
  
    currentTheme: null,
    themeButton: null,
  
    init() {
        this.themeButton = document.querySelector(SELECTORS.THEME_TOGGLE);
        
        // Cargar tema guardado o usar sistema por defecto
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || this.themes.SYSTEM;
        this.setTheme(savedTheme, false);
        
        // Event listener para el botón
        this.themeButton?.addEventListener('click', () => this.cycleTheme());
        
        // Escuchar cambios en preferencias del sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (this.currentTheme === this.themes.SYSTEM) {
                this.applyTheme(this.themes.SYSTEM);
            }
        });
    },
  
    // Ciclar entre light → dark → system
    cycleTheme() {
        const themeOrder = [this.themes.LIGHT, this.themes.DARK, this.themes.SYSTEM];
        const currentIndex = themeOrder.indexOf(this.currentTheme);
        const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
        
        this.setTheme(nextTheme, true);
    },
  
    // Establecer el tema
    setTheme(theme, save = true) {
        this.currentTheme = theme;
        
        if (save) {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        }
        
        this.applyTheme(theme);
        this.updateButtonIcon(theme);
    },
  
    // Aplicar el tema al documento
    applyTheme(theme) {
        const html = document.documentElement;
        
        if (theme === this.themes.DARK) {
            html.classList.add('dark');
        } else if (theme === this.themes.LIGHT) {
            html.classList.remove('dark');
        } else if (theme === this.themes.SYSTEM) {
            // Detectar preferencia del sistema
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                html.classList.add('dark');
            } else {
                html.classList.remove('dark');
            }
        }
    },
  
    // Actualizar el icono del botón según el tema
    updateButtonIcon(theme) {
        if (!this.themeButton) return;
        
        const icons = {
            [this.themes.LIGHT]: `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun">
                    <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
                </svg>
            `,
            [this.themes.DARK]: `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
            `,
            [this.themes.SYSTEM]: `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-monitor">
                    <rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>
                </svg>
            `
        };
        
        this.themeButton.innerHTML = icons[theme] || icons[this.themes.SYSTEM];
    },
  
    // Obtener el tema actual
    getCurrentTheme() {
        return this.currentTheme;
    }
};

// ===================================================================
// GLOBAL FUNCTIONS - Funciones globales para el HTML
// ===================================================================
window.toggleModal = () => ModalManager.toggle();
window.openModal = () => ModalManager.open();
window.closeModal = () => ModalManager.close();

// ===================================================================
// INITIALIZATION - Inicialización de la aplicación
// ===================================================================
function initApp() {
    DOMUtils.getElement(SELECTORS.DATE_DISPLAY).textContent = DOMUtils.formatNow();
    
    ThemeManager.init()

    ModalManager.init();
    UIManager.init();
    FilterManager.init();
    FormHandler.init();
    
    // Renderizar estado inicial
    UIManager.renderAllCards();
    UIManager.updateStats();
}


// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
