import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

const prisma = new PrismaClient({ errorFormat: "minimal" })

const createAdmin = async (req: Request, res: Response) => {
    try {
        const { nama_admin, email, password } = req.body
        const findEmail = await prisma.admin
            .findFirst({ where: { email } })
        if (findEmail) {
            return res.status(400)
                .json({ message: `Email has exists` })
        }
        const hashPassword = await bcrypt.hash(password, 12)
        const newAdmin = await prisma.admin.create({
            data: {
                nama_admin,
                email,
                password: hashPassword
            }
        })
        return res.status(200)
            .json({
                message: `New admin has been created`,
                data: newAdmin
            })
    } catch (error) {
        return res.status(500)
            .json(error)
    }
}

const readAdmin = async (
    req: Request,
    res: Response
) => {
    try {
        const search = req.query.search
        const allAdmin = await prisma.admin
            .findMany({
                where: {
                    OR: [
                        {
                            nama_admin: {
                                contains: search?.toString() || ""
                            }
                        }
                    ]
                }
            })
        return res.status(200)
            .json({
                message: "admin has been retrivied",
                data: allAdmin
            })
    } catch (error) {
        res.status(500)
            .json(error)
    }
}

const updateAdmin = async (req: Request, res: Response) => {
    try {
        const id = req.params.id

        const findAdmin = await prisma.admin.findFirst({
            where: { id: Number(id) }
        })
        if (!findAdmin) {
            return res.status(200)
                .json({
                    message: `Admin is not found `
                })
        }
        const {
            nama_admin, email, password
        } = req.body

        const saveAdmin = await prisma.admin
            .update({
                where: { id: Number(id) },
                data: {
                    nama_admin: nama_admin ? nama_admin : findAdmin.nama_admin,
                    email: email ? email : findAdmin.email,
                    password: password ?
                        await bcrypt.hash(password, 12)
                        : findAdmin.password,
                }
            })
        return res.status(200)
            .json({
                message: `Admin has been updated`,
                data: saveAdmin
            })
    } catch (error) {
        return res.status(500)
            .json(error)
    }
}

const deleteAdmin = async (req: Request, res: Response) => {
    try {
        const id = req.params.id

        const findAdmin = await prisma.admin
            .findFirst({
                where: { id: Number(id) }
            })

        if (!findAdmin) {
            return res.status(200)
                .json({
                    message: `Admin is not found`
                })
        }
        const saveAdmin = await prisma.admin
            .delete({
                where: { id: Number(id) }
            })
        return res.status(200)
            .json({
                message: `Admin has been removed`,
                data: saveAdmin
            })

    } catch (error) {
        console.log(error);

        return res.status(500)
            .json(error)
    }
}

// function for login (authentication)
const authentication = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        // check existing email
        const findAdmin = await prisma.admin.findFirst({
            where: { email }
        })
        if (!findAdmin) {
            return res.status(200)
                .json({
                    message: `Email is not registered`
                })
        }

        const isMatchPassword = await bcrypt.compare(password, findAdmin.password)
        if (!isMatchPassword) {
            return res.status(200)
                .json({
                    message: `Invalid passwword`
                })
        }

        // prepare to generate token using JWT
        const payload = {
            name: findAdmin.nama_admin,
            email: findAdmin.email
        }
        const signature = process.env.SECRET ||""

        const token = jwt.sign(payload, signature)
        return res.status(200)
            .json({
                logged: true,
                token,
                id: findAdmin.id,
                name: findAdmin.nama_admin,
                email: findAdmin.email
            })


    } catch (error) {
        return res
            .status(500)
            .json(error)
    }
}
export { createAdmin, readAdmin, updateAdmin, deleteAdmin, authentication }
