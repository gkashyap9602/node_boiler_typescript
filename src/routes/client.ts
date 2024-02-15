import express, { Request, Response } from 'express'
import ClientController from '../controllers/client.controller'
import { authenticate, authenticateAdmin, authenticateBoth } from '../middlewares/auth.middleware'
import multerMiddleware from '../middlewares/multer.middleware'
import { responseWithStatus } from '../utils/response.util'
const router = express.Router()

router.post('/save', async (req: Request | any, res: Response) => {
    const { email, firstName, lastName, password, phoneNumber, language } = req.body;
    const controller = new ClientController(req, res)
    const response = await controller.save({ email, firstName, lastName, password, phoneNumber, language });
    const { status } = response;
    return responseWithStatus(res, status, response)
})

router.post('/generateOtp', async (req: Request | any, res: Response) => {
    const { email } = req.body;
    const controller = new ClientController(req, res)
    const response = await controller.generateOtp({ email });
    const { status } = response;
    return responseWithStatus(res, status, response)
})

router.put('/verifyOtp', async (req: Request | any, res: Response) => {
    const { email , otp } = req.body;
    const controller = new ClientController(req, res)
    const response = await controller.verifyOtp({ email , otp });
    const { status } = response;
    return responseWithStatus(res, status, response)
})

router.post('/login', async (req: Request | any, res: Response) => {
    const { email, password } = req.body;
    const controller = new ClientController(req, res)
    const response = await controller.login({ email, password });
    const { status } = response;
    return responseWithStatus(res, status, response)
})

router.post('/forgotPassword', async (req: Request | any, res: Response) => {
    const { email, domain } = req.body;
    const controller = new ClientController(req, res)
    const response = await controller.forgotPassword({ email, domain });
    const { status } = response;
    return responseWithStatus(res, status, response)
})

router.put('/verifyForgetLink', authenticate, async (req: Request | any, res: Response) => {
    const { id, role } = req.body.user;
    const controller = new ClientController(req, res)
    const response = await controller.verifyForgetLink({id});
    const { status } = response;
    return responseWithStatus(res, status, response)
})

router.post('/resetPassword', authenticate, async (req: Request | any, res: Response) => {
    // check purpose field
    const { purpose } = req.body.user;
    if (!purpose || purpose !== 'reset') {
        return responseWithStatus(res, 400, {
            data: {},
            error: 'Invalid Token',
            message: '',
            status: 400
        })
    }
    const { password } = req.body;
    const controller = new ClientController(req, res)
    const response = await controller.resetPassword({ password });
    const { status } = response;
    return responseWithStatus(res, status, response)
})


router.put('/resendOtp', async (req: Request | any, res: Response) => {
    const { id } = req.body;
    const controller = new ClientController(req, res)
    const response = await controller.resendOtp({ id });
    const { status } = response;
    return responseWithStatus(res, status, response)
})

router.get('/me', authenticate, async (req: Request | any, res: Response) => {
    const controller = new ClientController(req, res)
    const response = await controller.me();
    const { status } = response;
    return responseWithStatus(res, status, response)
})

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

// router.get('/user-dashboard-analytics',authenticateAdmin, async (req: Request | any, res: Response) => {
//     const controller = new ClientController(req, res)
//     const response = await controller.usersAnalytics();
//     return responseWithStatus(res, response.status, response)
// });


// router.post('/createMpin',authenticate, async (req: Request | any, res: Response) => {
//     const { mpin } = req.body;
//     const controller = new ClientController(req, res)
//     const response = await controller.createMpin({ mpin });
//     const { status } = response;
//     return responseWithStatus(res, status, response)
// });

// router.post('/verifyMpin', authenticate,async (req: Request | any, res: Response) => {
//     const { otp } = req.body;
//     const controller = new ClientController(req, res)
//     const response = await controller.verifyMpin({ otp });
//     const { status } = response;
//     return responseWithStatus(res, status, response)
// });
// router.post('/createMpin', async (req: Request | any, res: Response) => {
//     const { mpin } = req.body;
//     const controller = new ClientController(req, res)
//     const response = await controller.createMpin({ mpin });
//     const { status } = response;
//     return responseWithStatus(res, status, response)
// })


// router.post('/registerClient', async (req: Request | any, res: Response) => {
//     const { email, firstName, lastName, phoneNumber, country, city, state, businessName, websiteDomain, workPhoneNumber, adminDomain, address, stripCustomerId, postCode,
//         subscriptionPlanId, admin_Domain, lp_Domain, templateUniqueId, networkKey, paymentKey ,emailTempKey} = req.body;
//     const controller = new ClientController(req, res)
//     const response = await controller.registerClient({
//         email, firstName, lastName, phoneNumber, country, websiteDomain, workPhoneNumber, adminDomain, stripCustomerId, city, state,
//         businessName, address, postCode, subscriptionPlanId, admin_Domain, lp_Domain, templateUniqueId, networkKey, paymentKey,emailTempKey
//     });
//     const { status } = response;
//     return responseWithStatus(res, status, response)
// })


