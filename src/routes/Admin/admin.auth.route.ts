import express, { Request, Response } from 'express'
import AdminAuthController from '../../controllers/Admin/admin.auth.controller'
import { showOutput } from '../../utils/response.util'
import { ApiResponse } from '../../utils/interfaces.util'
import middlewares from '../../middlewares'
const { verifyTokenAdmin } = middlewares.auth
const { multer, busboy } = middlewares.fileUpload

const router = express.Router()

router.post('/login', async (req: Request | any, res: Response) => {
    const { email, password, os_type } = req.body;
    const controller = new AdminAuthController(req, res)
    const result: ApiResponse = await controller.login({ email, password, os_type });
    return showOutput(res, result, result.code)
})

// router.post('/register', async (req: Request | any, res: Response) => {
//     const { first_name, last_name, email, password } = req.body;
//     const adminAuthController = new AdminAuthController(req, res)
//     const result: ApiResponse = await adminAuthController.register({ first_name, last_name, email, password });
//     return showOutput(res, result, result.code)
// })

router.post('/forgot_password', async (req: Request | any, res: Response) => {
    const { email } = req.body;
    const controller = new AdminAuthController(req, res)
    const result: ApiResponse = await controller.forgotPassword({ email });
    return showOutput(res, result, result.code)

})

router.post('/reset_password', async (req: Request | any, res: Response) => {
    const { email, new_password } = req.body;
    const controller = new AdminAuthController(req, res)
    const result: ApiResponse = await controller.resetPassword({ email, new_password });
    return showOutput(res, result, result.code)
})



router.post('/verify_otp', async (req: Request | any, res: Response) => {
    const { email, otp } = req.body;
    const controller = new AdminAuthController(req, res)
    const result: ApiResponse = await controller.verifyOtp({ email, otp });
    return showOutput(res, result, result.code)

})

router.post('/resend_otp', async (req: Request | any, res: Response) => {
    const { email } = req.body;
    const controller = new AdminAuthController(req, res)
    const result: ApiResponse = await controller.resendOtp({ email });
    return showOutput(res, result, result.code)

})


router.post('/change_password', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { old_password, new_password } = req.body;
    const controller = new AdminAuthController(req, res)
    const result: ApiResponse = await controller.changePassword({ old_password, new_password });
    return showOutput(res, result, result.code)

})

router.get('/details', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const controller = new AdminAuthController(req, res)
    const result: ApiResponse = await controller.getAdminDetails();
    return showOutput(res, result, result.code)

})

router.put('/profile', multer.addToMulter.single('profile_pic'), verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { first_name, last_name, phone_number, country_code, greet_msg } = req.body
    const controller = new AdminAuthController(req, res)
    const result: ApiResponse = await controller.updateAdminProfile(first_name, last_name, phone_number, country_code, greet_msg, req.file);
    return showOutput(res, result, result.code)

})

//upload multiple files with busboy and redis queue
router.post('/upload_files', busboy.addToBusboy, async (req: Request | any, res: Response) => {
    const { media_type } = req.body
    const controller = new AdminAuthController(req, res)
    console.log(req.files, "req.filesss")
    const result: ApiResponse = await controller.uploadFiles(media_type, req.files);
    return showOutput(res, result, result.code)

})

router.post('/refresh_token', multer.addToMulter.none(), async (req: Request | any, res: Response) => {
    const { refresh_token } = req.body
    const controller = new AdminAuthController(req, res)
    const result: ApiResponse = await controller.refreshToken(refresh_token);
    return showOutput(res, result, result.code)

})


router.post('/logout', async (req: Request | any, res: Response) => {
    const userAuthController = new AdminAuthController(req, res)
    const result: ApiResponse = await userAuthController.logoutUser();
    return showOutput(res, result, result.code)

})


export default router
