import { validate } from "../validations/validation.js";

const runValidation = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = validate(schema, req.body);

            req.body = validatedData;

            next();
        } catch (e) {
            next(e);
        }
    }
}

export { runValidation };