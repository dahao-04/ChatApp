const formatTimeByContext = (inputDate) => {
    const date = new Date(inputDate);

    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default formatTimeByContext;