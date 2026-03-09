// ============================================
// SHOW CLASS
// ============================================
const DEFAULT_COLOR = '#a855f7';

class Show {
    constructor(title, seasons, rating, image, status, color, description) {
        this.id = crypto.randomUUID();
        this.title = title;
        this.seasons = seasons;
        this.rating = rating;
        this.image = image;
        this.status = status || 'not watched yet';
        this.color = color || DEFAULT_COLOR;
        this.description = description || '';
    }

    formatStatus() {
        const labels = {
            'not watched yet': 'Not watched yet',
            watching: 'Watching',
            watched: 'Watched'
        };
        return labels[this.status] || labels['not watched yet'];
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
        this.formFields = {
            title: document.getElementById("showName"),
            seasons: document.getElementById("showSeasons"),
            rating: document.getElementById("showRating"),
            image: document.getElementById("showImg"),
            status: document.getElementById("showStatus"),
            color: document.getElementById("showColor"),
            description: document.getElementById("showDescription")
        };
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.addEventListener("submit", (e) => this.handleFormSubmit(e));
        this.addBtn.addEventListener("click", () => this.openModal());
        this.cancelBtn?.addEventListener("click", () => this.closeModal());
    }

    getFormValues() {
        return {
            title: this.formFields.title.value,
            seasons: this.formFields.seasons.value,
            rating: this.formFields.rating.value,
            imageFile: this.formFields.image.files[0],
            status: this.formFields.status.value,
            color: this.formFields.color.value || DEFAULT_COLOR,
            description: this.formFields.description.value
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

        this.formFields.title.value = show.title;
        this.formFields.seasons.value = show.seasons;
        this.formFields.rating.value = show.rating;
        this.formFields.status.value = show.status || 'not watched yet';
        this.formFields.color.value = show.color || DEFAULT_COLOR;
        this.formFields.description.value = show.description || '';

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

            if (typeof window.applyShowVisualEnhancements === 'function') {
                window.applyShowVisualEnhancements(card, show);
            }
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