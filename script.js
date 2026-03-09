// ============================================
// CORE DATA
// ============================================
const myLibrary = [];

function Book(title, seasons, rating, read = false) {
    this.id = crypto.randomUUID();
    this.title = title;
    this.seasons = seasons;
    this.rating = rating;
    this.read = read;
}

function addBookToLibrary({ title, seasons, rating, read, advancedData }) {
    const book = new Book(title, seasons, rating, read);

    if (typeof window.applyAdvancedDataToBook === 'function') {
        window.applyAdvancedDataToBook(book, advancedData);
    }

    myLibrary.push(book);
}

function removeBookFromLibrary(id) {
    const index = myLibrary.findIndex((book) => book.id === id);
    if (index === -1) return;

    const [removedBook] = myLibrary.splice(index, 1);

    if (typeof window.cleanupAdvancedBookData === 'function') {
        window.cleanupAdvancedBookData(removedBook);
    }
}

function toggleBookReadStatus(id) {
    const book = myLibrary.find((item) => item.id === id);
    if (!book) return;

    if (typeof window.toggleAdvancedReadStatus === 'function') {
        const handled = window.toggleAdvancedReadStatus(book);
        if (!handled) {
            book.read = !book.read;
        }
    } else {
        book.read = !book.read;
    }
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

function getReadLabel(book) {
    if (typeof window.getAdvancedReadLabel === 'function') {
        return window.getAdvancedReadLabel(book);
    }
    return book.read ? 'Read' : 'Not read';
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
        read: formFields.status.value === 'watched',
        advancedData
    };
}

function renderLibrary() {
    showsContainer.innerHTML = '';

    myLibrary.forEach((book) => {
        const card = document.createElement('div');

        card.innerHTML = `
            <div class="show" data-book-id="${book.id}">
                <div class="show-info">
                    <h2 class="show-title">${book.title}</h2>
                    <p class="show-seasons">Seasons: ${book.seasons}</p>
                    <p class="show-rating">Rating: ${book.rating}</p>
                    ${typeof window.renderAdvancedInfo === 'function' ? window.renderAdvancedInfo(book) : ''}
                </div>
                <div class="show-actions">
                    <button class="toggleWatchedBtn" data-action="toggle" data-book-id="${book.id}">
                        ${getReadLabel(book)}
                    </button>
                    <button class="deleteBtn" data-action="delete" data-book-id="${book.id}">Delete</button>
                </div>
            </div>
        `;

        showsContainer.appendChild(card);

        if (typeof window.applyAdvancedCardStyles === 'function') {
            window.applyAdvancedCardStyles(card, book);
        }
    });
}

// ============================================
// CORE EVENTS
// ============================================
form.addEventListener('submit', (event) => {
    event.preventDefault();
    addBookToLibrary(getFormData());
    form.reset();
    toggleModal(false);
    renderLibrary();
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
    const id = target.dataset.bookId;
    if (!action || !id) return;

    if (action === 'toggle') {
        toggleBookReadStatus(id);
    }

    if (action === 'delete') {
        removeBookFromLibrary(id);
    }

    renderLibrary();
});

// ============================================
// CORE SEED DATA
// ============================================
addBookToLibrary({
    title: 'Breaking Bad',
    seasons: 5,
    rating: 9.5,
    read: true,
    advancedData: {
        status: 'watched',
        color: '#10b981',
        description: 'A chemistry teacher turned meth kingpin battles rivals and himself.',
        image: './imgs/BB.jpg'
    }
});

addBookToLibrary({
    title: 'Better Call Saul',
    seasons: 6,
    rating: 9.1,
    read: false,
    advancedData: {
        status: 'watching',
        color: '#f97316',
        description: 'The origin story of criminal lawyer Saul Goodman.',
        image: './imgs/BCS.jpg'
    }
});

addBookToLibrary({
    title: 'Brooklyn Nine-Nine',
    seasons: 8,
    rating: 8.4,
    read: false,
    advancedData: {
        status: 'not watched yet',
        color: '#22d3ee',
        description: 'A talented detective and his diverse crew solve crimes with humor.',
        image: './imgs/B99.jpg'
    }
});

renderLibrary();