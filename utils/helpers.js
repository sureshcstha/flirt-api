const sanitizeHtml = require("sanitize-html");

// Function to sanitize inputs
const sanitizeInput = (input) => sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} });

module.exports = { sanitizeInput };