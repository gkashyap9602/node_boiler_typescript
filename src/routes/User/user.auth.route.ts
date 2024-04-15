import express, { Request, Response } from 'express'
import UserAuthController from '../../controllers/User/user.auth.controller'
import { showOutput } from '../../utils/response.util'
import { ApiResponse } from '../../utils/interfaces.util'
import middlewares from '../../middlewares'
const { verifyTokenUser } = middlewares.auth
const { multer } = middlewares.fileUpload

const router = express.Router()

router.post('/login', async (req: Request | any, res: Response) => {
    const { email, password, os_type } = req.body;
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.login({ email, password, os_type });
    return showOutput(res, result, result.code)
})

router.post('/register', multer.addToMulter.single('profile_pic'), async (req: Request | any, res: Response) => {
    const { first_name, last_name, email, password, phone_number, country_code, os_type } = req.body;
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.register(first_name, last_name, email, password, os_type, phone_number, country_code, req.file);
    return showOutput(res, result, result.code)
})


router.post('/upload_file', multer.addToMulter.single('file'), async (req: Request | any, res: Response) => {
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.uploadFile(req.file as Express.Multer.File);
    return showOutput(res, result, result.code)

})

router.post('/forgot_password', async (req: Request | any, res: Response) => {
    const { email } = req.body;
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.forgotPassword({ email });
    return showOutput(res, result, result.code)

})

router.post('/reset_password', async (req: Request | any, res: Response) => {
    const { email, new_password } = req.body;
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.resetPassword({ email, new_password });
    return showOutput(res, result, result.code)
})



router.post('/verify_otp', async (req: Request | any, res: Response) => {
    const { email, otp } = req.body;
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.verifyOtp({ email, otp });
    return showOutput(res, result, result.code)

})

router.post('/resend_otp', async (req: Request | any, res: Response) => {
    const { email } = req.body;
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.resendOtp({ email });
    return showOutput(res, result, result.code)

})


router.post('/change_password', verifyTokenUser, async (req: Request | any, res: Response) => {
    const { old_password, new_password } = req.body;
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.changePassword({ old_password, new_password });
    return showOutput(res, result, result.code)

})

router.get('/details', verifyTokenUser, async (req: Request | any, res: Response) => {
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.getUserDetails();
    return showOutput(res, result, result.code)

})

router.put('/profile', multer.addToMulter.single('profile_pic'), verifyTokenUser, async (req: Request | any, res: Response) => {
    const { first_name, last_name, phone_number, country_code } = req.body
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.updateUserProfile(first_name, last_name, phone_number, country_code, req.file);
    return showOutput(res, result, result.code)

})



export default router
