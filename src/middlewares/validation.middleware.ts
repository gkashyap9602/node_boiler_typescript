import { Request, Response, NextFunction } from 'express'


export const validationError = async (res: Response, error: any) => {
    const code = 403;
    const validationErrors = error.message.replace(new RegExp('\\"', "g"), "");
    // const validationErrors = error.details.map((error) => error.message.replace(new RegExp('\\"', "g"), ""));
    return res.status(code).json({
        status: false,
        statusCode: code,
        validationFailed: true,
        message: validationErrors,
    });
};


export const validator = (schema: any) => {

    return function (req: Request, res: Response, next: NextFunction) {
        try {
            if (schema.body) {
                const { error, value } = schema.body.validate(req.body);
                if (error) throw error;
                req.body = value;
                next()
            }
            else if (schema.query) {
                const { error, value } = schema.query.validate(req.query);
                if (error) throw error;
                req.query = value;
                next()
            }
            else {
                const { error, value } = schema.params.validate(req.params);
                if (error) throw error;
                req.params = value;
                next()
            }
        } catch (error) {
            return validationError(res, error);
        }
    }
}

export default { validator }