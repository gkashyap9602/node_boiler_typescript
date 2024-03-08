import express, { Request, Response } from 'express'
import AdminController from '../../controllers/Admin/admin.controller'
import { showOutput } from '../../utils/response.util'
import { ApiResponse } from '../../utils/interfaces.util'
// import { authenticate } from '../middlewares/auth.middleware'
// import { verifyTokenAdmin } from '../middlewares/auth.middleware'
import middlewares from '../../middlewares'
let { verifyTokenAdmin } = middlewares.auth
let { addToMulter } = middlewares.fileUpload.multer

const router = express.Router()

router.post('/login', async (req: Request | any, res: Response) => {
    const { email, password } = req.body;
    const adminController = new AdminController(req, res)
    const result: ApiResponse = await adminController.login({ email, password });
    return showOutput(res, result, result.code)
})

// router.post('/register', async (req: Request | any, res: Response) => {
//     const { first_name, last_name, email, password } = req.body;
//     const adminController = new AdminController(req, res)
//     const result: ApiResponse = await adminController.register({ first_name, last_name, email, password });
//     return showOutput(res, result, result.code)
// })

router.post('/forgot_password', async (req: Request | any, res: Response) => {
    const { email, mode } = req.body;
    const adminController = new AdminController(req, res)
    const result: ApiResponse = await adminController.forgotPassword({ email });
    return showOutput(res, result, result.code)

})

router.post('/reset_password', async (req: Request | any, res: Response) => {
    const { email, new_password } = req.body;
    const adminController = new AdminController(req, res)
    const result: ApiResponse = await adminController.resetPassword({ email, new_password });
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


router.post('/change_password', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { old_password, new_password } = req.body;
    const adminController = new AdminController(req, res)
    const result: ApiResponse = await adminController.changePassword({ old_password, new_password });
    return showOutput(res, result, result.code)

})

router.get('/get_details', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const adminController = new AdminController(req, res)
    const result: ApiResponse = await adminController.getAdminDetails();
    return showOutput(res, result, result.code)

})

router.put('/update_profile', addToMulter.single('profile_pic'), verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { first_name, last_name, phone_number, country_code } = req.body
    const adminController = new AdminController(req, res)
    const result: ApiResponse = await adminController.updateAdminProfile(first_name, last_name, phone_number, country_code, req.file);
    return showOutput(res, result, result.code)

})


router.get('/get_user_details', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { user_id } = req.query;
    const adminController = new AdminController(req, res)
    const result: ApiResponse = await adminController.getUserDetails(user_id);
    return showOutput(res, result, result.code)

})
router.get('/get_users_list', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { sort_column, sort_direction, page, limit, search_key, status } = req.query
    const adminController = new AdminController(req, res)
    const result: ApiResponse = await adminController.getUsersList(sort_column, sort_direction, page, limit, search_key, status);
    return showOutput(res, result, result.code)

})

router.put('/update_user_status', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { user_id, status } = req.body
    const adminController = new AdminController(req, res)
    const result: ApiResponse = await adminController.updateUserStatus({ user_id, status });
    return showOutput(res, result, result.code)

})


router.post('/add_question', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { question, answer } = req.body;
    const adminController = new AdminController(req, res)
    const result: ApiResponse = await adminController.addQuestion({ question, answer });
    return showOutput(res, result, result.code)

})

router.put('/update_question', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { answer, question, question_id } = req.body;
    const adminController = new AdminController(req, res)
    const result: ApiResponse = await adminController.updateQuestion({ answer, question, question_id });
    return showOutput(res, result, result.code)

})

router.put('/update_common_content', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { about, privacy_policy, terms_conditions } = req.body;

    const adminController = new AdminController(req, res)
    const result: ApiResponse = await adminController.updateCommonContent({ about, privacy_policy, terms_conditions });
    return showOutput(res, result, result.code)

})

module.exports = router
