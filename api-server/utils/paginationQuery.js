async function paginateQuery(query, { page = 1, limit = 10, sort = { createAt: -1 } } = {}) {
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    if (!query?.model || typeof query.getQuery !== 'function') {
        throw new Error("Invalid query passed to paginateQuery.");
    }

    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
        query.model.countDocuments(query.getQuery()),
        query.sort(sort).skip(skip).limit(limit).exec()
    ]);

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
}

module.exports = paginateQuery;
