export const registrationEmailTemplate = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="x-ua-compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <meta content="telephone=no" name="format-detection" />
        <title>Thanks for investing</title>
        <style type="text/css">
            @import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&display=swap");
            body {
                margin: 0;
                padding: 0;
                background: #fff;
                font-family: "Montserrat", sans-serif;
            }

            a {
                border: 0;
                outline: none;
                text-decoration: none;
                cursor: pointer;
            }
            a[x-apple-data-detectors] {
                color: inherit !important;
                text-decoration: none !important;
                font-size: inherit !important;
                font-family: inherit !important;
                font-weight: inherit !important;
                line-height: inherit !important;
            }
            table,
            td {
                mso-table-lspace: 0pt !important;
                mso-table-rspace: 0pt !important;
            }
            img {
                -ms-interpolation-mode: bicubic;
            }

            img {
                border: 0;
                outline: none;
                max-width: 100%;
            }
            .footer-table .inner-col-space {
                width: 15px;
            }
            .footer-table .inner-col-space.mobile {
                display: none;
            }
            .visible-sm {
                display: none;
            }

            @media only screen and (max-width: 600px) {
                .ticket-col2 {
                    vertical-align: top !important;
                    background-color: none !important;
                }
                .hidden-xs {
                    display: none;
                }
                .mobile-line-height {
                    line-height: 18px !important;
                }
                .full {
                    width: 100% !important;
                    display: block;
                }
                .footer-table .facebook {
                    padding-left: 0 !important;
                }
                .footer-table .inner-col-space,
                .footer-table .inner-col-space.mobile {
                    width: 40px !important;
                    display: block;
                }
                .mobile-space-height {
                    height: 25px;
                }
                .booking-detail {
                    font-size: 12px !important;
                    line-height: 18px !important;
                }
                .booking-id-no {
                    font-size: 16px !important;
                    line-height: 20px !important;
                }
                .booking-title {
                    font-size: 13px !important;
                    line-height: 18px !important;
                }

                .mobile-font {
                    font-size: 11px;
                }
                .table {
                    width: 100%;
                }
                .empty-row {
                    height: 5px !important;
                }
                img {
                    max-width: 100%;
                }

                .outer-td-width {
                    width: 15px !important;
                }

                .inner-td {
                    width: 50px;
                }

                .above-footer-width {
                    width: 100px;
                }

                .td-display {
                    display: none;
                }

                .mobile-td-display {
                    text-align: center !important;
                    display: block;
                }

                .middle-width {
                    width: 45% !important;
                }

                .align-right {
                    text-align: right;
                }

                .text-width {
                    width: auto !important;
                }
                .text-center {
                    text-align: center !important;
                }
                .mobile-width-left {
                    width: 7% !important;
                }
                .quantity {
                    width: 8% !important;
                }
                .mobile-width-middle {
                    width: 9% !important;
                }
                .mobile-width-right {
                    width: 4% !important;
                }
                .title-width {
                    width: 30% !important;
                }
                .unit-width {
                    width: 20% !important;
                }
                .price-width {
                    width: 20% !important;
                }
                .unit-middle-width {
                    width: 35px !important;
                }
            }

            @media only screen and (max-width: 480px) {
                .inner-table-td {
                    width: 80px;
                }
                .empty-row {
                    height: 0 !important;
                }
                .visible-sm {
                    display: block;
                }
                .description-line-height {
                    line-height: 14px !important;
                }
            }
            @media only screen and (max-width: 475px) {
                .ticket-col2 {
                    width: 260px !important;
                }
                .ticket-col3 {
                    width: 235px !important;
                }
                .ticket-col1,
                .ticket-col1 img {
                    width: 40px !important;
                }
            }
            @media only screen and (max-width: 374px) {
                .ticket-col2 {
                    width: 220px !important;
                }
                .ticket-col3 {
                    width: 300px !important;
                }
                .mobile-font {
                    font-size: 10px;
                }
            }
        </style>
    </head>

    <body>
        <table cellspacing="0" cellpadding="0" border="0" width="600" align="center" class="table">
            <tbody>
                <tr>
                    <td>
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                                <td height="6" style="background-color: #000;"></td>
                                <td height="6" style="background-color: #5482ba;"></td>
                                <td height="6" style="background-color: #000;"></td>
                                <td height="6" style="background-color: #5482ba;"></td>
                                <td height="6" style="background-color: #000;"></td>
                                <td height="6" style="background-color: #6da6f4;"></td>
                                <td height="6" style="background-color: #000;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td>
                        <table cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f6f6f6;">
                            <tbody>
                                <tr>
                                    <td height="30"></td>
                                </tr>
                                <tr>
                                    <td>
                                        <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                           <tbody>
                                            <tr>
                                                <td width="20" class="outer-td-width"></td>
                                                <td>
                                                    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); background-color: #ffffff;">
                                                        <tbody>
                                                            <tr>
                                                                <td width="30" class="outer-td-width"></td>
                                                                <td>
                                                                    <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td height="30" style="width: 100%;"></td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td>
                                                                                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                                                                        <tr>
                                                                                            <td width="100%" align="center">
                                                                                                <img src="https://ico-clientpanel-apis.staging.block-brew.com/uploads/common/logo.png" style="text-align: right; width: 200px;" />
                                                                                            </td>
                                                                                        </tr>
                                                                                    </table>
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td height="30"></td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td style="color: #212121; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 400;">Dear <b>{{firstName}} {{lastName}}</b>,</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td style="color: #212121; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 400; line-height: 24px; display: block; max-width: 467px;" class="text-width">
                                                                                    <p>Thanks for being a part of this journey.</p>
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td style="color: #212121; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 400; line-height: 24px; display: block; max-width: 467px;" class="text-width">
                                                                                    <p>Click here to login Client panel. Please use the Credentials below :-</p>
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td>
                                                                                    <div style="display: flex; align-items: center;">
                                                                                        <b>Url :</b>
                                                                                        <a style="margin-left: 10px;" href="{{admindomain}}">{{admindomain}}</a>
                                                                                    </div>
                                                                                    <div style="display: flex; align-items: center; margin: 10px 0;">
                                                                                        <b>User Name :</b>
                                                                                        <span style="margin-left: 10px;">{{email}}</span>
                                                                                    </div>
                                                                                    <div style="display: flex; align-items: center;">
                                                                                        <b>Password :</b>
                                                                                        <span style="margin-left: 10px;">{{password}}</span>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                
                                                                            <tr>
                                                                                <td style="color: #212121; font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 400; line-height: 24px; display: block; max-width: 467px;" class="text-width">
                                                                                    <p>Your Investor Landing page :-</p>
                                                                                </td>
                                                                            </tr>
                                                                            <tr>
                                                                               <td width="20"></td>
                                                                            </tr>
                                                                            <tr>
                
                                                                                <td>
                                                                                    <div style="display: flex; align-items: center; margin-bottom: 40px;">
                                                                                        <b>Url :</b>
                                                                                        <a style="margin-left: 10px;" href={{webDomain}}>{{webDomain}}</a>
                                                                                    </div>
                                                                                </td>
                                                                                <td width="20"></td>
                                                                               
                                                                            </tr>
                                                                            <tr>
                                                                                <td height="25" style="background-color: #5482ba; font-size: 14px;padding: 8px 0;text-transform: uppercase; color: #ffffff; text-align: center; font-weight: 400; cursor: pointer;">
                                                                                    <a  href="{{admindomain}}" target="_blank" style="color: #fff;">Go to Panel</a>
                                                                                </td>
                                                                                <td width="70"></td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td height="40"></td>
                                                                            </tr>
                
                                                                            <tr>
                                                                                <td>
                                                                                    <table cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #ededed; border-radius: 5px;">
                                                                                       <tbody>
                                                                                            <tr height="5"></tr>
                                                                                            <tr>
                                                                                                <td>
                                                                                                    <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                                                                                        <tr>
                                                                                                            <td width="20"></td>
                                                                                                            <td style="color: #212121; font-family: 'Montserrat', sans-serif; font-size: 16px; font-weight: 400; line-height: 24px;">
                                                                                                                <b style="font-size: 14px;">Note:</b> In case of any issue please contact us at
                                                                                                                <a href="mailto:support@ico.block-brew.com">support@ico.block-brew.com</a>
                                                                                                            </td>
                                                                                                            <td width="20"></td>
                                                                                                        </tr>
                                                                                                    </table>
                                                                                                </td>
                                                                                            </tr>
                                                                                            <tr height="5"></tr>
                                                                                       </tbody>
                                                                                    </table>
                                                                                </td>
                                                                            </tr>                
                                                                            <tr>
                                                                                <td height="30"></td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                                <td width="30" class="outer-td-width"></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                                <td width="30" class="outer-td-width"></td>
                                            </tr>
                                           </tbody>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td height="20"></td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
    
                <tr>
                    <td height="2" style="background-color: #eaeaea;"></td>
                </tr>

                <tr>
                    <td style="background-color: #fafafa;">
                        <table cellspacing="0" cellpadding="0" border="0" align="center" width="600" class="table">
                            <tbody>
                                <tr>
                                    <td width="30" class="outer-td-width"></td>
                                    <td>
                                        <table cellspacing="0" cellpadding="0" border="0" align="center" width="100%">
                                            <tbody>
                                                <tr>
                                                    <td height="28"></td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <table cellspacing="0" cellpadding="0" border="0" align="center" width="100%" class="footer-table" dir="rtl">
                                                            <tbody>
                                                                <tr>
                                                                    <td class="full text-center">
                                                                        <table cellspacing="0" cellpadding="0" border="0" align="center" width="100%">
                                                                            <tbody>
                                                                                <tr>
                                                                                    <td style="color: #656565; font-family: 'Montserrat', sans-serif; font-size: 11px; text-align: center;">All rights reserved © ico.block-brew 2022</td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td height="28"></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                    <td width="30" class="outer-td-width"></td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </body>
</html>



`