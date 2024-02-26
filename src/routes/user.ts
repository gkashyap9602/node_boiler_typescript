import express, { Request, Response } from 'express'
import UserController from '../controllers/user.controller'
import { showOutput } from '../utils/response.util'
import { ApiResponse } from '../utils/interfaces.util'
import middlewares from '../middlewares'
let { verifyTokenUser } = middlewares.auth

const router = express.Router()

router.post('/login', async (req: Request | any, res: Response) => {
    const { email, password } = req.body;
    const userController = new UserController(req, res)
    const result: ApiResponse = await userController.login({ email, password });
    return showOutput(res, result, result.code)
})

router.post('/register', async (req: Request | any, res: Response) => {
    const { first_name, last_name, email, password } = req.body;
    const userController = new UserController(req, res)
    const result: ApiResponse = await userController.register({ first_name, last_name, email, password });
    return showOutput(res, result, result.code)
})

router.post('/forgot_password', async (req: Request | any, res: Response) => {
    const { email, mode } = req.body;
    const userController = new UserController(req, res)
    const result: ApiResponse = await userController.forgotPassword({ email });
    return showOutput(res, result, result.code)

})

router.post('/reset_password', async (req: Request | any, res: Response) => {
    const { email, new_password } = req.body;
    const userController = new UserController(req, res)
    const result: ApiResponse = await userController.resetPassword({ email, new_password });
    return showOutput(res, result, result.code)
})



router.post('/verify_otp', async (req: Request | any, res: Response) => {
    const { email, otp } = req.body;
    const userController = new UserController(req, res)
    const result: ApiResponse = await userController.verifyOtp({ email, otp });
    return showOutput(res, result, result.code)

})

router.post('/resend_otp', async (req: Request | any, res: Response) => {
    const { email } = req.body;
    const userController = new UserController(req, res)
    const result: ApiResponse = await userController.resendOtp({ email });
    return showOutput(res, result, result.code)

})


router.post('/change_password', verifyTokenUser, async (req: Request | any, res: Response) => {
    const { old_password, new_password } = req.body;
    const userController = new UserController(req, res)
    const result: ApiResponse = await userController.changePassword({ old_password, new_password });
    return showOutput(res, result, result.code)

})

router.get('/get_details', verifyTokenUser, async (req: Request | any, res: Response) => {
    const userController = new UserController(req, res)
    const result: ApiResponse = await userController.getUserDetails();
    return showOutput(res, result, result.code)

})


module.exports = router
