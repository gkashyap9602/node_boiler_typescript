import express, { Request, Response } from 'express'
import CommonController from '../../controllers/Common/common.controller'
import { showOutput } from '../../utils/response.util'
import { ApiResponse } from '../../utils/interfaces.util'
import middlewares from '../../middlewares'
let { verifyTokenBoth } = middlewares.auth

const router = express.Router()

router.get('/get_common_content', verifyTokenBoth, async (req: Request | any, res: Response) => {
    const commonController = new CommonController(req, res)
    const result: ApiResponse = await commonController.getCommonContent();
    return showOutput(res, result, result.code)

})

router.get('/get_questions', verifyTokenBoth, async (req: Request | any, res: Response) => {
    const commonController = new CommonController(req, res)
    const result: ApiResponse = await commonController.getQuestions();
    return showOutput(res, result, result.code)

})


module.exports = router
