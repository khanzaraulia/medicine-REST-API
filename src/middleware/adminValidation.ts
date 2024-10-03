import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const createSchema = Joi.object({
    nama_admin : Joi.string().required(),
    password : Joi.string().required(),
    email : Joi.string().required()
})

const createValidate =  (
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    const validation = createSchema.validate(req.body)
    if(validation.error){
        return res.status(400)
        .json({
            message: validation.error.details.map(item => item.message).join()
        })
    } 
    return next()
}

const updateSchema = Joi.object({
    nama_admin : Joi.string().optional(),
    password : Joi.string().optional(),
    email : Joi.string().optional()
})

const updateValidate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const validate = updateSchema.validate(req.body)
    if (validate.error) {
        return res.status(400)
            .json({
                message: validate.error.details.map(item => item.message).join()
            })
    }
    return next()
}

const authSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})

const authValidation =  (
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
const validate = authSchema.validate(req.body)
    if (validate.error) {
        return res.status(400)
            .json({
                message: validate.error.details.map(item => item.message).join()
            })
    }
    return next()
}

export { createValidate, updateValidate, authValidation }
