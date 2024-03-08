import express, { Request, Response } from 'express'
import CommonController from '../../controllers/Common/common.controller'
import { showOutput } from '../../utils/response.util'
import { ApiResponse } from '../../utils/interfaces.util'
import middlewares from '../../middlewares'
let { verifyTokenBoth } = middlewares.auth
let { addToMulter } = middlewares.fileUpload.multer

const router = express.Router()

router.post('/store_paramter_to_store', addToMulter.single('any'), verifyTokenBoth, async (req: Request | any, res: Response) => {
    const { name, value } = req.body
    const commonController = new CommonController(req, res)
    const result: ApiResponse = await commonController.storeParameterToStore(name, value);
    return showOutput(res, result, result.code)

})

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
