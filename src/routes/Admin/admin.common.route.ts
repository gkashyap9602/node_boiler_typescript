import express, { Request, Response } from 'express'
import AdminCommonController from '../../controllers/Admin/admin.common.controller'
import { showOutput } from '../../utils/response.util'
import { ApiResponse } from '../../utils/interfaces.util'
// import { authenticate } from '../middlewares/auth.middleware'
// import { verifyTokenAdmin } from '../middlewares/auth.middleware'
import middlewares from '../../middlewares'
let { verifyTokenAdmin } = middlewares.auth
let { addToMulter } = middlewares.fileUpload.multer

const router = express.Router()


router.post('/question', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { question, answer } = req.body;
    const adminCommonController = new AdminCommonController(req, res)
    const result: ApiResponse = await adminCommonController.addQuestion({ question, answer });
    return showOutput(res, result, result.code)

})

router.put('/question', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { answer, question, question_id } = req.body;
    const adminCommonController = new AdminCommonController(req, res)
    const result: ApiResponse = await adminCommonController.updateQuestion({ answer, question, question_id });
    return showOutput(res, result, result.code)

})

router.put('/common_content', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { about, privacy_policy, terms_conditions } = req.body;
    const adminCommonController = new AdminCommonController(req, res)
    const result: ApiResponse = await adminCommonController.updateCommonContent({ about, privacy_policy, terms_conditions });
    return showOutput(res, result, result.code)

})

export default router
