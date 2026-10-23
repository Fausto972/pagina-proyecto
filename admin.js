// admin.js - Sistema de Administración Completo

// Datos de ejemplo (en una aplicación real, estos vendrían del backend)
let USERS = [
    {
        id: 1,
        name: 'Administrador Principal',
        email: 'admin@sistema.com',
        password: '123456',
        role: 'admin',
        status: 'active',
        createdAt: '2023-01-15'
    },
    {
        id: 2,
        name: 'Juan Pérez',
        email: 'juan@sistema.com',
        password: 'password',
        role: 'editor',
        status: 'active',
        createdAt: '2023-02-20'
    }
];

let CONTENT = [
    {
        id: 1,
        title: 'Bienvenido al Sistema',
        body: 'Este es un ejemplo de contenido del sistema.',
        category: 'announcements',
        createdAt: '2023-03-01'
    }
];

let SETTINGS = {
    siteName: 'Sistema de Gestión',
    siteDescription: 'Panel de administración para gestionar el sistema.',
    contactEmail: 'admin@sistema.com',
    maxUsers: 100
};

// Estado de la aplicación
let currentUser = null;
let isEditingUser = false;
let isEditingContent = false;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay un _uo logueado
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showAdminPanel();
    } else {
        showLoginModal();
    }

    // Event Listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Navegación por pestañas
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Login
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            closeModal(modalId);
        });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // _uos
    document.getElementById('addUserBtn').addEventListener('click', openUserModal);
    document.getElementById('userForm').addEventListener('submit', handleUserSubmit);

    // Contenido
    document.getElementById('addContentBtn').addEventListener('click', openContentModal);
    document.getElementById('contentForm').addEventListener('submit', handleContentSubmit);

    // Configuración
    document.getElementById('saveSettingsBtn').addEventListener('click', handleSettingsSave);
    document.getElementById('refreshDashboard').addEventListener('click', refreshDashboard);

    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

// Funciones de autenticación
function showLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('loginUsername').focus();
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    // Buscar _uo
    const user = USERS.find(u => u.email === username || u.name === username);
    
    if (user && user.password === password && user.status === 'active') {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        closeModal('loginModal');
        showAdminPanel();
        showSuccessAlert('Sesión iniciada correctamente');
    } else {
        errorDiv.textContent = '_uo, contraseña incorrectos o cuenta inactiva';
        errorDiv.style.display = 'block';
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    location.reload();
}

function showAdminPanel() {
    document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
    document.getElementById('userName').textContent = currentUser.name;
    loadDashboardData();
    loadUsersData();
    loadContentData();
    loadSettingsData();
}

// Funciones de pestañas
function switchTab(tabId) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Quitar active de todos los tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Mostrar la pestaña seleccionada
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}

// Funciones de _uos
function loadUsersData() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    USERS.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="badge badge-${user.role}">${getRoleText(user.role)}</span></td>
            <td><span class="badge badge-${user.status}">${getStatusText(user.status)}</span></td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit-btn" data-user-id="${user.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" data-user-id="${user.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Añadir event listeners a los botones
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = parseInt(this.getAttribute('data-user-id'));
            openUserModal(userId);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = parseInt(this.getAttribute('data-user-id'));
            deleteUser(userId);
        });
    });
}

function getRoleText(role) {
    const roles = {
        'user': 'Usuario',
        'editor': 'Editor',
        'admin': 'Administrador'
    };
    return roles[role] || role;
}

function getStatusText(status) {
    return status === 'active' ? 'Activo' : 'Inactivo';
}

function openUserModal(userId = null) {
    const modal = document.getElementById('userModal');
    const title = document.getElementById('userModalTitle');
    const form = document.getElementById('userForm');

    if (userId) {
        title.textContent = 'Editar _uo';
        const user = USERS.find(u => u.id === userId);
        document.getElementById('userId').value = user.id;
        document.getElementById('userName').value = user.name;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userPassword').value = user.password;
        document.getElementById('userRole').value = user.role;
        document.getElementById('userStatus').value = user.status;
    } else {
        title.textContent = 'Añadir _uo';
        form.reset();
        document.getElementById('userId').value = '';
    }

    modal.classList.add('active');
}

function handleUserSubmit(e) {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;
    const status = document.getElementById('userStatus').value;

    if (userId) {
        // Editar _uo existente
        const userIndex = USERS.findIndex(u => u.id === parseInt(userId));
        if (userIndex !== -1) {
            USERS[userIndex].name = name;
            USERS[userIndex].email = email;
            USERS[userIndex].password = password;
            USERS[userIndex].role = role;
            USERS[userIndex].status = status;
            showSuccessAlert('_uo actualizado correctamente');
        }
    } else {
        // Añadir nuevo _uo
        const newUser = {
            id: USERS.length > 0 ? Math.max(...USERS.map(u => u.id)) + 1 : 1,
            name,
            email,
            password,
            role,
            status,
            createdAt: new Date().toISOString().split('T')[0]
        };
        USERS.push(newUser);
        showSuccessAlert('_uo añadido correctamente');
    }

    closeModal('userModal');
    loadUsersData();
    refreshDashboard();
}

