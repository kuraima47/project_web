// File: backend/src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
  
    console.log(err);
  
    if (err.name === 'SequelizeUniqueConstraintError') {
      const message = Object.values(err.errors).map(val => val.message);
      error = new Error(message);
      error.statusCode = 400;
    }
  
    if (err.name === 'SequelizeValidationError') {
      const message = Object.values(err.errors).map(val => val.message);
      error = new Error(message);
      error.statusCode = 400;
    }
  
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Server Error'
    });
  };
  
  module.exports = { errorHandler };