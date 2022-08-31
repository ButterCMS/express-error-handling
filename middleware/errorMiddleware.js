const AppError = require("../utils/appError");

// BCM = ButterCMS
const handleInvalidTokenBCMS = () => {
  const message = "The authorization token is invalid";
  return new AppError(message, 401);
};

const handleNotFoundErrors = () => {
  const message = "The requested resource could not be found";
  return new AppError(message, 404);
};

const handleAuthorErrorBCMS = (authorsArr = []) => {
  const authors = authorsArr.map((author) => author.split(" ")[0]).join(", ");
  const message = `The author${authors.includes(",") ? "s" : ""} (${authors}) do not exist on your CMS`;
  return new AppError(message, 400);
};

const handleInvalidRequest = () => {
  const message = "The request is invalid";
  return new AppError(message, 400);
};

const handleExistingSlug = (slug) => {
  const message = slug[0];
  return new AppError(message, 400);
};

// handles productional error
const productionError = (err, res) => {
  // operational error: send message to client about the error
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Sends a generic message to the client about the error
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

// Handles development errore
// sends back the error message, and additional information about the error
const developmentError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

// exports the function that handles the error
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    developmentError(err, res);
  }

  if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    console.log("\n\n------ begin: ------");
    console.log("ERROR: ", error);
    console.log("------ end: ------\n\n");

    if (error?.response?.status === 401) {
      error = handleInvalidTokenBCMS();
    }

    if (error?.response?.status === 400 && error?.response?.data?.hasOwnProperty("author")) {
      error = handleAuthorErrorBCMS(error.response.data.author);
    }
    if (error?.response?.status === 400 && error?.response?.data?.hasOwnProperty("slug")) {
      error = handleExistingSlug(error.response.data.slug);
    }

    if (error?.response?.status === 404) {
      error = handleNotFoundErrors();
    }

    if (error?.response?.status === 400) {
      error = handleInvalidRequest();
    }

    productionError(error, res);
  }
};
