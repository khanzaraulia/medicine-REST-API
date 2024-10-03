import Express from "express";
import MedicineRoute  from "./router/medicineRouter"
import AdminRoute from "./router/adminRouter"
import TransactionRoute from "./router/transactionRouter"

// allow
const app = Express()

app.use(Express.json())

app.use(`/medicine`, MedicineRoute)
app.use(`/admin`, AdminRoute)
app.use(`/transaction`, TransactionRoute)

const PORT = 1992
app.listen(PORT, () => {
    console.log(`Server Drugstore run on port ${PORT}`)
})
