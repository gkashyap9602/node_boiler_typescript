import { Request, Response } from 'express'
import { Route, Controller, Tags, Post, Body, Get, Security, Query } from 'tsoa'
import { ApiResponse } from '../utils/interfaces.util';
// import { findOne, getById, upsert, getAll } from '../helpers/db.helpers';
// import { verifyHash, signToken, genHash } from '../utils/common.util';
// import { validateChangePassword, validateForgotPassword, validateProfile, validateResetPassword, validateAdmin } from '../validations/admin.validator';
import adminModel from '../models/admin.model';
import logger from '../configs/logger.config';
// import { sendEmail } from '../configs/nodemailer';
// import { readHTMLFile } from '../services/utils';
// import path from 'path';
// import handlebar from 'handlebars'
import handlers from '../handlers/admin.handler'
import { showOutput } from '../utils/response.util';

@Tags('Admin')
@Route('api/admin')

export default class AdminController extends Controller {
    req: Request;
    res: Response;
    userId: string
    constructor(req: Request, res: Response) {
        super();
        this.req = req;
        this.res = res;
        this.userId = req.body.user ? req.body.user.id : ''
    }

    /**
     * Get user login
     */
    @Post("/login")
    public async login(@Body() request: { email: string, password: string }): Promise<ApiResponse> {
        try {
            const { email, password } = request;

            let result = handlers.login({ email, password }, "file")
            return result
        }
        catch (err: any) {
            // logger.error(`${this.req.ip} ${err.message}`)
            return err
        }
    }

}


