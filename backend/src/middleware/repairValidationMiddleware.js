// backend/src/middleware/repairValidationMiddleware.js

export const validateCreateRepair = (req, res, next) => {
  const {
    deviceType,
    brand,
    model,
    issue,
    problemDescription,
    fullName,
    phoneNumber
  } = req.body;

  const errors = [];

  if (!deviceType) errors.push("Device type is required");
  if (!brand) errors.push("Brand is required");
  if (!model) errors.push("Model is required");
  if (!issue) errors.push("Issue is required");
  if (!problemDescription) errors.push("Problem description is required");
  if (!fullName) errors.push("Full name is required");
  if (!phoneNumber) errors.push("Phone number is required");

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(", ")
    });
  }

  next();
};
