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

    window.applyAdvancedDataToShow = function (show, advancedData = {}) {
        show.status = advancedData.status || 'not watched yet';
        show.color = advancedData.color || DEFAULT_COLOR;
        show.description = advancedData.description || '';
        show.image = advancedData.image || null;
        show.watched = show.status === 'watched';
        show.read = show.watched;
    };

    window.applyAdvancedDataToBook = window.applyAdvancedDataToShow;

    window.cleanupAdvancedShowData = function (show) {
        if (show?.image?.startsWith('blob:')) {
            URL.revokeObjectURL(show.image);
        }
    };

    window.cleanupAdvancedBookData = window.cleanupAdvancedShowData;

    window.toggleAdvancedWatchedStatus = function (show) {
        if (!show || !show.status) return false;

        if (show.status === 'not watched yet') {
            show.status = 'watching';
        } else if (show.status === 'watching') {
            show.status = 'watched';
        } else {
            show.status = 'not watched yet';
        }

        show.watched = show.status === 'watched';
        show.read = show.watched;
        return true;
    };

    window.toggleAdvancedReadStatus = window.toggleAdvancedWatchedStatus;

    window.getAdvancedWatchedLabel = function (show) {
        const labels = {
            'not watched yet': 'Not watched yet',
            watching: 'Watching',
            watched: 'Watched'
        };
        return labels[show.status] || (show.watched ? 'Watched' : 'Not watched yet');
    };

    window.getAdvancedReadLabel = window.getAdvancedWatchedLabel;

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
