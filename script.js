// ============================================
// SHOW CLASS
// ============================================
class Show {
    constructor(title, seasons, rating, watched = false) {
        this.id = crypto.randomUUID();
        this.title = title;
        this.seasons = seasons;
        this.rating = rating;
        this.watched = watched;
    }

    toggleWatchedStatus() {
        this.watched = !this.watched;
    }
}

// ============================================
// WATCHLIST CLASS
// ============================================
class Watchlist {
    constructor() {
        this.shows = [];
    }

    addShow({ title, seasons, rating, watched, advancedData }) {
        const show = new Show(title, seasons, rating, watched);

        if (typeof window.applyAdvancedDataToShow === 'function') {
            window.applyAdvancedDataToShow(show, advancedData);
        }

        this.shows.push(show);
    }

    removeShow(id) {
        const index = this.shows.findIndex((show) => show.id === id);
        if (index === -1) return;

        const [removedShow] = this.shows.splice(index, 1);

        if (typeof window.cleanupAdvancedShowData === 'function') {
            window.cleanupAdvancedShowData(removedShow);
        }
    }

    toggleShowStatus(id) {
        const show = this.shows.find((item) => item.id === id);
        if (!show) return;

        if (typeof window.toggleAdvancedWatchedStatus === 'function') {
            const handled = window.toggleAdvancedWatchedStatus(show);
            if (!handled) show.toggleWatchedStatus();
            return;
        }

        show.toggleWatchedStatus();
    }
}

// ============================================
// UI CLASS
// ============================================
class WatchlistUI {
    constructor(watchlist) {
        this.watchlist = watchlist;
        this.form = document.getElementById('showForm');
        this.showsContainer = document.getElementById('shows');
        this.addBtn = document.querySelector('.addBtn');
        this.cancelBtn = document.querySelector('.cancelBtn');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.modalContainer = document.getElementById('modalContainer');
        this.formFields = {
            title: document.getElementById('showName'),
            seasons: document.getElementById('showSeasons'),
            rating: document.getElementById('showRating'),
            status: document.getElementById('showStatus'),
            color: document.getElementById('showColor'),
            description: document.getElementById('showDescription'),
            image: document.getElementById('showImg')
        };

        this.setupEvents();
    }

    setupEvents() {
        this.form.addEventListener('submit', (event) => {
            event.preventDefault();

            const error = this.validateForm();
            if (error) {
                alert(error);
                return;
            }


            this.watchlist.addShow(this.getFormData());
            this.form.reset();
            this.toggleModal(false);
            this.render();
        });

        this.addBtn.addEventListener('click', () => {
            this.form.reset();
            this.toggleModal(true);
        });

        this.cancelBtn?.addEventListener('click', () => {
            this.form.reset();
            this.toggleModal(false);
        });

        this.showsContainer.addEventListener('click', (event) => {
            const target = event.target;
            if (!(target instanceof HTMLElement)) return;

            const action = target.dataset.action;
            const id = target.dataset.showId;
            if (!action || !id) return;

            if (action === 'toggle') this.watchlist.toggleShowStatus(id);
            if (action === 'delete') this.watchlist.removeShow(id);

            this.render();
        });
    }

    toggleModal(show) {
        this.modalOverlay.style.display = show ? 'block' : 'none';
        this.modalContainer.style.display = show ? 'block' : 'none';
    }

    validateForm() {
        if (!this.formFields.title.value.trim()) {
            return 'Please enter a show title';
        }

        if (!this.formFields.seasons.value || this.formFields.seasons.value <= 0) {
            return 'Seasons must be a positive number';
        }

        if (!this.formFields.rating.value || this.formFields.rating.value < 0 || this.formFields.rating.value > 10) {
            return 'Rating must be between 0 and 10';
        }

        return null;
    }

    getWatchedLabel(show) {
        if (typeof window.getAdvancedWatchedLabel === 'function') {
            return window.getAdvancedWatchedLabel(show);
        }
        return show.watched ? 'Watched' : 'Not watched yet';
    }

    getFormData() {
        const advancedData =
            typeof window.getAdvancedFormData === 'function'
                ? window.getAdvancedFormData(this.formFields)
                : {};

        return {
            title: this.formFields.title.value.trim(),
            seasons: this.formFields.seasons.value,
            rating: this.formFields.rating.value,
            watched: this.formFields.status.value === 'watched',
            advancedData
        };
    }

    render() {
        this.showsContainer.innerHTML = '';

        this.watchlist.shows.forEach((show) => {
            const card = document.createElement('div');

            card.innerHTML = `
                <div class="show" data-show-id="${show.id}">
                    <div class="show-info">
                        <h2 class="show-title">${show.title}</h2>
                        <p class="show-seasons">Seasons: ${show.seasons}</p>
                        <p class="show-rating">Rating: ${show.rating}</p>
                        ${typeof window.renderAdvancedInfo === 'function' ? window.renderAdvancedInfo(show) : ''}
                    </div>
                    <div class="show-actions">
                        <button class="toggleWatchedBtn" data-action="toggle" data-show-id="${show.id}">
                            ${this.getWatchedLabel(show)}
                        </button>
                        <button class="deleteBtn" data-action="delete" data-show-id="${show.id}">Delete</button>
                    </div>
                </div>
            `;

            this.showsContainer.appendChild(card);

            if (typeof window.applyAdvancedCardStyles === 'function') {
                window.applyAdvancedCardStyles(card, show);
            }
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================
const watchlist = new Watchlist();
const ui = new WatchlistUI(watchlist);

watchlist.addShow({
    title: 'Breaking Bad',
    seasons: 5,
    rating: 9.5,
    watched: true,
    advancedData: {
        status: 'watched',
        color: '#10b981',
        description: 'A chemistry teacher turned meth kingpin battles rivals and himself.',
        image: './imgs/BB.jpg'
    }
});

watchlist.addShow({
    title: 'Better Call Saul',
    seasons: 6,
    rating: 9.1,
    watched: false,
    advancedData: {
        status: 'watching',
        color: '#f97316',
        description: 'The origin story of criminal lawyer Saul Goodman.',
        image: './imgs/BCS.jpg'
    }
});

watchlist.addShow({
    title: 'Brooklyn Nine-Nine',
    seasons: 8,
    rating: 8.4,
    watched: false,
    advancedData: {
        status: 'not watched yet',
        color: '#22d3ee',
        description: 'A talented detective and his diverse crew solve crimes with humor.',
        image: './imgs/B99.jpg'
    }
});

ui.render();