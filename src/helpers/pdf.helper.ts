import puppeteer from 'puppeteer';
import { uploadFileToS3 } from '../services/aws.service';
import { generateRandomAlphanumeric } from './common.helper';


export const pdfDynamicFormData = (html_payload: any) => {
    return new Promise((resolve, reject) => {
        puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
            .then(async (browser) => {
                const page = await browser.newPage();

                // You need to set htmlContent from html_payload or some other source
                const htmlContent = `<p><b>User Data<br />
                </b>${html_payload.first_name} ${html_payload.last_name}
                ${html_payload.year}<br /></p> `

                // Set content of the page
                return page.setContent(htmlContent, { waitUntil: "networkidle0" })
                    .then(() => {
                        // Generate PDF with header and footer
                        return page.pdf({
                            format: "A4",
                            printBackground: true,
                        });
                    })
                    .then((pdfBuffer) => {
                        const pdfFileName = `report-${generateRandomAlphanumeric(14)}.pdf`;
                        const file = {
                            fieldname: "user_report",
                            originalname: pdfFileName,
                            mimetype: "application/pdf",
                            buffer: pdfBuffer,
                        };

                        return uploadFileToS3([file])
                            .then((pdfLink) => {
                                return browser.close()
                                    .then(() => resolve({ status: true, data: pdfLink.data[0] }))
                                    .catch(() => reject(new Error('Unable to close the browser')));
                            })
                            .catch(() => {
                                return browser.close()
                                    .then(() => reject(new Error('Failed to upload PDF to S3')))
                                    .catch(() => reject(new Error('Unable to close the browser')));
                            });
                    });
            })
            .catch((err: any) => {
                console.log("Err in catch, ", err.message);
                reject(new Error('Unable to generate invoice pdf!'));
            });
    });
}; // ends

//*******below function is working but it not use promise correctly so we recreate it above testing pending *********
// export const pdfDynamicFormData = (html_payload: any) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const browser = await puppeteer.launch({
//                 args: ['--no-sandbox', '--disable-setuid-sandbox']
//             });
//             const page = await browser.newPage();

//            const htmlContent = ''

//             // Set content of the page
//             await page.setContent(htmlContent, { waitUntil: "networkidle0" });
//             // Generate PDF with header and footer
//             const pdfBuffer = await page.pdf({
//                 format: "A4",
//                 // margin: {
//                 //     top: "0px", // Adjust the top margin to fit the header
//                 //     bottom: "0px", // Adjust the bottom margin to fit the footer
//                 //     left: "0px",
//                 //     right: "0px",
//                 // },
//                 printBackground: true,
//             });

//             const pdfFileName = `report-${generateRandomAlphanumeric(14)}.pdf`;
//             const file = {
//                 fieldname: "augusta_report",
//                 originalname: pdfFileName,
//                 mimetype: "application/pdf",
//                 buffer: pdfBuffer,
//             };

//             const pdfLink = await uploadFileToS3([file]);
//             await browser.close();
//             resolve({ status: true, data: pdfLink.data[0] });
//         } catch (err: any) {
//             console.log("Err in catch, ", err.message);
//             reject(new Error('Unable to generate invoice pdf!'));
//         }
//     });
// }; //ends
