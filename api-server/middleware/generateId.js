const generateGroupMessId = (groupId, lastMessSeq) => {
    return `${groupId}_${String(lastMessSeq).padStart(6, '0')}`;
}

const generateConversationId = (list) => {
    const sortedList = [...list].sort();
    return `${sortedList[0]}_${sortedList[1]}`;
}

module.exports = { generateGroupMessId, generateConversationId };