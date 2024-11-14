import express, { Request, Response } from 'express'
import AdminUserController from '../../controllers/Admin/admin.user.controller'
import { showOutput } from '../../utils/response.util'
import { ApiResponse } from '../../utils/interfaces.util'
import middlewares from '../../middlewares'
const { verifyTokenAdmin } = middlewares.auth

const router = express.Router()

router.get('/list', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { sort_column, sort_direction, page, limit, search_key, status } = req.query
    const controller = new AdminUserController(req, res)
    const result: ApiResponse = await controller.getUsersList(sort_column, sort_direction, page, limit, search_key, status);
    return showOutput(res, result, result.code)

})

router.get('/details', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { user_id } = req.query;
    const controller = new AdminUserController(req, res)
    const result: ApiResponse = await controller.getUserDetails(user_id);
    return showOutput(res, result, result.code)

})

router.put('/status', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { user_id, status } = req.body
    const controller = new AdminUserController(req, res)
    const result: ApiResponse = await controller.updateUserStatus({ user_id, status });
    return showOutput(res, result, result.code)

})

router.get('/dashboard', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { past_day } = req.query
    const controller = new AdminUserController(req, res)
    const result: ApiResponse = await controller.getDashboardData(past_day);
    return showOutput(res, result, result.code)

})



export default router
