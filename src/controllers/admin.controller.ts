import { Route, Controller, Tags, Post, Body, Get, Security, Query } from 'tsoa'
import { IResponse } from '../utils/interfaces.util';
import { Request, Response } from 'express'
import { findOne, getById, upsert, getAll } from '../helpers/db.helpers';
import { verifyHash, signToken, genHash } from '../utils/common.util';
import { validateChangePassword, validateForgotPassword, validateProfile, validateResetPassword, validateAdmin } from '../validations/admin.validator';
import adminModel from '../models/admin.model';
import logger from '../configs/logger.config';
// import { sendEmail } from '../configs/nodemailer';
// import { readHTMLFile } from '../services/utils';
// import path from 'path';
// import handlebar from 'handlebars'
import handlers from '../handlers/admin.handler'


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
    public async login(@Body() request: { email: string, password: string }): Promise<IResponse> {
        try {
            const { email, password } = request;
            const validatedUser = validateAdmin({ email, password });
            if (validatedUser.error) {
                throw new Error(validatedUser.error.message)
            }

            let result = handlers.login({ email, password }, "file")
            // check if blocked
            // if (exists.isBlocked) {
            //     throw new Error('Admin is not approved yet!');
            // }

            // const isValid = await verifyHash(password, exists.password);
            // if (!isValid) {
            //     throw new Error('Password seems to be incorrect');
            // }
            // const token = await signToken(exists._id)
            // delete exists.password
            return {
                data: {},
                error: '',
                message: 'Login Success',
                status: 200
            }
        }
        catch (err: any) {
            logger.error(`${this.req.ip} ${err.message}`)
            return {
                data: null,
                error: err.message ? err.message : err,
                message: '',
                status: 400
            }
        }
    }

}


