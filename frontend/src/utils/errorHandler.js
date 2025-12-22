/**
 * Parses an error object and returns a user-friendly error message.
 * @param {Error} error - The error object to parse.
 * @param {string} defaultMessage - A fallback message if no specific error message is found.
 * @returns {string} A user-friendly error message.
 */
export const getErrorMessage = (error, defaultMessage = "Something went wrong") => {
  if (!error) return defaultMessage;

  // 1. Check for backend response error message (Axios)
  if (error.response && error.response.data && error.response.data.message) {
    const backendMsg = error.response.data.message;
    // You can add logic here to filter out specific technical backend messages if needed
    return backendMsg;
  }

  // 2. Check for common technical error strings in error.message
  const message = error.message || "";
  
  if (message.toLowerCase().includes("network error")) {
    return "Unable to connect to the server. Please check your internet connection.";
  }
  
  if (message.includes("timeout")) {
    return "The request timed out. Please try again.";
  }
  
  if (message.includes("500")) {
    return "Server error. Please try again later.";
  }

  if (message.includes("404")) {
    return "Requested resource not found.";
  }

  // 3. If it's a string, just return it (assuming it's already a message)
  if (typeof error === "string") {
    return error;
  }

  // 4. Check for standard Error object message if it's not purely technical
  // (This is a bit heuristic; sometimes err.message IS technical, like "Unexpected token...")
  if (message && !message.includes("Unexpected token") && !message.includes("JSON")) {
    return message;
  }

  return defaultMessage;
};
