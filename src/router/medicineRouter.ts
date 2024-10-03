import { Router } from "express";
import { createValidation, updateValidation } from "../middleware/medicineValidation";
import { createMedicine, deleteMedicine, readMedicine, updateMedicine } from "../controller/medicineController";
import { uploadMedicinePhoto } from "../middleware/uploadMedicinePhoto";
import { verifyToken } from "../middleware/authorization";
const router = Router()

// router for add new medicine 
router.post(`/`, [verifyToken, uploadMedicinePhoto.single(`photo`), createValidation], createMedicine )

// route for read medicine, untuk read
router.get(`/`, [verifyToken], readMedicine)

// route for update medicine 
router.put(`/:id`, [verifyToken, uploadMedicinePhoto.single(`photo`), updateValidation], updateMedicine )

// route for remove medicine
router.delete(`/:id`,[verifyToken], deleteMedicine)

export default router