const formatTimeByContext = (inputDate) => {
    const date = new Date(inputDate);
    const now = new Date();

    const isSameDay = date.toDateString() === now.toDateString();
    const isSameYear = date.getFullYear() === now.getFullYear();

    if (isSameDay) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isSameYear) {
        return date.toLocaleDateString([], {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
        });
    } else {
        return date.toLocaleDateString([], {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    }
};

export default formatTimeByContext;