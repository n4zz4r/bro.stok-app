// bro.stok - JavaScript Application Logic
class BroStokApp {
    constructor() {
        this.currentUser = null;
        this.currentScreen = 'login';
        this.products = [];
        this.variants = [];
        this.stockHistory = [];
        this.lowStockThreshold = 10;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSampleData();
        this.updateDashboard();
    }

    setupEventListeners() {
        // Login/Register
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('showRegister').addEventListener('click', (e) => this.showScreen('register'));
        document.getElementById('backToLogin').addEventListener('click', (e) => this.showScreen('login'));

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Quick Actions
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickAction(e));
        });

        // Stock Actions
        document.querySelectorAll('.stock-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleStockAction(e));
        });

        // Modals
        document.querySelectorAll('[data-modal]').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.dataset.modal));
        });

        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target.id === 'modalOverlay') {
                this.closeAllModals();
            }
        });

        // Forms
        document.getElementById('addProductForm').addEventListener('submit', (e) => this.handleAddProduct(e));
        document.getElementById('stockForm').addEventListener('submit', (e) => this.handleStockOperation(e));

        // Other buttons
        document.getElementById('addProductBtn').addEventListener('click', () => this.openModal('addProductModal'));
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('applyFilter').addEventListener('click', () => this.applyHistoryFilter());
        document.getElementById('lowStockThreshold').addEventListener('change', (e) => this.updateLowStockThreshold(e.target.value));

        // Search
        document.getElementById('productSearch').addEventListener('input', (e) => this.searchProducts(e.target.value));
    }

    // Screen Management
    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenName + 'Screen');
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
        
        this.currentScreen = screenName;

        // Update navigation
        if (screenName !== 'login' && screenName !== 'register') {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            const activeNav = document.querySelector(`[data-screen="${screenName}"]`);
            if (activeNav) {
                activeNav.classList.add('active');
            }
        }

        // Load screen-specific data
        this.loadScreenData(screenName);
        
        // Scroll to top when switching screens
        window.scrollTo(0, 0);
    }

    loadScreenData(screenName) {
        console.log('Loading data for screen:', screenName); // Debug log
        
        switch (screenName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'products':
                this.renderProducts();
                break;
            case 'stock':
                // Stock screen doesn't need data loading
                break;
            case 'history':
                this.renderHistory();
                break;
            case 'settings':
                // Settings screen doesn't need data loading
                break;
        }
    }

    // Authentication
    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Simple validation
        if (!email || !password) {
            this.showToast('Email dan password harus diisi', 'error');
            return;
        }

        if (password.length < 6) {
            this.showToast('Password minimal 6 karakter', 'error');
            return;
        }

        // Simulate login
        this.currentUser = {
            id: '1',
            name: 'Admin User',
            email: email,
            role: 'admin'
        };

        this.showToast('Login berhasil!', 'success');
        this.showScreen('dashboard');
    }

    handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const role = document.getElementById('regRole').value;

        // Validation
        if (!name || !email || !password || !confirmPassword || !role) {
            this.showToast('Semua field harus diisi', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showToast('Password dan konfirmasi password tidak sama', 'error');
            return;
        }

        if (password.length < 6) {
            this.showToast('Password minimal 6 karakter', 'error');
            return;
        }

        // Simulate registration
        this.showToast('Registrasi berhasil! Silakan login', 'success');
        this.showScreen('login');
    }

    logout() {
        this.currentUser = null;
        this.showScreen('login');
        this.showToast('Anda telah keluar', 'info');
    }

    // Navigation
    handleNavigation(e) {
        e.preventDefault();
        const screen = e.currentTarget.dataset.screen;
        console.log('Navigating to:', screen); // Debug log
        this.showScreen(screen);
    }

    // Quick Actions
    handleQuickAction(e) {
        const action = e.currentTarget.dataset.action;
        
        switch (action) {
            case 'stock-in':
                this.openStockModal('in');
                break;
            case 'stock-out':
                this.openStockModal('out');
                break;
            case 'add-product':
                this.openModal('addProductModal');
                break;
        }
    }

    handleStockAction(e) {
        const type = e.currentTarget.dataset.type;
        this.openStockModal(type);
    }

    // Modal Management
    openModal(modalId) {
        document.getElementById('modalOverlay').classList.add('active');
        document.getElementById(modalId).style.display = 'block';
    }

    closeModal(modalId) {
        document.getElementById('modalOverlay').classList.remove('active');
        if (modalId) {
            document.getElementById(modalId).style.display = 'none';
        }
    }

    closeAllModals() {
        document.getElementById('modalOverlay').classList.remove('active');
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    openStockModal(type) {
        this.populateVariantSelect();
        document.getElementById('stockModalTitle').textContent = 
            type === 'in' ? 'Stok Masuk' : 
            type === 'out' ? 'Stok Keluar' : 'Penyesuaian Stok';
        
        document.getElementById('stockForm').dataset.type = type;
        this.openModal('stockModal');
    }

    // Data Management
    loadSampleData() {
        // Sample products
        this.products = [
            {
                id: '1',
                name: 'Kaos Polo',
                brand: 'Brand A',
                image_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: '2',
                name: 'Celana Jeans',
                brand: 'Brand B',
                image_url: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];

        // Sample variants
        this.variants = [
            {
                id: '1',
                product_id: '1',
                size: 'M',
                color: 'Hitam',
                sku: 'POLO-M-HITAM',
                stock: 5,
                created_at: new Date().toISOString()
            },
            {
                id: '2',
                product_id: '1',
                size: 'L',
                color: 'Putih',
                sku: 'POLO-L-PUTIH',
                stock: 15,
                created_at: new Date().toISOString()
            },
            {
                id: '3',
                product_id: '2',
                size: '32',
                color: 'Biru',
                sku: 'JEANS-32-BIRU',
                stock: 3,
                created_at: new Date().toISOString()
            }
        ];

        // Sample stock history
        this.stockHistory = [
            {
                id: '1',
                variant_id: '1',
                user_id: '1',
                quantity_change: 10,
                operation_type: 'in',
                notes: 'Stok awal',
                created_at: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: '2',
                variant_id: '1',
                user_id: '1',
                quantity_change: -5,
                operation_type: 'out',
                notes: 'Penjualan',
                created_at: new Date(Date.now() - 43200000).toISOString()
            }
        ];
    }

    // Dashboard
    updateDashboard() {
        document.getElementById('totalProducts').textContent = this.products.length;
        document.getElementById('totalVariants').textContent = this.variants.length;
        
        const lowStockItems = this.variants.filter(v => v.stock < this.lowStockThreshold);
        document.getElementById('lowStockCount').textContent = lowStockItems.length;
        
        this.renderLowStockList(lowStockItems);
    }

    renderLowStockList(items) {
        const container = document.getElementById('lowStockList');
        container.innerHTML = '';

        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons">check_circle</span>
                    <h3>Semua stok aman</h3>
                    <p>Tidak ada produk dengan stok rendah</p>
                </div>
            `;
            return;
        }

        items.forEach(item => {
            const product = this.products.find(p => p.id === item.product_id);
            const element = document.createElement('div');
            element.className = 'low-stock-item';
            element.innerHTML = `
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <p>${item.size} - ${item.color} (${item.sku})</p>
                </div>
                <div class="stock-info">
                    <div class="stock-count">${item.stock}</div>
                    <p>tersisa</p>
                </div>
            `;
            container.appendChild(element);
        });
    }

    // Products
    renderProducts() {
        const container = document.getElementById('productsGrid');
        container.innerHTML = '';

        if (this.products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons">inventory_2</span>
                    <h3>Belum ada produk</h3>
                    <p>Tambahkan produk pertama Anda</p>
                </div>
            `;
            return;
        }

        this.products.forEach(product => {
            const productVariants = this.variants.filter(v => v.product_id === product.id);
            const element = document.createElement('div');
            element.className = 'product-card';
            element.innerHTML = `
                <div class="product-image">
                    <span class="material-icons">image</span>
                </div>
                <div class="product-content">
                    <h3>${product.name}</h3>
                    <p>${product.brand}</p>
                    <div class="product-variants">
                        ${productVariants.map(v => `<span class="variant-tag">${v.size} - ${v.color}</span>`).join('')}
                    </div>
                </div>
            `;
            container.appendChild(element);
        });
    }

    searchProducts(query) {
        // Simple search implementation
        const products = this.products.filter(p => 
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.brand.toLowerCase().includes(query.toLowerCase())
        );
        
        // Re-render with filtered results
        const container = document.getElementById('productsGrid');
        container.innerHTML = '';
        
        products.forEach(product => {
            const productVariants = this.variants.filter(v => v.product_id === product.id);
            const element = document.createElement('div');
            element.className = 'product-card';
            element.innerHTML = `
                <div class="product-image">
                    <span class="material-icons">image</span>
                </div>
                <div class="product-content">
                    <h3>${product.name}</h3>
                    <p>${product.brand}</p>
                    <div class="product-variants">
                        ${productVariants.map(v => `<span class="variant-tag">${v.size} - ${v.color}</span>`).join('')}
                    </div>
                </div>
            `;
            container.appendChild(element);
        });
    }

    // Stock Operations
    populateVariantSelect() {
        const select = document.getElementById('stockVariant');
        select.innerHTML = '<option value="">Pilih varian</option>';
        
        this.variants.forEach(variant => {
            const product = this.products.find(p => p.id === variant.product_id);
            const option = document.createElement('option');
            option.value = variant.id;
            option.textContent = `${product.name} - ${variant.size} ${variant.color} (Stok: ${variant.stock})`;
            select.appendChild(option);
        });
    }

    handleStockOperation(e) {
        e.preventDefault();
        const type = e.target.dataset.type;
        const variantId = document.getElementById('stockVariant').value;
        const quantity = parseInt(document.getElementById('stockQuantity').value);
        const notes = document.getElementById('stockNotes').value;

        if (!variantId || !quantity) {
            this.showToast('Varian dan jumlah harus diisi', 'error');
            return;
        }

        const variant = this.variants.find(v => v.id === variantId);
        if (!variant) {
            this.showToast('Varian tidak ditemukan', 'error');
            return;
        }

        // Validate stock for out operations
        if (type === 'out' && variant.stock < quantity) {
            this.showToast('Stok tidak cukup', 'error');
            return;
        }

        // Update stock
        let newStock = variant.stock;
        let quantityChange = quantity;

        switch (type) {
            case 'in':
                newStock += quantity;
                break;
            case 'out':
                newStock -= quantity;
                quantityChange = -quantity;
                break;
            case 'adjust':
                newStock = quantity;
                quantityChange = quantity - variant.stock;
                break;
        }

        variant.stock = newStock;

        // Add to history
        const historyItem = {
            id: Date.now().toString(),
            variant_id: variantId,
            user_id: this.currentUser.id,
            quantity_change: quantityChange,
            operation_type: type,
            notes: notes,
            created_at: new Date().toISOString()
        };

        this.stockHistory.unshift(historyItem);

        this.showToast(`Stok ${type === 'in' ? 'masuk' : type === 'out' ? 'keluar' : 'disesuaikan'} berhasil`, 'success');
        this.closeModal('stockModal');
        this.updateDashboard();
        this.renderProducts();
    }

    // History
    renderHistory() {
        const container = document.getElementById('historyList');
        container.innerHTML = '';

        if (this.stockHistory.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons">history</span>
                    <h3>Belum ada riwayat</h3>
                    <p>Riwayat operasi stok akan muncul di sini</p>
                </div>
            `;
            return;
        }

        this.stockHistory.forEach(history => {
            const variant = this.variants.find(v => v.id === history.variant_id);
            const product = this.products.find(p => p.id === variant.product_id);
            
            const element = document.createElement('div');
            element.className = 'history-item';
            element.innerHTML = `
                <div class="history-info">
                    <h4>${product.name} - ${variant.size} ${variant.color}</h4>
                    <p>${history.notes || 'Tidak ada catatan'}</p>
                </div>
                <div class="history-meta">
                    <div class="operation-type ${history.operation_type}">
                        ${history.operation_type === 'in' ? 'Masuk' : 
                          history.operation_type === 'out' ? 'Keluar' : 'Penyesuaian'}
                    </div>
                    <div class="quantity">${history.quantity_change > 0 ? '+' : ''}${history.quantity_change}</div>
                    <div class="timestamp">${new Date(history.created_at).toLocaleString('id-ID')}</div>
                </div>
            `;
            container.appendChild(element);
        });
    }

    applyHistoryFilter() {
        const operationFilter = document.getElementById('operationFilter').value;
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;

        let filteredHistory = this.stockHistory;

        if (operationFilter) {
            filteredHistory = filteredHistory.filter(h => h.operation_type === operationFilter);
        }

        if (dateFrom) {
            filteredHistory = filteredHistory.filter(h => new Date(h.created_at) >= new Date(dateFrom));
        }

        if (dateTo) {
            filteredHistory = filteredHistory.filter(h => new Date(h.created_at) <= new Date(dateTo));
        }

        // Re-render with filtered results
        const container = document.getElementById('historyList');
        container.innerHTML = '';

        filteredHistory.forEach(history => {
            const variant = this.variants.find(v => v.id === history.variant_id);
            const product = this.products.find(p => p.id === variant.product_id);
            
            const element = document.createElement('div');
            element.className = 'history-item';
            element.innerHTML = `
                <div class="history-info">
                    <h4>${product.name} - ${variant.size} ${variant.color}</h4>
                    <p>${history.notes || 'Tidak ada catatan'}</p>
                </div>
                <div class="history-meta">
                    <div class="operation-type ${history.operation_type}">
                        ${history.operation_type === 'in' ? 'Masuk' : 
                          history.operation_type === 'out' ? 'Keluar' : 'Penyesuaian'}
                    </div>
                    <div class="quantity">${history.quantity_change > 0 ? '+' : ''}${history.quantity_change}</div>
                    <div class="timestamp">${new Date(history.created_at).toLocaleString('id-ID')}</div>
                </div>
            `;
            container.appendChild(element);
        });
    }

    // Product Management
    handleAddProduct(e) {
        e.preventDefault();
        const name = document.getElementById('productName').value;
        const brand = document.getElementById('productBrand').value;
        const image = document.getElementById('productImage').files[0];

        if (!name || !brand) {
            this.showToast('Nama dan brand harus diisi', 'error');
            return;
        }

        const newProduct = {
            id: Date.now().toString(),
            name: name,
            brand: brand,
            image_url: image ? URL.createObjectURL(image) : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        this.products.push(newProduct);
        this.showToast('Produk berhasil ditambahkan', 'success');
        this.closeModal('addProductModal');
        this.renderProducts();
        this.updateDashboard();

        // Reset form
        document.getElementById('addProductForm').reset();
    }

    // Settings
    updateLowStockThreshold(value) {
        this.lowStockThreshold = parseInt(value);
        this.updateDashboard();
        this.showToast('Threshold stok rendah diperbarui', 'success');
    }

    // Export
    exportData() {
        // Export products
        const productsData = this.products.map(product => {
            const variants = this.variants.filter(v => v.product_id === product.id);
            return {
                'Nama Produk': product.name,
                'Brand': product.brand,
                'Total Varian': variants.length,
                'Total Stok': variants.reduce((sum, v) => sum + v.stock, 0)
            };
        });

        // Export history
        const historyData = this.stockHistory.map(history => {
            const variant = this.variants.find(v => v.id === history.variant_id);
            const product = this.products.find(p => p.id === variant.product_id);
            return {
                'Tanggal': new Date(history.created_at).toLocaleDateString('id-ID'),
                'Produk': product.name,
                'Varian': `${variant.size} - ${variant.color}`,
                'Operasi': history.operation_type === 'in' ? 'Masuk' : 
                         history.operation_type === 'out' ? 'Keluar' : 'Penyesuaian',
                'Jumlah': history.quantity_change,
                'Catatan': history.notes || ''
            };
        });

        // Create CSV
        const productsCSV = this.convertToCSV(productsData);
        const historyCSV = this.convertToCSV(historyData);

        // Download files
        this.downloadCSV(productsCSV, 'produk.csv');
        this.downloadCSV(historyCSV, 'riwayat_stok.csv');

        this.showToast('Data berhasil diekspor', 'success');
    }

    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');
        
        return csvContent;
    }

    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'check_circle' :
                    type === 'error' ? 'error' :
                    type === 'warning' ? 'warning' : 'info';
        
        toast.innerHTML = `
            <span class="material-icons">${icon}</span>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BroStokApp();
});

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

function formatDateTime(date) {
    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}
