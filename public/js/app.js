const socket = io();
const noteId = 'default-capture-note'; // Hardcoded scope for single-note architecture
const noteList = document.getElementById('note-list');
const newItemText = document.getElementById('new-item-text');
const addBtn = document.getElementById('add-btn');
const imageUpload = document.getElementById('image-upload');

let items = [];

// Initialize Room & Fetch History
socket.emit('joinNote', noteId);
fetch(`/api/notes/${noteId}`)
  .then(res => res.json())
  .then(data => {
    items = JSON.parse(data.content || '[]');
    renderList();
  });

// Handle External Updates
socket.on('noteUpdated', (newContent) => {
  items = JSON.parse(newContent);
  renderList();
});

// Initialize Drag & Drop
new Sortable(noteList, {
  animation: 150,
  onEnd: () => {
    updateStateFromDOM();
    broadcastUpdate();
  }
});

// DOM Rendering Engine
function renderList() {
  noteList.innerHTML = '';
  items.forEach((item, index) => {
    const li = document.createElement('li');
    if (item.type === 'text') {
        li.innerHTML = `
            <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleCheck(${index})">
            <span class="${item.checked ? 'checked-text' : ''}">${item.text}</span>
            <button class="delete-btn" onclick="removeItem(${index})">X</button>
        `;
    } else if (item.type === 'image') {
        li.innerHTML = `
            <img src="${item.url}" alt="Capture">
            <button class="delete-btn" onclick="removeItem(${index})">X</button>
        `;
    }
    noteList.appendChild(li);
  });
}

// State Management
function broadcastUpdate() {
  socket.emit('editNote', { noteId, content: JSON.stringify(items) });
}

function updateStateFromDOM() {
  const newItems = [];
  noteList.querySelectorAll('li').forEach(li => {
      const checkbox = li.querySelector('input[type="checkbox"]');
      const span = li.querySelector('span');
      const img = li.querySelector('img');
      
      if (img) newItems.push({ type: 'image', url: img.src });
      else if (span && checkbox) newItems.push({ type: 'text', text: span.innerText, checked: checkbox.checked });
  });
  items = newItems;
}

window.toggleCheck = (index) => {
  items[index].checked = !items[index].checked;
  renderList();
  broadcastUpdate();
};

window.removeItem = (index) => {
  items.splice(index, 1);
  renderList();
  broadcastUpdate();
};

// Input Handlers
addBtn.addEventListener('click', () => {
  if (newItemText.value.trim()) {
    items.push({ type: 'text', text: newItemText.value, checked: false });
    newItemText.value = '';
    renderList();
    broadcastUpdate();
  }
});

imageUpload.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  const formData = new FormData();
  formData.append('image', file);
  
  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  const data = await res.json();
  
  items.push({ type: 'image', url: data.imageUrl });
  renderList();
  broadcastUpdate();
});
