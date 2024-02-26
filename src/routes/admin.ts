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

router.post('/register', async (req: Request | any, res: Response) => {
    const { first_name, last_name, email, password } = req.body;
    const adminController = new AdminController(req, res)
    const result: ApiResponse = await adminController.register({ first_name, last_name, email, password });
    return showOutput(res, result, result.code)
})

router.post('/forgot_password', async (req: Request | any, res: Response) => {
    const { email, mode } = req.body;
    const adminController = new AdminController(req, res)
    const result: ApiResponse = await adminController.forgotPassword({ email });
    return showOutput(res, result, result.code)

})

router.post('/change_password', async (req: Request | any, res: Response) => {
    const { old_password, new_password } = req.body;
    const adminController = new AdminController(req, res)
    const result: ApiResponse = await adminController.changePassword({ old_password, new_password });
    return showOutput(res, result, result.code)

})

router.post('/verify_otp', async (req: Request | any, res: Response) => {
    const { email, otp } = req.body;
    const adminController = new AdminController(req, res)
    const result: ApiResponse = await adminController.verifyOtp({ email, otp });
    return showOutput(res, result, result.code)

})

router.post('/resend_otp', async (req: Request | any, res: Response) => {
    const { email } = req.body;
    const adminController = new AdminController(req, res)
    const result: ApiResponse = await adminController.resendOtp({ email });
    return showOutput(res, result, result.code)

})

router.post('/reset_password', async (req: Request | any, res: Response) => {
    const { email } = req.body;
    const adminController = new AdminController(req, res)
    const result: ApiResponse = await adminController.resendOtp({ email });
    return showOutput(res, result, result.code)
})

router.get('/get_user_details', async (req: Request | any, res: Response) => {
    const adminController = new AdminController(req, res)
    const result: ApiResponse = await adminController.getUserDetails();
    return showOutput(res, result, result.code)

})


module.exports = router
