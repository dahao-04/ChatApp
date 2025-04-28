const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error."

    if(!err.isOperational) {
        console.log("Unexpected error: ", err);
        message = "Some thing went wrong.";
    }

    res.status(statusCode).json({
        success: false,
        message
    })
}

module.exports = errorHandler