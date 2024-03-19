import express, { Request, Response } from 'express'
import AdminUserController from '../../controllers/Admin/admin.user.controller'
import { showOutput } from '../../utils/response.util'
import { ApiResponse } from '../../utils/interfaces.util'
// import { authenticate } from '../middlewares/auth.middleware'
// import { verifyTokenAdmin } from '../middlewares/auth.middleware'
import middlewares from '../../middlewares'
let { verifyTokenAdmin } = middlewares.auth
let { addToMulter } = middlewares.fileUpload.multer

const router = express.Router()


router.get('/details', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { user_id } = req.query;
    const adminUserController = new AdminUserController(req, res)
    const result: ApiResponse = await adminUserController.getUserDetails(user_id);
    return showOutput(res, result, result.code)

})
router.get('/list', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { sort_column, sort_direction, page, limit, search_key, status } = req.query
    const adminUserController = new AdminUserController(req, res)
    const result: ApiResponse = await adminUserController.getUsersList(sort_column, sort_direction, page, limit, search_key, status);
    return showOutput(res, result, result.code)

})

router.put('/status', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { user_id, status } = req.body
    const adminUserController = new AdminUserController(req, res)
    const result: ApiResponse = await adminUserController.updateUserStatus({ user_id, status });
    return showOutput(res, result, result.code)

})

router.get('/dashboard', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { past_day } = req.query
    const adminUserController = new AdminUserController(req, res)
    const result: ApiResponse = await adminUserController.getDashboardData(past_day);
    return showOutput(res, result, result.code)

})



export default router
