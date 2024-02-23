import express, { Request, Response } from 'express'
const router = express.Router()

import AdminController from '../controllers/admin.controller'
// import { authenticate } from '../middlewares/auth.middleware'
import { showOutput } from '../utils/response.util'
import { ApiResponse } from '../utils/Interfaces/showResponse'

router.post('/login', async (req: Request | any, res: Response) => {
    const { email, password } = req.body;
    const adminController = new AdminController(req, res)
    const result: ApiResponse = await adminController.login({ email, password });

    return showOutput(res, result, result.code)
})


module.exports = router
