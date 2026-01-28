// ============================================
// DATA & STATE
// ============================================
let myWatchlist = [];
let editingShowId = null;

// ============================================
// CONSTRUCTOR
// ============================================
function Show(title, seasons, rating, image, status, color, description) {
    this.id = crypto.randomUUID();
    this.title = title;
    this.seasons = seasons;
    this.rating = rating;
    this.image = image;
    this.status = status || 'not watched yet';
    this.color = color || '#a855f7';
    this.description = description || '';
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function getFormValues() {
    return {
        title: document.getElementById("showName").value,
        seasons: document.getElementById("showSeasons").value,
        rating: document.getElementById("showRating").value,
        imageFile: document.getElementById("showImg").files[0],
        status: document.getElementById("showStatus").value,
        color: document.getElementById("showColor").value || '#a855f7',
        description: document.getElementById("showDescription").value
    };
}

function toggleModal(show) {
    const overlay = document.getElementById("modalOverlay");
    const container = document.getElementById("modalContainer");
    overlay.style.display = show ? "block" : "none";
    container.style.display = show ? "block" : "none";
}

function resetForm() {
    editingShowId = null;
    document.getElementById("showForm").reset();
}

// ============================================
// SHOW OPERATIONS
// ============================================
function addShowToWatchlist() {
    const { title, seasons, rating, imageFile, status, color, description } = getFormValues();

    if (editingShowId) {
        updateShow(editingShowId, { title, seasons, rating, imageFile, status, color, description });
    } else {
        createShow({ title, seasons, rating, imageFile, status, color, description });
    }

    resetForm();
    displayShows();
}

function createShow({ title, seasons, rating, imageFile, status, color, description }) {
    const imageUrl = imageFile ? URL.createObjectURL(imageFile) : null;
    const show = new Show(title, seasons, rating, imageUrl, status, color, description);
    myWatchlist.push(show);
}

function updateShow(id, { title, seasons, rating, imageFile, status, color, description }) {
    const show = myWatchlist.find(s => s.id === id);
    if (!show) return;

    show.title = title;
    show.seasons = seasons;
    show.rating = rating;
    show.status = status || show.status;
    show.color = color || show.color;
    show.description = description || show.description;

    if (imageFile) {
        if (show.image?.startsWith("blob:")) {
            URL.revokeObjectURL(show.image);
        }
        show.image = URL.createObjectURL(imageFile);
    }

    editingShowId = null;
}

function deleteShow(id) {
    const show = myWatchlist.find(s => s.id === id);
    if (show?.image?.startsWith("blob:")) {
        URL.revokeObjectURL(show.image);
    }
    myWatchlist = myWatchlist.filter(s => s.id !== id);
    displayShows();
}

function toggleWatched(id) {
    const show = myWatchlist.find(s => s.id === id);
    if (show) {
        show.status = nextStatus(show.status);
        displayShows();
    }
}

function editShow(id) {
    const show = myWatchlist.find(s => s.id === id);
    if (!show) return;

    editingShowId = id;

    document.getElementById("showName").value = show.title;
    document.getElementById("showSeasons").value = show.seasons;
    document.getElementById("showRating").value = show.rating;
    document.getElementById("showStatus").value = show.status || 'not watched yet';
    document.getElementById("showColor").value = show.color || '#a855f7';
    document.getElementById("showDescription").value = show.description || '';

    toggleModal(true);
}

// ============================================
// DISPLAY
// ============================================
function displayShows() {
    const container = document.getElementById("shows");
    container.innerHTML = "";

    myWatchlist.forEach(show => {
        const card = document.createElement("div");
        const imageUrl = show.image || 'https://via.placeholder.com/200';

        card.innerHTML = `
            <div class="show" data-show-id="${show.id}" style="--bg-image: url('${imageUrl}')">
                <div class="show-info">
                    <h2 class="show-title">${show.title}</h2>
                    <p class="show-description">${show.description || ''}</p>
                    <p class="show-seasons">Seasons: ${show.seasons}</p>
                    <p class="show-rating">Rating: ${show.rating}</p>
                </div>
                <div class="show-actions">
                    <button class="toggleWatchedBtn" onclick="toggleWatched('${show.id}')" aria-label="Cycle status">
                        ${formatStatus(show.status)}
                    </button>
                    <button class="editBtn" onclick="editShow('${show.id}')">Edit</button>
                    <button class="deleteBtn" onclick="deleteShow('${show.id}')">Delete</button>
                </div>
            </div>
        `;
        container.appendChild(card);

        const showCard = card.querySelector('.show');
        const borderColor = show.color || '#a855f7';
        // Apply image background with gradient fade to card background
        showCard.style.borderColor = borderColor;
        showCard.style.boxShadow = `0 8px 28px ${borderColor}66`;

        // Apply border color to title
        const titleEl = card.querySelector('.show-title');
        titleEl.style.color = borderColor;

        // Apply status-based color to status button
        const statusBtn = card.querySelector('.toggleWatchedBtn');
        let statusColor;
        if (show.status === 'watched') {
            statusColor = '#10b981'; // Green
        } else if (show.status === 'watching') {
            statusColor = '#f59e0b'; // Amber/Orange
        } else {
            statusColor = '#6b7280'; // Gray
        }
        statusBtn.style.background = `linear-gradient(140deg, ${statusColor}, ${statusColor}dd)`;
        statusBtn.style.boxShadow = `0 8px 22px ${statusColor}44`;
    });
}

function formatStatus(status) {
    if (!status) return 'Not watched yet';
    if (status === 'watching') return 'Watching';
    if (status === 'watched') return 'Watched';
    return 'Not watched yet';
}

function nextStatus(current) {
    if (current === 'not watched yet') return 'watching';
    if (current === 'watching') return 'watched';
    return 'not watched yet';
}

// ============================================
// EVENT LISTENERS
// ============================================
document.getElementById("showForm").addEventListener("submit", (e) => {
    e.preventDefault();
    addShowToWatchlist();
    toggleModal(false);
});

document.querySelector(".addBtn").addEventListener("click", () => {
    resetForm();
    toggleModal(true);
});

document.querySelector(".cancelBtn")?.addEventListener("click", () => {
    resetForm();
    toggleModal(false);
});

// ============================================
// INITIALIZATION
// ============================================
const testShow = new Show("Breaking Bad", 5, 9.5, "./imgs/BB.jpg", 'watched', '#10b981', 'A chemistry teacher turned meth kingpin battles rivals and himself.');
const testShow2 = new Show("Better Call Saul", 6, 9.1, "./imgs/BCS.jpg", 'watching', '#f97316', 'The origin story of criminal lawyer Saul Goodman.');
const testShow3 = new Show("Brooklyn Nine-Nine", 8, 8.4, "./imgs/B99.jpg", 'not watched yet', '#22d3ee', 'A talented detective and his diverse crew solve crimes with humor.');
myWatchlist.push(testShow, testShow2, testShow3);

displayShows();