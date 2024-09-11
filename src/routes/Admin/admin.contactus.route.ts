import express, { Request, Response } from 'express';
import AdminController from '../../controllers/Admin/admin.contactus.controller';
import { showOutput } from '../../utils/response.util';
import { ApiResponse } from '../../utils/interfaces.util';
import middlewares from '../../middlewares';
const { verifyTokenAdmin } = middlewares.auth;

const router = express.Router();

router.get('/list', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { sort_column, sort_direction, page, limit, search_key } = req.query;
    const adminController = new AdminController(req, res);
    const result: ApiResponse = await adminController.listContactDetails(sort_column, sort_direction, page, limit, search_key);
    return showOutput(res, result, result.code);
});

router.get('/details', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { contact_id } = req.query;
    const adminController = new AdminController(req, res);
    const result: ApiResponse = await adminController.getContactDetail(contact_id);
    return showOutput(res, result, result.code);
});

router.delete('/delete', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { contact_id } = req.body;
    const adminController = new AdminController(req, res);
    const result: ApiResponse = await adminController.deleteContactUs({ contact_id });
    return showOutput(res, result, result.code);
});

router.post('/reply', verifyTokenAdmin, async (req: Request | any, res: Response) => {
    const { contact_id, html } = req.body;
    const adminController = new AdminController(req, res);
    const result: ApiResponse = await adminController.replyContactus({contact_id, html});
    return showOutput(res, result, result.code);
});

export default router;