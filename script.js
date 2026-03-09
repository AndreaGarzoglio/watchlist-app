// ============================================
// SHOW CLASS
// ============================================
class Show {
    constructor(title, seasons, rating, image, status, color, description) {
        this.id = crypto.randomUUID();
        this.title = title;
        this.seasons = seasons;
        this.rating = rating;
        this.image = image;
        this.status = status || 'not watched yet';
        this.color = color || '#a855f7';
        this.description = description || '';
    }

    formatStatus() {
        if (!this.status) return 'Not watched yet';
        if (this.status === 'watching') return 'Watching';
        if (this.status === 'watched') return 'Watched';
        return 'Not watched yet';
    }

    nextStatus() {
        if (this.status === 'not watched yet') return 'watching';
        if (this.status === 'watching') return 'watched';
        return 'not watched yet';
    }

    cycleStatus() {
        this.status = this.nextStatus();
    }
}

// ============================================
// WATCHLIST CLASS
// ============================================
class Watchlist {
    constructor() {
        this.shows = [];
        this.editingShowId = null;
    }

    addShow(showData) {
        if (this.editingShowId) {
            this.updateShow(this.editingShowId, showData);
        } else {
            this.createShow(showData);
        }
        this.editingShowId = null;
    }

    createShow({ title, seasons, rating, imageFile, status, color, description }) {
        const imageUrl = imageFile ? URL.createObjectURL(imageFile) : null;
        const show = new Show(title, seasons, rating, imageUrl, status, color, description);
        this.shows.push(show);
    }

    updateShow(id, { title, seasons, rating, imageFile, status, color, description }) {
        const show = this.shows.find(s => s.id === id);
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
    }

    deleteShow(id) {
        const show = this.shows.find(s => s.id === id);
        if (show?.image?.startsWith("blob:")) {
            URL.revokeObjectURL(show.image);
        }
        this.shows = this.shows.filter(s => s.id !== id);
    }

    getShowById(id) {
        return this.shows.find(s => s.id === id);
    }

    toggleShowStatus(id) {
        const show = this.getShowById(id);
        if (show) {
            show.cycleStatus();
        }
    }
}

// ============================================
// UI CLASS
// ============================================
class UI {
    constructor(watchlist) {
        this.watchlist = watchlist;
        this.modalOverlay = document.getElementById("modalOverlay");
        this.modalContainer = document.getElementById("modalContainer");
        this.form = document.getElementById("showForm");
        this.showsContainer = document.getElementById("shows");
        this.addBtn = document.querySelector(".addBtn");
        this.cancelBtn = document.querySelector(".cancelBtn");
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.addEventListener("submit", (e) => this.handleFormSubmit(e));
        this.addBtn.addEventListener("click", () => this.openModal());
        this.cancelBtn?.addEventListener("click", () => this.closeModal());
    }

    getFormValues() {
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

    handleFormSubmit(e) {
        e.preventDefault();
        const formValues = this.getFormValues();
        this.watchlist.addShow(formValues);
        this.resetForm();
        this.closeModal();
        this.render();
    }

    openModal() {
        this.resetForm();
        this.toggleModal(true);
    }

    closeModal() {
        this.toggleModal(false);
    }

    toggleModal(show) {
        this.modalOverlay.style.display = show ? "block" : "none";
        this.modalContainer.style.display = show ? "block" : "none";
    }

    resetForm() {
        this.watchlist.editingShowId = null;
        this.form.reset();
    }

    openEditModal(id) {
        const show = this.watchlist.getShowById(id);
        if (!show) return;

        this.watchlist.editingShowId = id;

        document.getElementById("showName").value = show.title;
        document.getElementById("showSeasons").value = show.seasons;
        document.getElementById("showRating").value = show.rating;
        document.getElementById("showStatus").value = show.status || 'not watched yet';
        document.getElementById("showColor").value = show.color || '#a855f7';
        document.getElementById("showDescription").value = show.description || '';

        this.toggleModal(true);
    }

    render() {
        this.showsContainer.innerHTML = "";

        this.watchlist.shows.forEach(show => {
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
                        <button class="toggleWatchedBtn" onclick="ui.toggleStatus('${show.id}')" aria-label="Cycle status">
                            ${show.formatStatus()}
                        </button>
                        <button class="editBtn" onclick="ui.editShow('${show.id}')">Edit</button>
                        <button class="deleteBtn" onclick="ui.deleteShow('${show.id}')">Delete</button>
                    </div>
                </div>
            `;
            this.showsContainer.appendChild(card);

            const showCard = card.querySelector('.show');
            const borderColor = show.color || '#a855f7';
            showCard.style.borderColor = borderColor;
            showCard.style.boxShadow = `0 8px 28px ${borderColor}66`;

            const titleEl = card.querySelector('.show-title');
            titleEl.style.color = borderColor;

            const statusBtn = card.querySelector('.toggleWatchedBtn');
            let statusColor;
            if (show.status === 'watched') {
                statusColor = '#10b981';
            } else if (show.status === 'watching') {
                statusColor = '#f59e0b';
            } else {
                statusColor = '#6b7280';
            }
            statusBtn.style.background = `linear-gradient(140deg, ${statusColor}, ${statusColor}dd)`;
            statusBtn.style.boxShadow = `0 8px 22px ${statusColor}44`;
        });
    }

    toggleStatus(id) {
        this.watchlist.toggleShowStatus(id);
        this.render();
    }

    editShow(id) {
        this.openEditModal(id);
    }

    deleteShow(id) {
        this.watchlist.deleteShow(id);
        this.render();
    }
}

// ============================================
// INITIALIZATION
// ============================================
const watchlist = new Watchlist();
const ui = new UI(watchlist);

const testShow = new Show("Breaking Bad", 5, 9.5, "./imgs/BB.jpg", 'watched', '#10b981', 'A chemistry teacher turned meth kingpin battles rivals and himself.');
const testShow2 = new Show("Better Call Saul", 6, 9.1, "./imgs/BCS.jpg", 'watching', '#f97316', 'The origin story of criminal lawyer Saul Goodman.');
const testShow3 = new Show("Brooklyn Nine-Nine", 8, 8.4, "./imgs/B99.jpg", 'not watched yet', '#22d3ee', 'A talented detective and his diverse crew solve crimes with humor.');
watchlist.shows.push(testShow, testShow2, testShow3);

ui.render();