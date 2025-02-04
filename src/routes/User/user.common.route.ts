import express, { Request, Response } from 'express'
import UserCommonController from '../../controllers/User/user.common.controller'
import { showOutput } from '../../utils/response.util'
import { ApiResponse } from '../../utils/interfaces.util'

const router = express.Router()

router.post('/contactus/fill', async (req: Request | any, res: Response) => {
    const { name, email, message } = req.body;
    const controller = new UserCommonController(req, res)
    const result: ApiResponse = await controller.contactUs({ name, email, message });
    return showOutput(res, result, result.code)
})

router.get('/product/search', async (req: Request | any, res: Response) => {
    const { product_name, country, result_per_page, page_number } = req.query;
    const controller = new UserCommonController(req, res)
    const result: ApiResponse = await controller.searchProduct(product_name, country, result_per_page, page_number);
    return showOutput(res, result, result.code)
})

router.get('/product/details', async (req: Request | any, res: Response) => {
    const { product_id } = req.query;
    const controller = new UserCommonController(req, res)
    const result: ApiResponse = await controller.getProductDetails(product_id);
    return showOutput(res, result, result.code)
})


export default router
