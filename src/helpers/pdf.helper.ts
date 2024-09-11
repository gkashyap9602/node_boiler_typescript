import puppeteer from 'puppeteer';
import { uploadFileToS3 } from '../services/aws.service';
import { generateRandomAlphanumeric } from './common.helper';
import { formatDateTOMonthDayYear } from './common.helper';




export const pdfDynamicFormData = (html_payload: any) => {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();


            const htmlContent = `

            <html>

            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                 <style>
                    @media print {
                        .page-break {
                            page-break-before: always;
                            page-break-after: always;
                        }
                    }
            
                    p {
                        font-size: 1.3rem; 
                    }
            
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        text-align: left;
                    }
            
                    th,
                    td {
                        padding: 12px 15px;
                        border: 1px solid #000;
                    }
            
                    th {
                        font-weight: bold;
                        /* background-color: red; */
                    }
            
                    .parent {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-direction: column;
                        width: 210mm;
                        padding: 17mm;
                    }
            
                    .every_page_footer {
                        font-size: 0.9rem;
                    }
            
                    .margin_0 {
                        margin: 5px;
                    }
                </style>
            </head>
<body>
   <body>
    <div class="parent" style="border: 1px solid grey;margin: auto;">
        <div class="title">
            <div>
                <h1>Augusta Rule Tax<br />Savings Summary<br /></h1>
                <h2 class="" style="font-weight: normal;">Created for:<br />${html_payload.first_name}
                    ${html_payload.last_name}<br /></h2>
                <h2 style="font-weight: normal;">${html_payload.business_name}<br /></h2>
                <h2 style="font-weight: normal;">${html_payload.year}<br /></h2>
                <p style="font-size: 1.7rem; font-weight: bold;">Important Notice: <span
                        style="font-size: 1.5rem;font-weight: normal;word-spacing: 5px;"> This document is generated
                        based on the information<br />you provided through
                        our app and represents an estimation of your potential<br />tax savings under the Augusta Rule.
                        As the outcome
                        is derived from<br />user-inputted data, we disclaim any liability for inaccuracies
                        or<br />miscalculations. For personalized and detailed tax advice, please consult our<br />team
                        of experts.<br /></span>
                </p>
                <p class="every_page_footer"><b>&copy; GALILEO TAX STRATEGIES, LLC ${html_payload.current_year} </b>-
                    MAY NOT BE REPRODUCED WITHOUT
                    PERMISSION</p>

            </div>
        </div>
        <div style="page-break-before:always; page-break-after:always">
            <div>
                <p><b>Augusta Rule Suporting Documentation<br /></b>${html_payload.first_name} ${html_payload.last_name}
                    ${html_payload.year}<br /></p>
                <p> <span style="font-size: 1.5rem"><b>Table of Contents<br /></span>
                    <hr />
                <p>
                    </b>Table of Contents<br />Understanding the Augusta Rule<br />Detailed
                    Savings
                    Breakdown<br />Step-by-Step Filing Instructions for Reporting Rental Income under IRC<br />Section
                    280A(g)<br />Rental &amp; Utilization Summary<br />Step-by-Step Guide: Augusta Rule &amp; Home
                    Offices<br />Supporting Documents<br />Substantiating Brief Regarding Application of the Augusta
                    Rule<br /></p>
                </p>
                <p class="every_page_footer"><b>&#169; GALILEO TAX STRATEGIES, LLC ${html_payload.current_year} </b>-
                    MAY NOT BE REPRODUCED WITHOUT
                    PERMISSION<br />1</p>

            </div>
        </div>
         <div style="page-break-before:always; page-break-after:always">
            <div>
                <p><b>Augusta Rule Suporting Documentation<br /></b>${html_payload.first_name} ${html_payload.last_name}
                    ${html_payload.year}<br /></p>
                <p class="margin_0">
                    <b style="font-size: 1.5rem; margin: 0px;">Understanding the Augusta Rule<br /></b>
                    <hr />
                <p style="word-spacing: 3px;">The Augusta Rule allows homeowners to rent out their property for up to 14
                    days annually without the income being subject to federal income tax. The
                    business entity structure must be an S corporation, C corporation, or
                    partnership. It can’t be a Schedule C (self-employment income) unless the
                    entity is a Single Member LLC.</p>
                <p>In your case, renting your property to <b>${html_payload.business_name} </b>likely falls under
                    this<br />rule, offering
                    unique tax advantages both personally and for your business.<br /></p>
                <div class="">
                    <h2>Compliance data included in this document:<br /></h2>
                    <p>&#9679; A defense brief citing IRC
                        justification<br />&#9679; A written rental agreement.<br />&#9679; Thorough documentation
                        supporting
                        the rental price.<br />&#9679; Meeting documentation such as meeting minutes and notes.<br />
                    </p>
                </div>
                <div class="">
                    <h2>Benefits</h2>
                    <p>&#9679; Increases tax-deductible business expenses.<br />&#9679; Increases your income
                        without any additional tax.<br /></p>
                    <p>This information packet will provide you with supporting documentation and<br />filing
                        guidelines.<br />
                    </p>
                </div>
                <p class="every_page_footer"><b>&#169; GALILEO TAX STRATEGIES, LLC ${html_payload.current_year} </b>-
                    MAY NOT BE REPRODUCED WITHOUT
                    PERMISSION<br />2</p>

            </div>
        </div>
        <div style="page-break-before:always; page-break-after:always">
            <div>
                <p><b>Augusta Rule Suporting Documentation<br /></b>${html_payload.first_name} ${html_payload.last_name}
                    ${html_payload.year}<br /></p>
                <p>
                <h2>Detailed Savings Breakdown<br /></h2>
                <hr />
                <h3>Rental Address:<br /> </h3>${html_payload.house_address}<br /></p>
                <div class="">
                    <h3>Provided by:</h3>
                    <p>${html_payload.first_name} ${html_payload.last_name}<br /></p>
                    <h3>Provided to:</h3>
                    <p>${html_payload.business_name}<br /></p>
                </div>
                <div class="" style="width: 75%;">
                    <h3>Estimated Personal Tax Savings:</h3>
                    <div class="" style="display: flex;align-items: center;justify-content: space-between;">
                        <p class="margin_0">Rental Period Utilized:</p>
                        <p class="margin_0">${html_payload.total_rented_days}</p>
                    </div>
                    <div class="" style="display: flex;align-items: center;justify-content: space-between;">
                        <p class="margin_0">Total Rental Income:</p>
                        <p class="margin_0">$${html_payload.total_rental_amount}</p>
                    </div>
                </div>
                <p><b>You earned $${html_payload.total_rental_amount} tax-free with the Augusta Rule.<br /></b></p>
                <div class="" style="width: 75%;">
                    <div class="" style="display: flex;align-items: center;justify-content: space-between;">
                        <p class="margin_0">Applied Federal Tax Bracket:</p>
                        <p class="margin_0">${html_payload.federal_tax_bracket}</p>
                    </div>
                    <div class="" style="display: flex;align-items: center;justify-content: space-between;">
                        <p class="margin_0">State Tax Bracket:</p>
                        <p class="margin_0">${html_payload.state_tax_bracket}</p>
                    </div>
                    <div class=""
                        style="display: flex;align-items: center;justify-content: space-between;margin-top: 20px;">
                        <p class="margin_0">Federal Tax Savings (Est.):</p>
                        <p class="margin_0">$${html_payload.total_rental_fedral}</p>
                    </div>
                    <div class="" style="display: flex;align-items: center;justify-content: space-between">
                        <p class="margin_0">State Savings (Est.):</p>
                        <p class="margin_0">$${html_payload.total_rental_state}</p>
                    </div>
                    <div class="" style="display: flex;align-items: center;justify-content: space-between">
                        <p class="margin_0" style="color: green;font-size: 1.5rem;font-weight: bold;">Total Tax Savings:
                        </p>
                        <p class="margin_0" style="color: green;font-size: 1.5rem;font-weight: bold;">$${html_payload.total_rental_fedral + html_payload.total_rental_state}</p>
                    </div>

                    <!-- <p>Federal Tax Savings (Est.): $${html_payload.total_rental_fedral}<br />State Savings (Est.):
                        $${html_payload.total_rental_state}<br /></p> -->
                    <!-- <p><b>Total Tax Savings: $${html_payload.total_rental_fedral + html_payload.total_rental_state}<br /></b></p> -->
                </div>
                <p class="every_page_footer"><b>&#169; GALILEO TAX STRATEGIES, LLC ${html_payload.current_year} </b>-
                    MAY NOT BE REPRODUCED WITHOUT
                    PERMISSION<br />3</p>

            </div>
        </div>
        <div style="page-break-before:always; page-break-after:always">
            <div>
                <p><b>Augusta Rule Suporting Documentation<br /></b>${html_payload.first_name} ${html_payload.last_name}
                    ${html_payload.year}<br /></p>
                <div class="">
                    <h2>
                        Step-by-Step Filing Instructions for Reporting Rental Income under IRC Section 280A(g)
                    </h2>
                    <hr />
                    <p>The following is a detailed guide for recognizing Augusta Rule
                        benefits in your<br />tax return. In most cases, you will simply forward this to your accountant
                        as<br />part of your normal tax preparation.<br /></p>
                    <p><b>Step 1: </b>Receive and Review Form 1099-MISC<br />1. <b>Receive Form 1099-MISC</b>: When you
                        receive
                        rental income, it is likely<br /></p>
                    <p>that you will be issued a Form 1099-MISC by the payer.<br />2. <b>Review Form 1099-MISC</b>:
                        Verify
                        the
                        details on the form, ensuring that<br /></p>
                    <p>the amount reported matches your records of the rental income<br />received.<br /></p>
                    <p><b>Step 2</b>: Understand Reporting Obligations<br />1. <b>IRS and State Notification:
                        </b>Understand
                        that the IRS and your home state<br /></p>
                    <p>also receive a copy of Form 1099-MISC. They will be expecting you to<br />report this income on
                        your
                        tax
                        return.<br /></p>
                    <p>2. <b>Identify Schedule E Requirement</b>: The IRS will be looking for a<br />Schedule E
                        (Supplemental
                        Income and Loss) to report this rental<br />income.<br /></p>
                    <p><b>Step 3</b>: Prepare Schedule E<br />1. <b>Start with Schedule E</b>: Begin preparing Schedule
                        E as
                        part of your<br /></p>
                    <p>federal tax return.<br />2. <b>Report the Income</b>: Enter the rental income from Form 1099-MISC
                        in<br /></p>
                    <p>the appropriate section of Schedule E to ensure that the reported<br />income matches the
                        form.<br />
                    </p>
                </div>
                <p class="every_page_footer"><b>&#169; GALILEO TAX STRATEGIES, LLC ${html_payload.current_year} </b>-
                    MAY NOT BE REPRODUCED WITHOUT
                    PERMISSION<br />4</p>

            </div>
        </div>
        <div style="page-break-before:always; page-break-after:always">
            <div>
                <p><b>Augusta Rule Suporting Documentation<br /></b>${html_payload.first_name} ${html_payload.last_name}
                    ${html_payload.year}<br /></p>
                <p><b>Step 4</b>: Apply the Augusta Rule Exclusion<br />1. <b>Determine Applicability</b>: Confirm that
                    your
                    rental income qualifies for<br /></p>
                <p>exclusion under IRC Section 280A(g) (The Augusta Rule), which allows<br />you to exclude rental
                    income
                    for up to 14 days annually.<br /></p>
                <p>2. <b>Footnote Explanation</b>: Prepare a footnote or statement to accompany<br />Schedule E,
                    explaining
                    that the rental income is not taxable due to IRC<br />Section 280A(g). Include the following details
                    in
                    the footnote:<br /></p>
                <p>&#9675; Reference to IRC Section 280A(g).<br />&#9675; Explanation that the rental period did not
                    exceed
                    14 days.<br />&#9675; Statement that the income qualifies for exclusion under the<br /></p>
                <p>Augusta Rule.<br />&#9675; Example Footnote:<br /></p>
                <p>The rental income reported on Form 1099-MISC is excluded<br />from taxable income under IRC Section
                    280A(g). The property<br />was rented for fewer than 14 days during the year, qualifying
                    for<br />the
                    Augusta Rule exclusion.<br /></p>
                <p><b>Step 5</b>: File Your Tax Return<br />1. <b>Attach Schedule E</b>: Attach the completed Schedule
                    E,
                    including the<br /></p>
                <p>footnote, to your federal tax return.<br />2. <b>Submit Your Return</b>: File your federal tax
                    return,
                    ensuring all<br /></p>
                <p>documents are included.<br /></p>
                <p><b>Step 6</b>: Handling No Form 1099-MISC<br />1. <b>Income Under $600</b>: If you did not receive
                    Form
                    1099-MISC because<br /></p>
                <p>the rental income was under $600, you generally do not need to file<br />Form 1099-MISC.<br /></p>
                <p>2. <b>Maintain Records</b>: Keep thorough records of all rental income<br />received, even if it is
                    under
                    $600, to support your claim in case of an<br />audit.<br /></p>
                <p><b>Step 7</b>: Business Use of Form 1099-MISC<br /></p>
                <p class="every_page_footer"><b>&#169; GALILEO TAX STRATEGIES, LLC ${html_payload.current_year} </b>-
                    MAY NOT BE REPRODUCED WITHOUT
                    PERMISSION<br />5</p>

            </div>
        </div>
        <div style="page-break-before:always; page-break-after:always">
            <div>
                <p><b>Augusta Rule Suporting Documentation<br /></b>${html_payload.first_name} ${html_payload.last_name}
                    ${html_payload.year}<br /></p>
                <p>1. <b>File When Required</b>: If you are required to issue Form 1099-MISC for<br />your business,
                    ensure
                    you file it correctly, even if the amount is under<br />$600.<br /></p>
                <p>2. <b>Follow IRS Guidelines</b>: Adhere to IRS guidelines for filing and issuing<br />Form 1099-MISC
                    to
                    avoid penalties.<br /></p>
                <p style="color: #1255cc; font-size: 1.1rem;"><i>The IRS will disallow expenses that are paid to
                        contractors or rent if you were<br />supposed to
                        prepare a Form 1099 and didn&#8217;t send one.<br /></i></p>
                <p>Here&#8217;s a helpful summary:<br /></p>

                <table style="border: 1px solid grey;">
                    <tr>
                        <th>Issue</th>
                        <th>Action Required</th>
                    </tr>
                    <tr>
                        <td>Over $600: Form 1099-Misc</td>
                        <td>Report on Schedule E with a footnote<br />explaining non-taxable
                            status due to
                            IRC 280A(g)</td>
                    </tr>
                    <tr>
                        <td>Under $600: No Form 1099-MISC</td>
                        <td>No filing needed, but issue Form 1099 if required for your business.</td>
                    </tr>
                    <tr>
                        <td>IRS and State Reporting</td>
                        <td>Always prepare for scrutiny from the IRS and state; ensure proper income reporting.</td>
                    </tr>
                </table>
            </div>
        </div>
        <div style="page-break-before:always; page-break-after:always">
            <div>
                <p><b>Augusta Rule Suporting Documentation<br /></b>${html_payload.first_name} ${html_payload.last_name}
                    ${html_payload.year}<br /></p>
                <h2><b>Rental &amp; Utilization Summary<br /></b></h2>
                <hr />
                <div class="table-container_deficiencies">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Rental</th>
                                <th>Amount Activity</th>
                            </tr>
                        </thead>
                        <tbody id="table-body-deficiencies">
                        <tbody>
                        ${Array.isArray(html_payload.rental_date) ? html_payload.rental_date.map((item: any) => `
                            <tr>
                                <td>${formatDateTOMonthDayYear(item.date)}</td>
                                <td>$${item.rate}</td>
                                <td>${item.purpose}</td>
                            </tr>`).join('') : `
                            <tr>
                                <td colspan="3">No rental data available</td>
                            </tr>`}
                        </tbody>
                        </tbody>
                    </table>
                </div>
                <div class="">
                    <h3>Totals</h3>
                    <table>
                        <tbody id="">
                        <tbody>
                            <tr>
                                <td>${html_payload.total_rented_days}</td>
                                <td>$${html_payload.total_rental_amount}</td>
                            </tr>
                        </tbody>
                        </tbody>
                    </table>
                </div>
                <!-- <p>14 Days $16,800<br /></p> -->

                <p class="every_page_footer"><b>&#169; GALILEO TAX STRATEGIES, LLC ${html_payload.current_year} </b>-
                    MAY NOT BE REPRODUCED WITHOUT
                    PERMISSION<br />7</p>

            </div>
        </div>
        <div style="page-break-before:always; page-break-after:always">
            <div>
                <p><b>Augusta Rule Suporting Documentation<br /></b>${html_payload.first_name} ${html_payload.last_name}
                    ${html_payload.year}<br /></p>
                <div class="">
                    <h2>
                        Step-by-Step Guide: Augusta Rule & Home offices
                    </h2>
                    <hr />
                    <p style="font-size: 1.3rem;">Overview</p>
                    <p>
                        The Augusta Rule (IRC Section 280A(g)) allows homeowners to rent out their personal residence
                        for up to 14 days annually without reporting the rental income. However, combining this rule
                        with the home office deduction requires careful planning to avoid tax issues. This guide
                        outlines how to navigate these rules and implement an accountable plan for tax-free
                        reimbursement of home office expenses.
                    </p>
                    <p style="font-size: 1.5rem;">Combining the Home office Deduction and the Augusta Rule</p>
                    <p><b>Problem: </b>Renting a home office to the business for more than 14 days invalidates the
                        Augusta Rule's tax-free benefit.</p>
                    <p><b>Solution</b>: Implementing an Accountable Plan</p>
                    <p>An accountable plan allows the business to reimburse employees for home office expenses without
                        the reimbursements being treated as taxable income. This maintains the benefits of the Augusta
                        Rule while providing a tax-free way to handle home office expenses.</p>
                    <p>Steps to Implement an Accountable Plan</p>
                    <p>1. <b>Draft a Formal Plan Document</b>:</p>
                    <p>&#9675; <b>Business Connection</b>: Expenses must be directly related to business activities.</p>
                    <p>&#9675; <b>Substantiation</b>: Employees must provide proof of expenses within 60 days.</p>
                    <p>&#9675; <b>Return of Excess</b>: Employees must return any unused advance payments within a
                        reasonable timeframe.</p>

                </div>
                <p class="every_page_footer"><b>&#169; GALILEO TAX STRATEGIES, LLC ${html_payload.current_year} </b>-
                    MAY NOT BE REPRODUCED WITHOUT
                    PERMISSION<br />8</p>

            </div>
        </div>
        <div style="page-break-before:always; page-break-after:always">
            <div>
                <p><b>Augusta Rule Supporting Documentation</b></p>
                <p>${html_payload.first_name} ${html_payload.last_name} ${html_payload.year}</p>

                <p>2. <b>Adopt the Plan</b>: The corporation must formally adopt the accountable plan by including it in
                    corporate minutes or other official documents.</p>

                <p>3. <b>Communicate the Plan</b>: Ensure all employees are aware of the accountable plan and understand
                    how to document and submit expenses for reimbursement.</p>

                <p>4. <b>Reimburse Expenses</b>: Under the accountable plan, the business reimburses employees for their
                    home office expenses. These reimbursements are:</p>

                <p>&#9675; <b>Tax-Deductible for the Corporation</b>: The business can deduct these expenses as business
                    expenses.</p>
                <p>&#9675; <b>Tax-Free for the Employee</b>: The reimbursements are not included in the employee's
                    taxable income.</p>

                <p>5. <b>Maintain Records</b>: Keep detailed records of all expenses reimbursed under the accountable
                    plan to ensure compliance with IRS requirements.</p>

                <p style="font-size: 1.3rem;">Conclusion</h3>
                <p>By implementing an accountable plan, you can ensure that home office expenses are reimbursed
                    tax-free, while maintaining compliance with the Augusta Rule. This approach avoids the pitfalls of
                    converting rental income into taxable income for employees and leverages the benefits of both the
                    Augusta Rule and the home office deduction.</p>

                <p><b>Additional References</b></p>
                <p>&#9679; IRS Publication 587 (Business Use of Your Home): IRS.gov</p>
                <p>&#9679; IRS Form 8829 (Expenses for Business Use of Your Home): IRS.gov</p>
                <p>&#9679; IRS Guidance on Accountable Plans: IRS.gov</p>

                <p class="every_page_footer"><b>&#169; GALILEO TAX STRATEGIES, LLC ${html_payload.current_year}</b> -
                    MAY NOT BE REPRODUCED WITHOUT PERMISSION</p>
            </div>
        </div>
        <div style="page-break-before:always; page-break-after:always">
            <div>
                <p><b>Augusta Rule Suporting Documentation<br /></b>${html_payload.first_name} ${html_payload.last_name}
                    ${html_payload.year}<br /></p>
                <div class="">
                    <h2>Supporting Documents</h2>
                    <hr />
                </div>
                <p>In this section, you’ll find your lease agreement, corporate minutes, and fee substantiation report.
                    If the IRS ever requires supporting documentation, this is the section that would be provided to
                    support your tax position.</p>

                <p class="every_page_footer"><b>&#169; GALILEO TAX STRATEGIES, LLC ${html_payload.current_year}</b> -
                    MAY NOT BE REPRODUCED WITHOUT PERMISSION</p>
            </div>
        </div>
        <div style="page-break-before:always; page-break-after:always">
            <div>
                <p><b>Augusta Rule Suporting Documentation<br /></b>${html_payload.first_name} ${html_payload.last_name}
                    ${html_payload.year}<br /></p>
                <div class="">
                    <h2>Substantiating Brief Regarding Application of the Augusta Rule</h2>
                    <hr />
                    <p><b>Re: </b>Justification of Rental Fee for Personal Residence under IRC Section 280A(g) - The
                        Augusta
                        Rule</p>

                    <p>Taxpayer: ${html_payload.first_name} ${html_payload.last_name}</p>

                    <p>Property Address: ${html_payload.house_address}</p>

                    <p><b>I. Introduction</b></p>
                    <p>This brief is prepared on behalf of ${html_payload.first_name} ${html_payload.last_name} to
                        substantiate the rental fee of ${html_payload.daily_amount} per day for their personal residence
                        located at ${html_payload.property_address} under the Augusta Rule (IRC Section 280A(g)). This
                        brief
                        aims to demonstrate compliance with the statutory requirements and provide market-based
                        justification for the rental rate.</p>

                    <p><b>II. Legal Framework</b></p>
                    <p>The Augusta Rule, codified in IRC Section 280A(g), allows homeowners to rent out their personal
                        residence for up to 14 days annually without the rental income being subject to federal income
                        tax.
                        The pertinent provisions are as follows:</p>

                    <p>1. <b>Duration Limitation</b>: The rental period must not exceed 14 days in a calendar year.</p>

                    <p>2. <b>Fair Market Value</b>: The rental rate must reflect fair market value.</p>

                    <p>3. <b>Documentation Requirements</b>: Adequate documentation must be maintained to substantiate
                        the
                        rental arrangement.</p>

                    <p class="every_page_footer"><b>&#169; GALILEO TAX STRATEGIES, LLC ${html_payload.current_year}</b>
                        -
                        MAY NOT BE REPRODUCED WITHOUT PERMISSION</p>
                </div>
            </div>
        </div>
        <div style="page-break-before:always; page-break-after:always">
            <div>
                <p><b>Augusta Rule Supporting Documentation</b></p>
                <p>${html_payload.first_name} ${html_payload.last_name} ${html_payload.year}</p>

                <p style="font-size: 1.3rem;">III. Compliance with IRC Section 280A(g)</p>

                <p><b>A. Rental Period</b></p>
                <p>The rental period for ${html_payload.client_name}’s property did not exceed the 14-day limitation set
                    forth by IRC Section 280A(g). The property was rented to ${html_payload.business_entity_name} for
                    ${html_payload.total_rented_days} days during the calendar year ${html_payload.year}.</p>

                <p><b>B. Written Rental Agreement</b></p>
                <p>A formal written rental agreement between ${html_payload.client_name} and
                    ${html_payload.business_entity_name} was executed, specifying the terms, rental period, and the
                    rental rate of ${html_payload.daily_amount} per day. This agreement is included as Exhibit A.</p>

                <p><b>C. Market-Based Rental Rate Justification</b></p>
                <p>To substantiate the rental rate of ${html_payload.daily_amount} per day, we have compiled a list of
                    comparable properties in the ${html_payload.city_name}, ${html_payload.state_name}
                    ${html_payload.zip_code} area. The comparables demonstrate that the rental rate is consistent with
                    market rates for similar properties. The table is contained in Exhibit B.</p>

                <p>These comparables indicate that the daily rental rate of ${html_payload.daily_amount} for
                    ${html_payload.client_name}’s property is reasonable and aligned with market standards for premium
                    properties offering similar amenities.</p>

                <p style="font-size: 1.3rem;">IV. Documentation</p>

                <p><b>A. Written Rental Agreement</b></p>
                <p>&#9679; Exhibit A: Signed rental agreement between ${html_payload.client_name} and
                    ${html_payload.business_entity_name}.</p>

                <p><b>B. Evidence of Market Rates</b></p>
                <p>&#9679; Exhibit B: Printouts and screenshots of comparable properties from Peerspace and other rental
                    platforms.</p>

                <p><b>C. Business Use Documentation</b></p>

                <p class="every_page_footer"><b>&#169; GALILEO TAX STRATEGIES, LLC ${html_payload.current_year}</b> -
                    MAY NOT BE REPRODUCED WITHOUT PERMISSION</p>
            </div>

        </div>
        <div style="page-break-before:always; page-break-after:always">
            <div>
                <p><b>Augusta Rule Supporting Documentation</b></p>
                <p>${html_payload.first_name} ${html_payload.last_name} ${html_payload.year}</p>

                <p>&#9679; Exhibit C: Meeting minutes, notes, and other relevant documents evidencing the business use
                    of the property by ${html_payload.business_entity_name} during the rental period.</p>

                <p class="font-size:1.3rem">V. Case Law Supporting Compliance</p>

                <p><b>A. Bolton v. Commissioner, 77 T.C. 104 (1981)</b></p>
                <p>&#9679; This case upheld the exclusion of rental income under Section 280A(g) when the taxpayer met
                    all statutory requirements, including maintaining proper documentation and fair market value
                    justification.</p>

                <p><b>B. Lowe v. Commissioner, T.C. Memo 2012-197</b></p>
                <p>&#9679; Emphasized the necessity of maintaining thorough documentation and ensuring the rental rate
                    reflects fair market value.</p>

                <p style="font-size: 1.3rem;">VI. Conclusion</p>
                <p>Based on the compliance with IRC Section 280A(g), the documentation provided, and the justification
                    of the rental rate through comparable market data, we assert that the rental income received by
                    ${html_payload.client_name} for the rental of their personal residence to
                    ${html_payload.business_entity_name} is excludable from gross income under the Augusta Rule.</p>

                <p>The client has met all the statutory requirements, including the execution of a written rental
                    agreement, substantiation of the rental rate through market comparables, and thorough documentation
                    of the business use of the property.</p>
                <hr />
                <p><b>Exhibits</b></p>
                <p><b>Exhibit A</b>: Signed Rental Agreement</p>
                <p><b>Exhibit B</b>: Market Comparables from Peerspace</p>
                <p><b>Exhibit C</b>: Business Use Documentation</p>

                <p class="every_page_footer"><b>&#169; GALILEO TAX STRATEGIES, LLC ${html_payload.current_year}</b> -
                    MAY NOT BE REPRODUCED WITHOUT PERMISSION</p>
            </div>

        </div>
        <div style="page-break-before:always; page-break-after:always">
            <div>
                <p><b>Augusta Rule Supporting Documentation</b></p>
                <p>${html_payload.first_name} ${html_payload.last_name} ${html_payload.year}</p>

                <h2><b>Exhibit A</b>: Rental Agreement</h2>
                <p>This Lease Agreement ("Agreement") is made and entered into on multiple dates as described in
                    Attachment 1, by and between <b>${html_payload.first_name} ${html_payload.last_name}</b>,
                    hereinafter referred to as the "Lessor", and <b>${html_payload.business_name}</b>, hereinafter
                    referred to as the "Lessee".</p>

                <p>1. <b>Premises</b>: Lessor agrees to lease to Lessee, and Lessee agrees to lease from Lessor, the
                    residential property located at:</p>
                <p>${html_payload.property_address}</p>
                <p>hereinafter referred to as the "Premises".</p>

                <p>2. <b>Purpose</b>: The Premises will be used exclusively for business meetings or other related
                    business purposes. No other use is permitted without the written consent of the Lessor.</p>

                <p>3. <b>Term &amp; Rent</b>: The term of this Lease shall be for 1 or more days, as described in
                    Attachment 1. Lessee agrees to pay Lessor a rent for the term of this Lease. The rent shall be
                    payable in advance on or before the commencement date or as a lump sum at any given time in the
                    year, unless expressly allowed by Lessor. The rental amounts are described in Attachment 1.</p>

                <p>4. <b>Security Deposit</b>: Unless waived, a security deposit of $300 is required and will be
                    returned to the Lessee upon termination of this Lease, minus any amounts required to repair damages
                    caused by the Lessee.</p>

                <p>5. <b>Maintenance</b>: Lessee shall, at its own expense, maintain the Premises in a clean and tidy
                    condition.</p>

                <p>6. <b>Insurance</b>: Lessee shall provide and maintain, at its own expense, comprehensive general
                    liability insurance covering any damage or injury occurring on the Premises during the term of this
                    Lease.</p>

                <p class="every_page_footer"><b>&#169; GALILEO TAX STRATEGIES, LLC ${html_payload.current_year}</b> -
                    MAY NOT BE REPRODUCED WITHOUT PERMISSION</p>
            </div>

        </div>
        <div style="page-break-before:always; page-break-after:always">
            <div class="">

                <div>
                    <p><b>Augusta Rule Supporting Documentation</b></p>
                    <p>${html_payload.first_name} ${html_payload.last_name} ${html_payload.year}</p>

                    <p>7. <b>Termination</b>: Should Lessee breach any provision of this Agreement, Lessor may terminate
                        this Lease upon 24 hours' written notice to Lessee. Lessor can also terminate this Agreement for
                        any reason by providing 48 hours' written notice to Lessee.</p>

                    <p>8. <b>Indemnification</b>: Lessee shall indemnify and hold Lessor harmless from any and all
                        claims, damages, or lawsuits arising from Lessee's use of the Premises, including but not
                        limited to any actions brought by attendees of the business meetings or other events held by the
                        Lessee on the Premises.</p>

                    <p>9. <b>Entire Agreement</b>: This Agreement contains the entire agreement between the parties and
                        supersedes all prior negotiations, understandings, and agreements between the parties.</p>

                    <p>10. <b>Amendments &amp; Notices</b>: Any changes or modifications to this Agreement must be in
                        writing and signed by both parties. Any notice required or permitted under this Agreement shall
                        be in writing and shall be deemed sufficiently given if sent by certified mail, return receipt
                        requested, addressed to the other party at the address set forth above, or at such other address
                        as may be provided in writing.</p>
                    <div class=""
                        style="display: flex; align-items: flex-start; justify-content: space-between; width: 80%; ">
                        <p class="margin_0" style="font-size: 1.3rem; ">Lessor:</p>
                        <div style="display: flex; flex-direction: column;">
                            <p class="margin_0" style="font-size: 1.3rem; ">Lessee:</p>
                            <div class="data" style="width: 100%; text-align: right; margin-top: 10px;">
                                <p><b>${html_payload.business_name}</b></p>
                                <p>For the ${html_payload.business_name}:</p>
                            </div>
                        </div>
                    </div>
                    <p><b>${html_payload.first_name} ${html_payload.last_name}</b></p>

                    <p class="every_page_footer"><b>&#169; GALILEO TAX STRATEGIES, LLC ${html_payload.current_year}</b>
                        - MAY NOT BE REPRODUCED WITHOUT PERMISSION</p>
                </div>


            </div>
        </div>
        <div style="page-break-before:always; page-break-after:always">
            <div>
                <p><b>Augusta Rule Suporting Documentation<br /></b>${html_payload.first_name} ${html_payload.last_name}
                    ${html_payload.year}<br /></p>

                <div class="">
                    <h2><b>Exhibit B</b>: Market Comparables<br /></h2>
                    <p style="font-size: 1.3rem;">Methodology for Rental Rate Justification<br /></p>
                    <table style="border: 1px solid grey;">
                        <tr>
                            <th style="width: 33.34%;">Step</th>
                            <th style="width: 33.34%;">Justification</th>
                            <th style="width: 33.34%;">Assumptions</th>
                        </tr>
                        <tr>
                            <td>1. Property Criteria Definition</td>
                            <td>To ensure the comparable property closely matches the client's property, providing a
                                reliable basis for market value assessment.</td>
                            <td>The property selected must be in a similar geographical location and offer similar
                                features to our client's property.</td>
                        </tr>
                        <tr>
                            <td>2. Online Market Research</td>
                            <td>These platforms provide real-time rental data and are widely recognized for their
                                accuracy in representing current market trends.</td>
                            <td>The selected platforms are representative of the wider rental market and offer a variety
                                of properties for comparison.</td>
                        </tr>
                        <tr>
                            <td>3. Comparable Property Selection</td>
                            <td>A single comparable is chosen for focused analysis to provide a clear and concise market
                                value comparison.</td>
                            <td>The chosen property is the best match available at the time of research and represents a
                                fair market value.</td>
                        </tr>
                        <tr>
                            <td>4. Rental Rate Analysis</td>
                            <td>To validate that the client's rental rate is in line with current market values.</td>
                            <td>The rental rate of the comparable property reflects fair market value for a property of
                                its type and location.</td>
                        </tr>
                    </table>
                </div>
                <p class="every_page_footer"><b>&#169; GALILEO TAX STRATEGIES, LLC ${html_payload.current_year} </b>-
                    MAY NOT BE REPRODUCED WITHOUT
                    PERMISSION<br />16</p>

            </div>
        </div>
        <div style="page-break-before:always; page-break-after:always">
            <div>
                <p><b>Augusta Rule Suporting Documentation<br /></b>${html_payload.first_name} ${html_payload.last_name}
                    ${html_payload.year}<br /></p>
                <p>The following list was retrieved from various sources on [Retreival Date]<br /></p>
                <div class="table-container_deficiencies">
                    <table>
                        <thead>
                            <tr>
                                  <th style="width: 20%;">URL</th>
                        <th style="width: 20%;">State</th>
                        <th style="width: 20%;">Hourly Rate</th>
                        <th style="width: 20%;">Description</th>
                        <th style="width: 20%;">Zip Code</th>
                            </tr>
                        </thead>
                        <tbody id="table-body-deficiencies">
                        <tbody>
                        ${Array.isArray(html_payload.property) ? html_payload.property.slice(0, 5).map((item: any) => `
                            <tr>
                                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                    <a href="${item.image_url}" target="_blank">${item.image_url}</a> 
                                </td>
                                <td>${item.state}</td>
                                <td>$${item.hourly_rent_amount}</td>
                                <td>${item.description}</td>
                                <td>${item.zip_code}</td>
                            </tr>`).join('') : `
                            <tr>
                                <td colspan="5">No properties available</td>
                            </tr>` }
 </tbody>
                        </tbody>
                    </table>
                </div>
                <p class="every_page_footer"><b>&#169; GALILEO TAX STRATEGIES, LLC ${html_payload.current_year} </b>-
                    MAY NOT BE REPRODUCED WITHOUT
                    PERMISSION<br />17</p>

            </div>
        </div>
        <div style="page-break-before:always; page-break-after:always">
            <div>
                <p><b>Augusta Rule Suporting Documentation<br /></b>${html_payload.first_name} ${html_payload.last_name}
                    ${html_payload.year}<br /></p>
                <div>
                    <h2><b>Exhibit C</b>: Business Use Documentation<br /></b></h2>
                    <hr />
                    <div class="table-container_deficiencies">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Rental</th>
                                    <th>Amount Activity</th>
                                </tr>
                            </thead>
                            <tbody id="table-body-deficiencies">
                            <tbody>
                            ${Array.isArray(html_payload.rental_date) ? html_payload.rental_date.map((item: any) => `
                                <tr>
                                    <td>${formatDateTOMonthDayYear(item.date)}</td>
                                    <td>$${item.rate}</td>
                                    <td>${item.purpose}</td>
                                </tr>`).join('') : `
                                <tr>
                                    <td colspan="3">No rental data available</td>
                                </tr>`}
                            </tbody>
                            </tbody>
                        </table>
                    </div>
                    <div class="">
                        <h3>Totals</h3>
                        <table>
                            <tbody id="">
                            <tbody>
                                <tr>
                                    <td>${html_payload.total_rented_days}</td>
                                <td>$${html_payload.total_rental_amount}</td>
                                </tr>
                            </tbody>
                            </tbody>
                        </table>
                    </div>
                    <!-- <p>14 Days $16,800<br /></p> -->

                    <p class="every_page_footer"><b>&#169; GALILEO TAX STRATEGIES, LLC ${html_payload.current_year}
                        </b>-
                        MAY NOT BE REPRODUCED WITHOUT
                        PERMISSION<br />7</p>
                </div>

            </div>
        </div>
        <div style="page-break-before:always; page-break-after:always">
            <div>
                <p><b>Augusta Rule Suporting Documentation<br /></b>${html_payload.first_name} ${html_payload.last_name}
                    ${html_payload.year}<br /></p>
                <p style="font-size: 1.3rem;">Corporate Meeting Minutes for ${html_payload.business_name}<br />on
                    ${html_payload.business_planning_date}<br /></p>

                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Position</th>
                        </tr>
                    </thead>
                    <tbody id="table-body-deficiencies">
                    <tbody>
                        <td style="width: 50%;">${html_payload.first_name} ${html_payload.last_name}</td>
                        <td style="width: 50%;">${html_payload.position}</td>
                    </tbody>
                    </tbody>
                </table>
                <div>
                    <p>1. <b>Call to Order</b>: The meeting was called to order by ${html_payload.client_name}.</p>

                    <p>2. <b>Attendance</b>: The listed corporate officers were in attendance.</p>

                    <p>3. <b>Approval of Previous Minutes</b>: The minutes from the previous meeting were reviewed. A
                        motion to approve the minutes was made.</p>

                    <p>4. <b>New Business</b>: [if no entry, “Reviewed business performance and identified areas for
                        improvement. Evaluated pathways to achieve these business goals.”]</p>

                    <p>5. <b>Adjournment</b>: A motion to adjourn the meeting was made. The motion was approved by
                        unanimous vote.</p>

                    <p style= "color:red"><b>**Repeats with every incidence of Corporate Meetings (limited to 12/year)</b></p>
                    <hr/>
                </div>
            </div>
        </div>
        </body>
            </html>
`;
            // Set content of the page
            await page.setContent(htmlContent, { waitUntil: "networkidle0" });
            // Generate PDF with header and footer
            const pdfBuffer = await page.pdf({
                format: "A4",
                // margin: {
                //     top: "0px", // Adjust the top margin to fit the header
                //     bottom: "0px", // Adjust the bottom margin to fit the footer
                //     left: "0px",
                //     right: "0px",
                // },
                printBackground: true,
            });

            const pdfFileName = `report-${generateRandomAlphanumeric(14)}.pdf`;
            const file = {
                fieldname: "augusta_report",
                originalname: pdfFileName,
                mimetype: "application/pdf",
                buffer: pdfBuffer,
            };

            const pdfLink = await uploadFileToS3([file]);
            await browser.close();
            resolve({ status: true, data: pdfLink.data[0] });
        } catch (err: any) {
            console.log("Err in catch, ", err.message);
            reject(new Error('Unable to generate invoice pdf!'));
        }
    });
}; //ends
