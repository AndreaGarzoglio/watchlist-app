// ============================================
// VISUAL ENHANCEMENTS
// ============================================
(function () {
    const DEFAULT_COLOR = '#a855f7';

    function getStatusColor(status) {
        const statusColors = {
            watched: '#10b981',
            watching: '#f59e0b',
            'not watched yet': '#6b7280'
        };
        return statusColors[status] || statusColors['not watched yet'];
    }

    window.getAdvancedFormData = function (formFields) {
        const imageFile = formFields.image?.files?.[0];
        return {
            status: formFields.status?.value || 'not watched yet',
            color: formFields.color?.value || DEFAULT_COLOR,
            description: formFields.description?.value || '',
            image: imageFile ? URL.createObjectURL(imageFile) : null
        };
    };

    window.applyAdvancedDataToBook = function (book, advancedData = {}) {
        book.status = advancedData.status || 'not watched yet';
        book.color = advancedData.color || DEFAULT_COLOR;
        book.description = advancedData.description || '';
        book.image = advancedData.image || null;
    };

    window.cleanupAdvancedBookData = function (book) {
        if (book?.image?.startsWith('blob:')) {
            URL.revokeObjectURL(book.image);
        }
    };

    window.toggleAdvancedReadStatus = function (book) {
        if (!book || !book.status) return false;

        if (book.status === 'not watched yet') {
            book.status = 'watching';
        } else if (book.status === 'watching') {
            book.status = 'watched';
        } else {
            book.status = 'not watched yet';
        }

        book.read = book.status === 'watched';
        return true;
    };

    window.getAdvancedReadLabel = function (book) {
        const labels = {
            'not watched yet': 'Not watched yet',
            watching: 'Watching',
            watched: 'Watched'
        };
        return labels[book.status] || (book.read ? 'Read' : 'Not read');
    };

    window.renderAdvancedInfo = function (book) {
        return `<p class="show-description">${book.description || ''}</p>`;
    };

    window.applyAdvancedCardStyles = function (card, book) {
        const showCard = card.querySelector('.show');
        const titleEl = card.querySelector('.show-title');
        const statusBtn = card.querySelector('.toggleWatchedBtn');

        if (!showCard || !titleEl || !statusBtn) return;

        const borderColor = book.color || DEFAULT_COLOR;
        const statusColor = getStatusColor(book.status);
        const imageUrl = book.image || 'https://via.placeholder.com/200';

        showCard.style.setProperty('--bg-image', `url('${imageUrl}')`);

        showCard.style.borderColor = borderColor;
        showCard.style.boxShadow = `0 8px 28px ${borderColor}66`;

        titleEl.style.color = borderColor;

        statusBtn.style.background = `linear-gradient(140deg, ${statusColor}, ${statusColor}dd)`;
        statusBtn.style.boxShadow = `0 8px 22px ${statusColor}44`;
    };
})();
