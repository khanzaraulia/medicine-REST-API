import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import path from "path";
import fs from "fs";
import { ROOT_DIRECTORY } from "../config";

// create  a rule/schema for update new medicine 
const createSchema = Joi.object({
    name: Joi.string().required(),
    stock: Joi.number().min(0).required(),
    price: Joi.number().min(1).required(),
    exp_date: Joi.date().required(),
    type: Joi.string()
        .valid("Syrup", "Tablet", "Powder")
})

const createValidation = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const validate = createSchema.validate(req.body)
    if (validate.error) {
        // delete current uploaded file
        let filename: string = req.file?.filename || ``
        let pathfile: string = path.join(ROOT_DIRECTORY, "public", "medicine-photo", filename)
        // check is file exist
        let fileExists = fs.existsSync(pathfile)
        // apakah file yang akan dihapus
        if (fileExists && filename !== ``) {
            // delete file
            fs.unlinkSync(pathfile)
        }
        return res.status(400)
            .json({
                message: validate.error.details.map(item => item.message).join()
            })
    }
    return next()
}

// create  a rule/schema for update new medicine 
const updateSchema = Joi.object({
    name: Joi.string().optional(),
    stock: Joi.number().min(0).optional(),
    price: Joi.number().min(1).optional(),
    exp_date: Joi.date().optional(),
    type: Joi.string()
        .valid("Syrup", "Tablet", "Powder").optional()
})

const updateValidation = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const validate = updateSchema.validate(req.body)
    if (validate.error) {
         // delete current uploaded file
         let filename: string = req.file?.filename || ``
         let pathfile: string = path.join(ROOT_DIRECTORY, "public", "medicine-photo", filename)
         // check is file exist
         let fileExists = fs.existsSync(pathfile)
         // apakah ada file yang akan dihapus
         if (fileExists && filename !== ``) {
             // delete file
             fs.unlinkSync(pathfile)
         }                                                     
        return res.status(400)
            .json({
                message: validate.error.details.map(item => item.message).join()
            })
    }
    return next()
}
export { createValidation, updateValidation }