// router.post('/registerClientUpdate', async (req: Request | any, res: Response) => {
//     const { email, firstName, lastName, phoneNumber, websiteDomain, adminDomain, country, city, state, businessName, subscriptionPlanId, clientId } = req.body;
//     const controller = new ClientController(req, res)
//     const response = await controller.registerClientUpdate({ email, firstName, lastName, phoneNumber, websiteDomain, adminDomain, country, city, state, businessName, subscriptionPlanId, clientId });
//     return responseWithStatus(res, response.status, response)
// })



// router.post('/update', authenticate, async (req: Request | any, res: Response) => {
//     const controller = new ClientController(req, res)
//     const response = await controller.update(req.body);
//     return responseWithStatus(res, response.status, response)
// })

// router.post('/updateLinks', async (req: Request | any, res: Response) => {
//     const controller = new ClientController(req, res)
//     const response = await controller.updateLinks(req.body);
//     return responseWithStatus(res, response.status, response)
// })


// router.post('/block-unblock', authenticate, async (req: Request | any, res: Response) => {
//     const controller = new ClientController(req, res)
//     const response = await controller.block(req.body);
//     return responseWithStatus(res, response.status, response)
// })

// router.get('/getlist', authenticate, async (req: Request | any, res: Response) => {
//     const { pageNumber, pageSize, startDate, endDate, searchByName, exportRequest } = req.query;
//     const controller = new ClientController(req, res)
//     const response = await controller.getlist(pageNumber, pageSize, startDate, endDate, searchByName, exportRequest);
//     const { status, data } = response;
//     if (exportRequest === 'true') {
//         return res.send(data)
//     }
//     return responseWithStatus(res, response.status, response)
// })

// router.post('/clientDelete', authenticate, async (req: Request | any, res: Response) => {
//     const controller = new ClientController(req, res)
//     const response = await controller.clientDelete(req.body);
//     return responseWithStatus(res, response.status, response)
// })

// router.post('/details', authenticate, async (req: Request | any, res: Response) => {
//     const controller = new ClientController(req, res)
//     const response = await controller.details(req.body);
//     return responseWithStatus(res, response.status, response)
// })

// router.post('/uploadFile', multerMiddleware.single('file'), async (req: Request | any, res: Response) => {
//     const controller = new ClientController(req, res)
//     const response = await controller.uploadFile(req.file as Express.Multer.File);
//     return responseWithStatus(res, response.status, response)
// })

// router.post('/getPlanAndFeature', authenticate, async (req: Request | any, res: Response) => {
//     const controller = new ClientController(req, res)
//     const response = await controller.getPlanAndFeature(req.body);
//     return responseWithStatus(res, response.status, response)
// })

// router.post('/businessName', async (req: Request | any, res: Response) => {
//     const controller = new ClientController(req, res)
//     const response = await controller.businessName(req.body);
//     return responseWithStatus(res, response.status, response)
// })


// router.post('/email', async (req: Request | any, res: Response) => {
//     const controller = new ClientController(req, res)
//     const response = await controller.email(req.body);
//     return responseWithStatus(res, response.status, response)
// })

// router.get('/key', async (req: Request | any, res: Response) => {
//     const { link } = req.query;
//     const controller = new ClientController(req, res)
//     const response = await controller.key(link);
//     const { status } = response;
//     return responseWithStatus(res, status, response)
// })

// router.post('/registerProspect', async (req: Request | any, res: Response) => {
//     const { email, firstName, lastName, phoneNumber, country, city, state, businessName, workPhoneNumber, address, postCode } = req.body;
//     const controller = new ClientController(req, res)
//     const response = await controller.registerProspect({ email, firstName, lastName, phoneNumber, country, workPhoneNumber, city, state, businessName, address, postCode });
//     const { status } = response;
//     return responseWithStatus(res, status, response)
// })

// router.get('/getlistProspect', authenticate, async (req: Request | any, res: Response) => {
//     const { pageNumber, pageSize, startDate, endDate, searchByName, exportRequest } = req.query;
//     const controller = new ClientController(req, res)
//     const response = await controller.getlistProspect(pageNumber, pageSize, startDate, endDate, searchByName, exportRequest);
//     const { status, data } = response;
//     if (exportRequest === 'true') {
//         return res.send(data)
//     }
//     return responseWithStatus(res, response.status, response)
// })

module.exports = router
