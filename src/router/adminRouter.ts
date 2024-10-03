import { Router } from "express";
import { authValidation, createValidate, updateValidate } from "../middleware/adminValidation";
import { authentication, createAdmin, deleteAdmin, readAdmin, updateAdmin } from "../controller/adminController";
const router = Router()

router.post(`/`, [createValidate], createAdmin )

router.get(`/`,readAdmin )

router.put(`/:id`, [updateValidate], updateAdmin )

router.delete(`/:id`,deleteAdmin)

router.post(`/auth`, [authValidation], authentication)

export default router