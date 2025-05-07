const errorHandler = (err, req, res, next) => {
    let status = err.status || 500;
    let message = err.message || "Internal Server Error."
    let code = err.code || "INTERNAL_ERROR"

    if(!err.isOperational) {
        console.log("Unexpected error: ", err);
        message = "Some thing went wrong.";
    }

    res.status(status).json({
        success: false,
        message,
        code
    })
}

module.exports = errorHandler