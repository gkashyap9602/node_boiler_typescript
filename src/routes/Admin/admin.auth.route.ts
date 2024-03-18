import express, { Request, Response } from 'express'
import AdminAuthController from '../../controllers/Admin/admin.auth.controller'
import { showOutput } from '../../utils/response.util'
import { ApiResponse } from '../../utils/interfaces.util'
// import { authenticate } from '../middlewares/auth.middleware'
// import { verifyTokenAdmin } from '../middlewares/auth.middleware'
import middlewares from '../../middlewares'
let { verifyTokenAdmin } = middlewares.auth
let { addToMulter } = middlewares.fileUpload.multer

const router = express.Router()

router.post('/login', async (req: Request | any, res: Response) => {
    const { email, password, os_type } = req.body;
    const adminAuthController = new AdminAuthController(req, res)
    const result: ApiResponse = await adminAuthController.login({ email, password, os_type });
    return showOutput(res, result, result.code)
})

// router.post('/register', async (req: Request | any, res: Response) => {
//     const { first_name, last_name, email, password } = req.body;
//     const adminAuthController = new AdminAuthController(req, res)
//     const result: ApiResponse = await adminAuthController.register({ first_name, last_name, email, password });
//     return showOutput(res, result, result.code)
// })

router.post('/forgot_password', async (req: Request | any, res: Response) => {
    const { email, mode } = req.body;
    const adminAuthController = new AdminAuthController(req, res)
    const result: ApiResponse = await adminAuthController.forgotPassword({ email });
    return showOutput(res, result, result.code)

})

router.post('/reset_password', async (req: Request | any, res: Response) => {
    const { email, new_password } = req.body;
    const adminAuthController = new AdminAuthController(req, res)
    const result: ApiResponse = await adminAuthController.resetPassword({ email, new_password });
    return showOutput(res, result, result.code)
})



router.post('/verify_otp', async (req: Request | any, res: Response) => {
    const { email, otp } = req.body;
    const adminAuthController = new AdminAuthController(req, res)
    const result: ApiResponse = await adminAuthController.verifyOtp({ email, otp });
    return showOutput(res, result, result.code)

})

router.post('/resend_otp', async (req: Request | any, res: Response) => {
    const { email } = req.body;
    const adminAuthController = new AdminAuthController(req, res)
    const result: ApiResponse = await adminAuthController.resendOtp({ email });
    return showOutput(res, result, result.code)

})


router.post('/change_password', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { old_password, new_password } = req.body;
    const adminAuthController = new AdminAuthController(req, res)
    const result: ApiResponse = await adminAuthController.changePassword({ old_password, new_password });
    return showOutput(res, result, result.code)

})

router.get('/details', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const adminAuthController = new AdminAuthController(req, res)
    const result: ApiResponse = await adminAuthController.getAdminDetails();
    return showOutput(res, result, result.code)

})

router.put('/profile', addToMulter.single('profile_pic'), verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { first_name, last_name, phone_number, country_code, greet_msg } = req.body
    const adminAuthController = new AdminAuthController(req, res)
    const result: ApiResponse = await adminAuthController.updateAdminProfile(first_name, last_name, phone_number, country_code, greet_msg, req.file);
    return showOutput(res, result, result.code)

})


export default router
