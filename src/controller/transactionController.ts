import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    errorFormat: `minimal`
})

type transactionDetail = {
    medicine_id: number,
    qty: number
}
const createTransaction = async (req: Request, res: Response) => {
    try {
        // read a request data 
        const cashier_name: string =
            req.body.cashier_name
        const order_date: Date =
            new Date(req.body.order_date)
        const transaction_detail: transactionDetail[] =
            req.body.transaction_detail

        // checking medicine (memastikan id obat tersedia)
        // mengumpulkan id obat yang dikirimkan 
        const arrMedicineId = transaction_detail
            .map(item => item.medicine_id)
        // check medicine id at medicine table 
        const findMedicine = await prisma.medicine.findMany({
            where: {
                id: { in: arrMedicineId }
            }
        })
        // check id obat yang tidak tersedia 
        const notFoundMedicine = arrMedicineId
            .filter(item =>
                !findMedicine
                    .map(obat => obat.id)
                    .includes(item)
            )

        if (notFoundMedicine.length > 0) {
            return res.status(200)
                .json({
                    message: `There are medicine not exists`
                })
        }
        // save transaction data 
        const newTransaction = await prisma.transaction.create({
            data: {
                cashier_name, order_date
            }
        })

        // prepare data for transaction_detail
        let newDetail = []
        for (let index = 0; index < transaction_detail.length; index++) {
            const {
                medicine_id, qty
            } = transaction_detail[index]

            // find price at each medicine 
            const medicineItem = findMedicine.find(item => item.id == medicine_id)

            // push data to array 
            newDetail.push({
                transaction_id: newTransaction.id,
                medicine_id,
                qty,
                order_price: medicineItem?.price || 0
            })
        }

        // save transaction detail 
        await prisma.transaction_detail
            .createMany({
                data: newDetail
            })
        return res.status(200)
            .json({
                message: `New transaction has created`
            })

    } catch (error) {
        console.log(error);
        return res.status(500)
            .json(error)
    }
}

const readTransaction = async (
    req: Request,
    res: Response
) => {
    try {
        // read start date and end date for filtering data
        const start_date = new Date(
            req.query.start_date?.toString() || ``
        )
        const end_date = new Date(
            req.query.end_date?.toString() || ``
        )
        // mendapatkan seluruh data transaksi 
        // sekaligus detail di tiap transaksinya 
        let allTransaction = await prisma
            .transaction.findMany({
                include: {
                    transaction_detail: {
                        include: { medicine_detail: true }
                    }
                },
                orderBy: { order_date: "desc"}
            })

            if(req.query.start_date && req.query.end_date) {
                allTransaction = allTransaction
                .filter(trans => 
                    trans.order_date >= start_date 
                    && 
                    trans.order_date <= end_date
                )
            }

        // menentukan total harga di setiap transaksi
        allTransaction = allTransaction
            .map(trans => {
                let total = trans.transaction_detail
                    .reduce((jumlah, detail) =>
                        jumlah + (detail.order_price * detail.qty),
                        0)
                return {
                    ...trans, total
                }
            })
        return res.status(200)
            .json({
                message: `Transaction has been retrieved`,
                data: allTransaction
            })
    } catch (error) {
        return res.status(500)
            .json({
                message: error
            })
    }
}


const deleteTransaction = async (
    req: Request, res: Response
) => {
    try {
        const { id } = req.params

        const findTransaction = await prisma
            .transaction
            .findFirst({ where: { id: Number(id) } })
        if (!findTransaction) {
            return res.status(400)
                .json({
                    message: `Transaction is not found`
                })
        }
        // hapus detail transaksi dulu, karena
        // detail transaksi adalah tabel yang tergantung pada 
        // tabel transaksi 
        await prisma.transaction_detail
            .deleteMany({
                where: { transaction_id: Number(id) }
            })
        await prisma.transaction
            .delete({ where: { id: Number(id) } })

    } catch (error) {
        return res.status(500)
            .json(error)
    }
}

const updateTransaction = async (req: Request, res: Response) => {
    try {
        // read id transaction from req params
        const { id } = req.params
        // check that transaction exists based on "id"
        const findTransaction = await prisma
            .transaction.findFirst({
                where: { id: Number(id) },
                include: { transaction_detail: true }
            })
        if (!findTransaction) {
            return res.status(400)
                .json({
                    message: `Transaction is not found`
                })
        }

        // read a request data 
        const cashier_name: string =
            req.body.cashier_name || findTransaction.cashier_name
        const order_date: Date =
            new Date(req.body.order_date || findTransaction.order_date)
        const transaction_detail: transactionDetail[] =
            req.body.transaction_detail || findTransaction.transaction_detail

        // find transaction based on transaction id
        await prisma.transaction_detail
            .deleteMany({
                where: { transaction_id: Number(id) }
            })
        // checking medicine (memastikan id obat tersedia)

        // mengumpulkan id obat yang dikirimkan 
        const arrMedicineId = transaction_detail
            .map(item => item.medicine_id)
        // check medicine id at medicine table 
        const findMedicine = await prisma.medicine.findMany({
            where: {
                id: { in: arrMedicineId }
            }
        })
        // check id obat yang tidak tersedia 
        const notFoundMedicine = arrMedicineId
            .filter(item =>
                !findMedicine
                    .map(obat => obat.id)
                    .includes(item)
            )

        if (notFoundMedicine.length > 0) {
            return res.status(200)
                .json({
                    message: `There are medicine not exists`
                })
        }
        // save transaction data 
        const saveTransaction = await prisma
            .transaction
            .update({
                where: {
                    id: Number(id)
                },
                data: {
                    cashier_name, order_date
                }
            })

        // prepare data for transaction_detail
        let newDetail = []
        for (let index = 0; index < transaction_detail.length; index++) {
            const {
                medicine_id, qty
            } = transaction_detail[index]

            // find price at each medicine 
            const medicineItem = findMedicine.find(item => item.id == medicine_id)

            // push data to array 
            newDetail.push({
                transaction_id: saveTransaction.id,
                medicine_id,
                qty,
                order_price: medicineItem?.price || 0
            })
        }

        // save transaction detail 
        await prisma.transaction_detail
            .createMany({
                data: newDetail
            })
        return res.status(200)
            .json({
                message: `New transaction has been updated`
            })

    } catch (error) {
        console.log(error);
        return res.status(500)
            .json(error)
    }
}


export { createTransaction, readTransaction, deleteTransaction, updateTransaction }