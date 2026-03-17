var currentUser = null;

// ===== STORAGE HELPERS =====
function getUsers() {
  var data = localStorage.getItem('users');
  return data ? JSON.parse(data) : [];
}
function saveUsers(list) { localStorage.setItem('users', JSON.stringify(list)); }

function getProducts() {
  var data = localStorage.getItem('products');
  return data ? JSON.parse(data) : [];
}
function saveProducts(list) { localStorage.setItem('products', JSON.stringify(list)); }

// ===== AUTH: LOGIN =====
function login(email, password) {
  var users = getUsers();
  for (var i = 0; i < users.length; i++) {
    if (users[i].email === email && users[i].password === password) {
      localStorage.setItem('currentUser', JSON.stringify(users[i]));
      currentUser = users[i];
      return true;
    }
  }
  return false;
}

// ===== AUTH: SIGNUP =====
function signup(name, email, password) {
  var users = getUsers();
  for (var i = 0; i < users.length; i++) {
    if (users[i].email === email) return false;
  }
  users.push({ id: Date.now(), name: name.trim(), email: email.trim(), password: password });
  saveUsers(users);
  return true;
}

// ===== AUTH: CHECK SESSION =====
function checkAuth() {
  var userStr = localStorage.getItem('currentUser');
  if (!userStr) {
    var page = window.location.pathname.split('/').pop();
    if (page === 'dashboard.html' || page === 'marketplace.html' || page === 'add-product.html') {
      window.location.href = 'index.html';
    }
    return null;
  }
  currentUser = JSON.parse(userStr);
  updateUserNameUI();
  return currentUser;
}

function updateUserNameUI() {
  if (!currentUser) return;
  var el = document.getElementById('welcomeUser');
  if (el) el.textContent = 'Hello, ' + currentUser.name + '! 👋';
  var el2 = document.getElementById('userName');
  if (el2) el2.textContent = currentUser.name;
  var el3 = document.getElementById('marketUserName');
  if (el3) el3.textContent = currentUser.name;
}

// ===== AUTH: LOGOUT =====
function logout() {
  localStorage.removeItem('currentUser');
  currentUser = null;
  window.location.href = 'index.html';
}

// ===== ADD PRODUCT =====
function addProduct(event) {
  if (event) event.preventDefault();
  if (!checkAuth()) return;
  
  var name = document.getElementById('productName') ? document.getElementById('productName').value.trim() : '';
  var price = parseFloat(document.getElementById('productPrice') ? document.getElementById('productPrice').value : 0);
  var category = document.getElementById('productCategory') ? document.getElementById('productCategory').value : '';
  var location = document.getElementById('productLocation') ? document.getElementById('productLocation').value : '';
  var contact = document.getElementById('productContact') ? document.getElementById('productContact').value.trim() : '';
  var description = document.getElementById('productDescription') ? document.getElementById('productDescription').value.trim() : 'No description';
  var imageInput = document.getElementById('productImage');
  
  if (!name || !price || !category || !location || !contact) {
    alert('Please fill all required fields');
    return;
  }
  
  var saveIt = function(imgData) {
    var product = {
      id: Date.now(),
      sellerId: currentUser.id,
      seller: currentUser.name,
      name: name,
      price: price,
      category: category,
      location: location,
      contact: contact,
      description: description,
      image: imgData || 'https://via.placeholder.com/300?text=No+Image',
      sold: false,
      views: 0,
      dateAdded: new Date().toISOString()
    };
    var all = getProducts();
    all.unshift(product);
    saveProducts(all);
    alert('Product posted!');
    window.location.href = 'dashboard.html';
  };
  
  if (imageInput && imageInput.files && imageInput.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) { saveIt(e.target.result); };
    reader.onerror = function() { saveIt(null); };
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    saveIt(null);
  }
}

// ===== DASHBOARD: Load user's products =====
function loadDashboard() {
  if (!checkAuth()) return;
  var grid = document.getElementById('productGrid');
  if (!grid) return;
  var all = getProducts();
  var mine = [];
  for (var i = 0; i < all.length; i++) {
    if (all[i].sellerId === currentUser.id) mine.push(all[i]);
  }
  renderDashboard(mine, grid);
  updateStats(mine);
}

