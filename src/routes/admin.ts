import express, { Request, Response } from 'express'
import AdminController from '../controllers/admin.controller'
import { showOutput } from '../utils/response.util'
import { ApiResponse } from '../utils/interfaces.util'
// import { authenticate } from '../middlewares/auth.middleware'
import { verifyTokenAdmin } from '../middlewares/auth.middleware'
const router = express.Router()

router.post('/login', async (req: Request | any, res: Response) => {
    const { email, password } = req.body;
    const adminController = new AdminController(req, res)
    const result: ApiResponse = await adminController.login({ email, password });

    return showOutput(res, result, result.code)
})


module.exports = router
