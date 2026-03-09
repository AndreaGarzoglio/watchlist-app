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

    window.applyShowVisualEnhancements = function (card, show) {
        const showCard = card.querySelector('.show');
        const titleEl = card.querySelector('.show-title');
        const statusBtn = card.querySelector('.toggleWatchedBtn');

        if (!showCard || !titleEl || !statusBtn) return;

        const borderColor = show.color || DEFAULT_COLOR;
        const statusColor = getStatusColor(show.status);

        showCard.style.borderColor = borderColor;
        showCard.style.boxShadow = `0 8px 28px ${borderColor}66`;

        titleEl.style.color = borderColor;

        statusBtn.style.background = `linear-gradient(140deg, ${statusColor}, ${statusColor}dd)`;
        statusBtn.style.boxShadow = `0 8px 22px ${statusColor}44`;
    };
})();