function renderDashboard(list, container) {
  container.innerHTML = '';
  if (list.length === 0) {
    container.innerHTML = '<p class="empty" style="text-align:center;padding:40px;color:#7f8c8d">No products yet. <a href="add-product.html" style="color:var(--primary)">Add one</a></p>';
    return;
  }
  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    var statusClass = p.sold ? 'sold' : 'available';
    var statusText = p.sold ? '🟢 SOLD' : '🔵 AVAILABLE';
    var btnText = p.sold ? 'Mark Available' : 'Mark Sold';
    container.innerHTML += 
      '<div class="product-card">' +
        '<div class="card-image">' +
          '<img src="' + p.image + '" onerror="this.src=\'https://via.placeholder.com/300\'" alt="' + p.name + '">' +
          '<span class="status-badge ' + statusClass + '">' + statusText + '</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<span class="card-category">' + p.category + '</span>' +
          '<h4 class="card-title">' + p.name + '</h4>' +
          '<p class="card-price">₵' + p.price.toFixed(2) + '</p>' +
          '<p class="card-info">' + (p.description ? p.description.substring(0, 80) + (p.description.length > 80 ? '...' : '') : 'No description') + '</p>' +
          '<p class="card-location"><i class="fas fa-map-marker-alt"></i> ' + p.location + '</p>' +
          '<div class="card-actions">' +
            '<button class="btn btn-edit" onclick="toggleSold(' + p.id + ')">' + btnText + '</button>' +
            '<button class="btn btn-delete" onclick="deleteProduct(' + p.id + ')">Delete</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }
}

function updateStats(list) {
  var active = 0, sold = 0, views = 0;
  for (var i = 0; i < list.length; i++) {
    if (list[i].sold) sold++; else active++;
    views += (list[i].views || 0);
  }
  var a = document.getElementById('statActive'), s = document.getElementById('statSold'), v = document.getElementById('statViews');
  if (a) a.textContent = active;
  if (s) s.textContent = sold;
  if (v) v.textContent = views;
}

// ===== MARKETPLACE: Load all available products =====
function loadMarketplace() {
  var grid = document.getElementById('marketGrid');
  if (!grid) return;
  var all = getProducts();
  var avail = [];
  for (var i = 0; i < all.length; i++) {
    if (!all[i].sold) avail.push(all[i]);
  }
  renderMarketplace(avail, grid);
}

function renderMarketplace(list, container) {
  container.innerHTML = '';
  if (list.length === 0) {
    container.innerHTML = '<p class="empty">No items found. Be the first to post!</p>';
    return;
  }
  for (var i = 0; i < list.length; i++) {
    var p = list[i];
    container.innerHTML += 
      '<div class="product-card" onclick="viewProduct(' + p.id + ')">' +
        '<div class="card-image">' +
          '<img src="' + p.image + '" onerror="this.src=\'https://via.placeholder.com/300\'" alt="' + p.name + '">' +
        '</div>' +
        '<div class="card-body">' +
          '<span class="card-category">' + p.category + '</span>' +
          '<h4 class="card-title">' + p.name + '</h4>' +
          '<p class="card-price">₵' + p.price.toFixed(2) + '</p>' +
          '<p class="card-info">' + (p.description ? p.description.substring(0, 80) + (p.description.length > 80 ? '...' : '') : 'No description') + '</p>' +
          '<p class="card-location"><i class="fas fa-map-marker-alt"></i> ' + p.location + '</p>' +
          '<p class="card-seller">👤 ' + p.seller + '</p>' +
          '<div class="card-actions">' +
            '<button class="btn btn-contact" onclick="event.stopPropagation(); contactSeller(\'' + p.seller + '\', \'' + p.contact + '\')">💬 Contact</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }
}

// ===== PRODUCT ACTIONS =====
function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  var all = getProducts();
  for (var i = 0; i < all.length; i++) {
    if (all[i].id === id && all[i].sellerId === currentUser.id) {
      all.splice(i, 1);
      saveProducts(all);
      loadDashboard();
      alert('Deleted');
      return;
    }
  }
  alert('Not found');
}

function toggleSold(id) {
  var all = getProducts();
  for (var i = 0; i < all.length; i++) {
    if (all[i].id === id && all[i].sellerId === currentUser.id) {
      all[i].sold = !all[i].sold;
      saveProducts(all);
      loadDashboard();
      alert(all[i].sold ? 'Marked SOLD' : 'Marked AVAILABLE');
      return;
    }
  }
}

function viewProduct(id) {
  var all = getProducts();
  for (var i = 0; i < all.length; i++) {
    if (all[i].id === id) {
      all[i].views = (all[i].views || 0) + 1;
      saveProducts(all);
      alert('📦 ' + all[i].name + '\n💰 ₵' + all[i].price + '\n📍 ' + all[i].location + '\n👤 ' + all[i].seller + '\n📞 ' + all[i].contact);
      return;
    }
  }
}

function contactSeller(name, contact) {
  var phone = contact.replace(/\D/g, '');
  if (phone.length >= 10) {
    if (confirm('Open WhatsApp to contact ' + name + '?')) {
      window.open('https://wa.me/233' + phone, '_blank');
    }
  } else {
    alert('Contact ' + name + ': ' + contact);
  }
}

