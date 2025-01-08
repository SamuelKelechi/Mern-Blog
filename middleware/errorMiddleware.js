//Unsupported (404) routes
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
}

// Middleware to handle Errors
const errorHandler = (err, req, res, next) => {
    console.error(err);

    // Handle Multer-specific errors
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            message: "Unexpected file field. Please ensure the file key is 'image'."
        });
    }

    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        message: err.message || "An unexpected error occurred.",
    });
};


module.exports = {notFound, errorHandler}