using {
    pocap.db.master      as master,
    pocap.db.transaction as transaction
} from '../db/datamodel';
using {pocap.common as common} from '../db/common';
using {Currency} from '@sap/cds/common';


service CatalogService @(path: 'CatalogService', requires: 'authenticated-user') {

    @Capabilities: {
        InsertRestrictions: {
            $Type     : 'Capabilities.InsertRestrictionsType',
            Insertable: true
        },
        UpdateRestrictions: {
            $Type    : 'Capabilities.UpdateRestrictionsType',
            Updatable: true
        },
        DeleteRestrictions: {
            $Type    : 'Capabilities.DeleteRestrictionsType',
            Deletable: false
        },
    }
    entity BusinessPartnerService as projection on master.businesspartner;

    entity ProductInformation     as projection on master.product;

    entity EmployeeDetails @(restrict: [
        {
            grant : ['READ'], to : 'Viewer', where : 'bankName = $user.bankName'
        },
        {
            grant : ['WRITE'], to : 'Admin'
        }
    ]) as projection on master.employees;

    extend entity master.address with {
        countryE : Association to master.countries
                            on countryE.iso2 = COUNTRY;
    }

    extend entity master.address with {
        countryDesc : String = countryE.name    @(title: '{i18n>COUNTRY}');
    }
    entity AddressInfo  as 
        select from master.address{
            *
        };



    entity PODetails @(
        odata.draft.enabled : true
    )              as
        projection on transaction.purchaseorder {
            *,
            case OVERALL_STATUS
                when 'N' then 'New'
                when 'P' then 'Paid'
                when 'B' then 'Blocked'
                when 'R' then 'Returned'
                else 'Delivered'
            end as OverallStatus : String(20) @(title: '{i18n>OVERALL_STATUS}'),
            case OVERALL_STATUS
                when 'N' then 3
                when 'P' then 2
                when 'B' then 1
                when 'R' then 1
                else 3
            end as OSCriticality : Integer,
            case LIFECYCLE_STATUS
                when 'N' then 'New'
                when 'I' then 'In Progress'
                when 'P' then 'Pending'
                when 'C' then 'Cancelled'
                else 'Done'
            end as LifecycleStatus : String(20) @(title: '{i18n>LIFECYCLE_STATUS}'),
            case LIFECYCLE_STATUS
                when 'N' then 3
                when 'I' then 1
                when 'P' then 2
                when 'C' then 1
                else 2
            end as LSCriticality : Integer,

            Items : redirected to POItems
        }
        actions {
            @cds.odata.bindingparameter.name : '_pricehike'
            @Common.SideEffects : {
                TargetProperties : [
                    '_pricehike/GROSS_AMOUNT'
                ],
            }
            action   increasedPrice() returns array of PODetails;
            function largestOrder()   returns array of PODetails;
        };

    entity POItems                as projection on transaction.purchaseitems;

    /*
    type employeeType {
            nameFirst : String(40),
            nameMiddle : String(40),
            nameLast : String(40),
            nameInitials : String(40),
            gender : common.Gender,
            language : String(2),
            phone : common.phoneNumber,
            email : common.Email,
            Currency  : Currency,
            loginName : String(15),
            salaryAmount : common.AmountT,
            accountNumber : String(16),
            bankId : String(12),
            bankName : String(64)
            }
        action createEmployee( input(Import Parameter) : employeeType ) retruns EmployeeDetails(Export parameter);
        OR
        action createEmployee( input : EmployeeDetails );
    */
    action   createEmployee(
                            // Import Parameterss
                            nameFirst: String(40),
                            nameMiddle: String(40),
                            nameLast: String(40),
                            nameInitials: String(40),
                            gender: common.Gender,
                            language: String(2),
                            phone: common.phoneNumber,
                            email: common.Email,
                            loginName: String(15),
                            salaryAmount: common.AmountT,
                            accountNumber: String(16),
                            bankId: String(12),
                            bankName: String(64))
                                                  // Export Parameters
                                                  returns array of String;

    function getProducts(CurrencyCode: String(3)) returns ProductInformation;
}