function deleteUser(userId) {
    if (confirm('¿Estás seguro de eliminar este _uo?')) {
        USERS = USERS.filter(u => u.id !== userId);
        loadUsersData();
        refreshDashboard();
        showSuccessAlert('_uo eliminado correctamente');
    }
}

// Funciones de contenido
function loadContentData() {
    const tbody = document.getElementById('contentTableBody');
    tbody.innerHTML = '';

    CONTENT.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.title}</td>
            <td>${getCategoryText(item.category)}</td>
            <td>${item.createdAt}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit-btn" data-content-id="${item.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" data-content-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Añadir event listeners
    document.querySelectorAll('.edit-btn[data-content-id]').forEach(btn => {
        btn.addEventListener('click', function() {
            const contentId = parseInt(this.getAttribute('data-content-id'));
            openContentModal(contentId);
        });
    });

    document.querySelectorAll('.delete-btn[data-content-id]').forEach(btn => {
        btn.addEventListener('click', function() {
            const contentId = parseInt(this.getAttribute('data-content-id'));
            deleteContent(contentId);
        });
    });
}

function getCategoryText(category) {
    const categories = {
        'news': 'Noticias',
        'updates': 'Actualizaciones',
        'announcements': 'Anuncios'
    };
    return categories[category] || category;
}

function openContentModal(contentId = null) {
    const modal = document.getElementById('contentModal');
    const title = document.getElementById('contentModalTitle');
    const form = document.getElementById('contentForm');

    if (contentId) {
        title.textContent = 'Editar Contenido';
        const item = CONTENT.find(c => c.id === contentId);
        document.getElementById('contentId').value = item.id;
        document.getElementById('contentTitle').value = item.title;
        document.getElementById('contentBody').value = item.body;
        document.getElementById('contentCategory').value = item.category;
    } else {
        title.textContent = 'Añadir Contenido';
        form.reset();
        document.getElementById('contentId').value = '';
    }

    modal.classList.add('active');
}

function handleContentSubmit(e) {
    e.preventDefault();
    
    const contentId = document.getElementById('contentId').value;
    const title = document.getElementById('contentTitle').value;
    const body = document.getElementById('contentBody').value;
    const category = document.getElementById('contentCategory').value;

    if (contentId) {
        // Editar contenido existente
        const contentIndex = CONTENT.findIndex(c => c.id === parseInt(contentId));
        if (contentIndex !== -1) {
            CONTENT[contentIndex].title = title;
            CONTENT[contentIndex].body = body;
            CONTENT[contentIndex].category = category;
            showSuccessAlert('Contenido actualizado correctamente');
        }
    } else {
        // Añadir nuevo contenido
        const newItem = {
            id: CONTENT.length > 0 ? Math.max(...CONTENT.map(c => c.id)) + 1 : 1,
            title,
            body,
            category,
            createdAt: new Date().toISOString().split('T')[0]
        };
        CONTENT.push(newItem);
        showSuccessAlert('Contenido añadido correctamente');
    }

    closeModal('contentModal');
    loadContentData();
    refreshDashboard();
}

function deleteContent(contentId) {
    if (confirm('¿Estás seguro de eliminar este contenido?')) {
        CONTENT = CONTENT.filter(c => c.id !== contentId);
        loadContentData();
        refreshDashboard();
        showSuccessAlert('Contenido eliminado correctamente');
    }
}

// Funciones de configuración
function loadSettingsData() {
    document.getElementById('siteName').value = SETTINGS.siteName;
    document.getElementById('siteDescription').value = SETTINGS.siteDescription;
    document.getElementById('contactEmail').value = SETTINGS.contactEmail;
    document.getElementById('maxUsers').value = SETTINGS.maxUsers;
}

function handleSettingsSave(e) {
    e.preventDefault();
    
    SETTINGS.siteName = document.getElementById('siteName').value;
    SETTINGS.siteDescription = document.getElementById('siteDescription').value;
    SETTINGS.contactEmail = document.getElementById('contactEmail').value;
    SETTINGS.maxUsers = document.getElementById('maxUsers').value;

    showSuccessAlert('Configuración guardada correctamente');
}

// Funciones del dashboard
function loadDashboardData() {
    document.getElementById('usersCount').textContent = USERS.length;
    document.getElementById('contentCount').textContent = CONTENT.length;
    document.getElementById('systemStatus').textContent = 'Activo';
    document.getElementById('systemVersion').textContent = '1.0.0';
    
    // Actualizar timestamps
    const now = new Date().toLocaleTimeString();
    document.getElementById('usersUpdate').textContent = now;
    document.getElementById('contentUpdate').textContent = now;
}

function refreshDashboard() {
    loadDashboardData();
    showSuccessAlert('Dashboard actualizado');
}

// Funciones de utilidad
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showSuccessAlert(message) {
    const alert = document.getElementById('successAlert');
    alert.textContent = message;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

function showErrorAlert(message) {
    const alert = document.getElementById('errorAlert');
    alert.textContent = message;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}