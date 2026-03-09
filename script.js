// ============================================
// CORE DATA
// ============================================
const myWatchlist = [];

function Show(title, seasons, rating, watched = false) {
    this.id = crypto.randomUUID();
    this.title = title;
    this.seasons = seasons;
    this.rating = rating;
    this.watched = watched;
}

function addShowToWatchlist({ title, seasons, rating, watched, advancedData }) {
    const show = new Show(title, seasons, rating, watched);

    if (typeof window.applyAdvancedDataToShow === 'function') {
        window.applyAdvancedDataToShow(show, advancedData);
    } else if (typeof window.applyAdvancedDataToBook === 'function') {
        window.applyAdvancedDataToBook(show, advancedData);
    }

    myWatchlist.push(show);
}

function removeShowFromWatchlist(id) {
    const index = myWatchlist.findIndex((show) => show.id === id);
    if (index === -1) return;

    const [removedShow] = myWatchlist.splice(index, 1);

    if (typeof window.cleanupAdvancedShowData === 'function') {
        window.cleanupAdvancedShowData(removedShow);
    } else if (typeof window.cleanupAdvancedBookData === 'function') {
        window.cleanupAdvancedBookData(removedShow);
    }
}

function toggleShowWatchedStatus(id) {
    const show = myWatchlist.find((item) => item.id === id);
    if (!show) return;

    if (typeof window.toggleAdvancedWatchedStatus === 'function') {
        const handled = window.toggleAdvancedWatchedStatus(show);
        if (!handled) {
            show.watched = !show.watched;
        }
        return;
    }

    if (typeof window.toggleAdvancedReadStatus === 'function') {
        const handled = window.toggleAdvancedReadStatus(show);
        if (!handled) {
            show.watched = !show.watched;
        }
        return;
    }

    show.watched = !show.watched;
}

// ============================================
// CORE UI
// ============================================
const form = document.getElementById('showForm');
const showsContainer = document.getElementById('shows');
const addBtn = document.querySelector('.addBtn');
const cancelBtn = document.querySelector('.cancelBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modalContainer = document.getElementById('modalContainer');

const formFields = {
    title: document.getElementById('showName'),
    seasons: document.getElementById('showSeasons'),
    rating: document.getElementById('showRating'),
    status: document.getElementById('showStatus'),
    color: document.getElementById('showColor'),
    description: document.getElementById('showDescription'),
    image: document.getElementById('showImg')
};

function toggleModal(show) {
    modalOverlay.style.display = show ? 'block' : 'none';
    modalContainer.style.display = show ? 'block' : 'none';
}

function getWatchedLabel(show) {
    if (typeof window.getAdvancedWatchedLabel === 'function') {
        return window.getAdvancedWatchedLabel(show);
    }
    if (typeof window.getAdvancedReadLabel === 'function') {
        return window.getAdvancedReadLabel(show);
    }
    return show.watched ? 'Watched' : 'Not watched yet';
}

function getFormData() {
    const advancedData =
        typeof window.getAdvancedFormData === 'function'
            ? window.getAdvancedFormData(formFields)
            : {};

    return {
        title: formFields.title.value.trim(),
        seasons: formFields.seasons.value,
        rating: formFields.rating.value,
        watched: formFields.status.value === 'watched',
        advancedData
    };
}

function renderShows() {
    showsContainer.innerHTML = '';

    myWatchlist.forEach((show) => {
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
                        ${getWatchedLabel(show)}
                    </button>
                    <button class="deleteBtn" data-action="delete" data-show-id="${show.id}">Delete</button>
                </div>
            </div>
        `;

        showsContainer.appendChild(card);

        if (typeof window.applyAdvancedCardStyles === 'function') {
            window.applyAdvancedCardStyles(card, show);
        }
    });
}

// ============================================
// CORE EVENTS
// ============================================
form.addEventListener('submit', (event) => {
    event.preventDefault();
    addShowToWatchlist(getFormData());
    form.reset();
    toggleModal(false);
    renderShows();
});

addBtn.addEventListener('click', () => {
    form.reset();
    toggleModal(true);
});

cancelBtn?.addEventListener('click', () => {
    form.reset();
    toggleModal(false);
});

showsContainer.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const action = target.dataset.action;
    const id = target.dataset.showId;
    if (!action || !id) return;

    if (action === 'toggle') {
        toggleShowWatchedStatus(id);
    }

    if (action === 'delete') {
        removeShowFromWatchlist(id);
    }

    renderShows();
});

// ============================================
// CORE SEED DATA
// ============================================
addShowToWatchlist({
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

addShowToWatchlist({
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

addShowToWatchlist({
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

renderShows();