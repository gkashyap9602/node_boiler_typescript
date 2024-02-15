import express, { Request, Response } from 'express'
import AdminController from '../controllers/admin.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { responseWithStatus } from '../utils/response.util'
const router = express.Router()

router.post('/login', async (req: Request | any, res: Response) => {
    const { email, password } = req.body;
    const controller = new AdminController(req, res)
    const response = await controller.login({ email, password });
    const { status } = response;
    return responseWithStatus(res, status, response)
})
router.post('/test', async (req: Request | any, res: Response) => {
    const { email, password } = req.body;
    const controller = new AdminController(req, res)
    const response = await controller.login({ email, password });
    const { status } = response;
    return responseWithStatus(res, status, response)
})



module.exports = router
