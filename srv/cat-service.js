const { default: cds } = require("@sap/cds");
const { generics } = require("@sap/cds/srv/app-service");

module.exports = cds.service.impl( async function(){
    // Step - 1 : Get the object of our ODATA Entities
    const { EmployeeDetails, PODetails } = this.entities;
    const { uuid } = cds.utils;

    // Step - 2 : Develop a generic handler for validation of Employees Set
    this.before('UPDATE', EmployeeDetails, (request, response) =>{
        console.log("--------Salary Amount -------" + request.data.salaryAmount);
        if(parseFloat(request.data.salaryAmount) >= 150000){
            request.error(500, "Salary must not be more than 150K");
        }
    });

    this.on('increasedPrice', async( request, response) =>{
        try {
            // Step - 1 : Get the ID from params
            const ID = request.params[0];

            // Step - 2 : Declare the transaction component
            const transaction = cds.tx(request);

            // Step - 3 : Perform update transaction in the database
            response = await transaction.update(PODetails).with({
                GROSS_AMOUNT : { '+=' : 2200 },
                NET_AMOUNT : { '+=' : 2000},
                TAX_AMOUNT : { '+=' : 200}
            }).where(ID);

            // Step - 5 : Return the response
            return response;
        } catch (error) {
            return "Error : " + error.toString();
        }
    });

    this.on('largestOrder', async (request, response) =>{
        try {
            const ID = request.params[0];
            // Step - 1 : Declare teh transaction component
            const transaction = cds.tx(request);

            // Step - 2 : Read the heighest order using PO Details.
            const response = await transaction.read(PODetails).orderBy({
                GROSS_AMOUNT : 'desc'
            }).limit(1);

            // Step - 3 : Return the response
            return response;
        } catch (error) {
            return "Error "+ error.toString();
        }
    });

    this.on('createEmployee', async (request, resopnse) => {
        try {
            const employeeData = {
                nameFirst,
                nameMiddle,
                nameLast,
                nameInitials,
                gender,
                language,
                phone,
                email,
                loginName,
                salaryAmount,
                accountNumber,
                bankId,
                bankName
            } = request.data, id = uuid();
            // let or var - to declare a variable
            let finalResponse = undefined;
            let entryToBeCreated = {
                ID : id,
                nameFirst : employeeData.nameFirst,
                nameMiddle : nameMiddle,
                nameLast : nameLast,
                nameInitials : nameInitials,
                gender : gender,
                language : language,
                phone : phone,
                email : email,
                loginName : loginName,
                salaryAmount : salaryAmount,
                accountNumber : accountNumber,
                bankId : bankId,
                bankName : bankName
            }

            let insertedData = await cds.run(INSERT.into('POCAP_DB_MASTER_EMPLOYEES').entries([entryToBeCreated]));

            let createdData = await cds.run(SELECT.from('POCAP_DB_MASTER_EMPLOYEES').where({ ID : { '=' : id } }));

            finalResponse = {
                statusCode : '200',
                message : 'Employee record has been created',
                data : createdData
            } ;

            return finalResponse;
        } catch (error) {
            return "Error "+ error.toString();
        }
    });

    this.on('getProducts', async(request, response) => {
        try {
            let tempCode = request.req.params[0];
            // tempCode.findall('')
            console.log(tempCode);
            tempCode = tempCode.split("'")[1];
            console.log(tempCode);
            let finalResponse = undefined;

            finalResponse = await cds.run(SELECT.from('POCAP_DB_MASTER_PRODUCT').columns('PRODUCT_ID','TYPE_CODE','CATEGORY','DESCRIPTION','PRICE','CURRENCY_CODE').where({ CURRENCY_CODE : { '=' : tempCode } }));
            
            return {
                response : finalResponse
            };
        } catch (error) {
            return "Error "+ error.toString();
        }
    })
})