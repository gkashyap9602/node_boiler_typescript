import express, { Request, Response } from 'express'
import UserAuthController from '../../controllers/User/user.auth.controller'
import { showOutput } from '../../utils/response.util'
import { ApiResponse } from '../../utils/interfaces.util'
import middlewares from '../../middlewares'
const { verifyTokenUser } = middlewares.auth
const { multer } = middlewares.fileUpload

const router = express.Router()

router.post('/login', async (req: Request | any, res: Response) => {
    const { email, password } = req.body;
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.login({ email, password });
    return showOutput(res, result, result.code)
})

// router.post('/social_login', multer.addToMulter.none(), async (req: Request | any, res: Response) => {
//     const { login_source, social_auth, email, name, user_type, os_type } = req.body;
//     const userAuthController = new UserAuthController(req, res)
//     const result: ApiResponse = await userAuthController.socialLogin(login_source, social_auth, email, user_type, name, os_type);
//     return showOutput(res, result, result.code)
// })

router.post('/register', multer.addToMulter.single('profile_pic'), async (req: Request | any, res: Response) => {
    const { first_name, last_name, email, password, phone_number, country_code } = req.body;
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.register(first_name, last_name, email, password, phone_number, country_code, req.file);
    return showOutput(res, result, result.code)
})

router.post('/forgot_password', async (req: Request | any, res: Response) => {
    const { email } = req.body;
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.forgotPassword({ email });
    return showOutput(res, result, result.code)
})

router.post('/reset_password', async (req: Request | any, res: Response) => {
    const { email, new_password, otp } = req.body;
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.resetPassword({ email, new_password, otp });
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


router.delete('/delete_deactivate', verifyTokenUser, async (req: Request | any, res: Response) => {
    const { status } = req.body
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.deleteOrDeactivateAccount({ status });
    return showOutput(res, result, result.code)

})


router.post('/refresh_token', multer.addToMulter.none(), async (req: Request | any, res: Response) => {
    const { refresh_token } = req.body
    const commonController = new UserAuthController(req, res)
    const result: ApiResponse = await commonController.refreshToken(refresh_token);
    return showOutput(res, result, result.code)
})

router.post('/logout', async (req: Request | any, res: Response) => {
    const userAuthController = new UserAuthController(req, res)
    const result: ApiResponse = await userAuthController.logoutUser();
    return showOutput(res, result, result.code)
})

router.post('/upload_file', multer.addToMulter.single('file'), async (req: Request | any, res: Response) => {
    const controller = new UserAuthController(req, res)
    const result: ApiResponse = await controller.uploadFile(req.file as Express.Multer.File);
    return showOutput(res, result, result.code)

})

export default router
