const { validationResult } = require('express-validator');

/**
 * Middleware factory — runs a chain of express-validator rules, then
 * collects errors and returns 422 if any exist. Pass this before your
 * controller so the controller is only called with validated data.
 *
 * Usage:
 *   router.post('/register', validate([body('email').isEmail()]), register);
 */
const validate = (rules) => async (req, res, next) => {
  await Promise.all(rules.map((rule) => rule.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;