// ===== DASHBOARD FILTERS =====
function filterDashboard() {
  var search = (document.getElementById('dashSearch') ? document.getElementById('dashSearch').value : '').toLowerCase();
  var cat = document.getElementById('dashCategory') ? document.getElementById('dashCategory').value : 'All';
  var loc = document.getElementById('dashLocation') ? document.getElementById('dashLocation').value : 'All';
  var all = getProducts();
  var filtered = [];
  for (var i = 0; i < all.length; i++) {
    if (all[i].sellerId !== currentUser.id) continue;
    if (search && all[i].name.toLowerCase().indexOf(search) === -1 && (all[i].description || '').toLowerCase().indexOf(search) === -1) continue;
    if (cat !== 'All' && all[i].category !== cat) continue;
    if (loc !== 'All' && all[i].location !== loc) continue;
    filtered.push(all[i]);
  }
  renderDashboard(filtered, document.getElementById('productGrid'));
}

// ===== MARKETPLACE FILTERS =====
function searchMarketplace() { applyMarketplaceFilters(); }

function filterMarket(cat, btn) {
  var btns = document.querySelectorAll('.filter-btn');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  if (btn) btn.classList.add('active');
  applyMarketplaceFilters(cat);
}

function applyMarketplaceFilters(selCat) {
  var search = (document.getElementById('marketSearch') ? document.getElementById('marketSearch').value : '').toLowerCase();
  var loc = document.getElementById('marketLocation') ? document.getElementById('marketLocation').value : 'All';
  var price = document.getElementById('priceRange') ? document.getElementById('priceRange').value : 'All';
  var activeBtn = document.querySelector('.filter-btn.active');
  var cat = selCat || (activeBtn ? activeBtn.textContent.trim().replace(/^[^\s]+\s/, '') : 'All');
  
  var all = getProducts();
  var filtered = [];
  for (var i = 0; i < all.length; i++) {
    if (all[i].sold) continue;
    if (search && all[i].name.toLowerCase().indexOf(search) === -1 && (all[i].category || '').toLowerCase().indexOf(search) === -1) continue;
    if (cat !== 'All' && all[i].category !== cat) continue;
    if (loc !== 'All' && all[i].location !== loc) continue;
    if (price !== 'All') {
      var p = all[i].price;
      if (price === '0-100' && p > 100) continue;
      if (price === '100-500' && (p <= 100 || p > 500)) continue;
      if (price === '500-1000' && (p <= 500 || p > 1000)) continue;
      if (price === '1000+' && p <= 1000) continue;
    }
    filtered.push(all[i]);
  }
  renderMarketplace(filtered, document.getElementById('marketGrid'));
}

// ===== CHAT FUNCTIONS (ADDED - Missing in your original) =====
function loadMessages() {
  var list = document.getElementById('chatList');
  if (!list) return;
  // Simple placeholder - expand with real messaging later
  list.innerHTML = '<p style="padding:15px;color:#7f8c8d;text-align:center">No messages yet</p>';
}

function openChat() {
  var modal = document.getElementById('chatModal');
  if (modal) {
    modal.style.display = 'flex';
    loadMessages();
  }
}

function closeChat() {
  var modal = document.getElementById('chatModal');
  if (modal) modal.style.display = 'none';
}

function sendMessage() {
  var input = document.getElementById('chatInput');
  if (input && input.value.trim()) {
    alert('Message sent! (Chat system coming soon)');
    input.value = '';
  }
}

// Close modal when clicking outside
window.onclick = function(event) {
  var modal = document.getElementById('chatModal');
  if (modal && event.target === modal) {
    closeChat();
  }
};

// ===== AUTO-LOAD ON PAGE =====
document.addEventListener('DOMContentLoaded', function() {
  var page = window.location.pathname.split('/').pop();
  if (page === 'dashboard.html') { 
    checkAuth(); 
    loadDashboard(); 
    loadMessages();
  }
  else if (page === 'marketplace.html') { 
    checkAuth(); 
    loadMarketplace(); 
  }
});

// ===== EXPOSE FUNCTIONS TO GLOBAL SCOPE =====
window.login = login;
window.signup = signup;
window.logout = logout;
window.checkAuth = checkAuth;
window.addProduct = addProduct;
window.loadDashboard = loadDashboard;
window.loadMarketplace = loadMarketplace;
window.deleteProduct = deleteProduct;
window.toggleSold = toggleSold;
window.viewProduct = viewProduct;
window.contactSeller = contactSeller;
window.filterDashboard = filterDashboard;
window.searchMarketplace = searchMarketplace;
window.filterMarket = filterMarket;
window.applyMarketplaceFilters = applyMarketplaceFilters;
window.loadMessages = loadMessages;
window.openChat = openChat;
window.closeChat = closeChat;
window.sendMessage = sendMessage;