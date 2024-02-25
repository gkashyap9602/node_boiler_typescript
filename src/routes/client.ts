import express, { Request, Response } from 'express'
import ClientController from '../controllers/client.controller'
// import { authenticate, authenticateAdmin, authenticateBoth } from '../middlewares/auth.middleware'
// import multerMiddleware from '../middlewares/multer.middleware'
import { ApiResponse } from '../utils/interfaces.util'
import { showOutput } from '../utils/response.util'
const router = express.Router()

router.post('/save', async (req: Request | any, res: Response) => {
    const { email, firstName, lastName, password, phoneNumber, language } = req.body;
    const controller = new ClientController(req, res)
    const result = await controller.save({ email, firstName, lastName, password, phoneNumber, language });
    return showOutput(res, result, result.code)
})

// router.post('/generateOtp', async (req: Request | any, res: Response) => {
//     const { email } = req.body;
//     const controller = new ClientController(req, res)
//     const response = await controller.generateOtp({ email });
//     const { status } = response;
//     return responseWithStatus(res, status, response)
// })

// router.put('/verifyOtp', async (req: Request | any, res: Response) => {
//     const { email , otp } = req.body;
//     const controller = new ClientController(req, res)
//     const response = await controller.verifyOtp({ email , otp });
//     const { status } = response;
//     return responseWithStatus(res, status, response)
// })

// router.post('/login', async (req: Request | any, res: Response) => {
//     const { email, password } = req.body;
//     const controller = new ClientController(req, res)
//     const response = await controller.login({ email, password });
//     const { status } = response;
//     return responseWithStatus(res, status, response)
// })

// router.post('/forgotPassword', async (req: Request | any, res: Response) => {
//     const { email, domain } = req.body;
//     const controller = new ClientController(req, res)
//     const response = await controller.forgotPassword({ email, domain });
//     const { status } = response;
//     return responseWithStatus(res, status, response)
// })

// router.put('/verifyForgetLink', authenticate, async (req: Request | any, res: Response) => {
//     const { id, role } = req.body.user;
//     const controller = new ClientController(req, res)
//     const response = await controller.verifyForgetLink({id});
//     const { status } = response;
//     return responseWithStatus(res, status, response)
// })

// router.post('/resetPassword', authenticate, async (req: Request | any, res: Response) => {
//     // check purpose field
//     const { purpose } = req.body.user;
//     if (!purpose || purpose !== 'reset') {
//         return responseWithStatus(res, 400, {
//             data: {},
//             error: 'Invalid Token',
//             message: '',
//             status: 400
//         })
//     }
//     const { password } = req.body;
//     const controller = new ClientController(req, res)
//     const response = await controller.resetPassword({ password });
//     const { status } = response;
//     return responseWithStatus(res, status, response)
// })


// router.put('/resendOtp', async (req: Request | any, res: Response) => {
//     const { id } = req.body;
//     const controller = new ClientController(req, res)
//     const response = await controller.resendOtp({ id });
//     const { status } = response;
//     return responseWithStatus(res, status, response)
// })

// router.get('/me', authenticate, async (req: Request | any, res: Response) => {
//     const controller = new ClientController(req, res)
//     const response = await controller.me();
//     const { status } = response;
//     return responseWithStatus(res, status, response)
// })

// router.post('/changePassword', authenticate, async (req: Request | any, res: Response) => {
//     const { oldPassword, newPassword } = req.body;
//     const controller = new ClientController(req, res)
//     const response = await controller.changePassword({ oldPassword, newPassword });
//     const { status } = response;
//     return responseWithStatus(res, status, response)
// })

// router.get('/users',authenticateAdmin, async (req: Request | any, res: Response) => {
//     let {pageNumber,pageSize,search,status,kycStatus} = req.query;
//     const controller = new ClientController(req, res)
//     const response = await controller.users(parseInt(pageNumber),parseInt(pageSize),search,status,kycStatus);
//     return responseWithStatus(res, response.status, response)
// });


module.exports = router
