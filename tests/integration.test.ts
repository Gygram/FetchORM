import { BaseEntity } from '../src/entities/base-entity';

// Define entity types for real-world scenarios
interface Account {
    name: string;
    emailaddress1: string;
    telephone1: string;
    revenue: number;
    accountid: string;
    statecode: number;
    createdon: Date;
    isactive: boolean;
    address1_city: string;
    address1_country: string;
}

interface Contact {
    firstname: string;
    lastname: string;
    emailaddress1: string;
    contactid: string;
    statecode: number;
    parentcustomerid: string;
    jobtitle: string;
    mobilephone: string;
    birthdate: Date;
}

interface Opportunity {
    name: string;
    revenue: number;
    opportunityid: string;
    statecode: number;
    parentaccountid: string;
    parentcontactid: string;
    estimatedclosedate: Date;
    actualvalue: number;
    probability: number;
}

interface Email {
    subject: string;
    emailaddress: string;
    emailid: string;
    statecode: number;
    regardingobjectid: string;
    directioncode: number;
    createdon: Date;
}

// Create concrete entity classes
class AccountEntity extends BaseEntity<Account> {
    entityName = 'account';
}

class ContactEntity extends BaseEntity<Contact> {
    entityName = 'contact';
}

class OpportunityEntity extends BaseEntity<Opportunity> {
    entityName = 'opportunity';
}

class EmailEntity extends BaseEntity<Email> {
    entityName = 'email';
}

describe('FetchORM Integration Tests', () => {
    describe('Real-World Query Scenarios', () => {
        it('should generate query for active accounts with high revenue', () => {
            const account = new AccountEntity('account');
            
            const result = account
                .select('name', 'emailaddress1', 'telephone1', 'revenue')
                .where('statecode', 'eq', 0) // Active accounts
                .where('revenue', 'gt', 1000000) // High revenue
                .where('isactive', 'eq', true)
                .orderBy('revenue', 'desc')
                .top(50)
                .build();

            expect(result).toContain('entity name="account"');
            expect(result).toContain('attribute name="name"');
            expect(result).toContain('attribute name="emailaddress1"');
            expect(result).toContain('attribute name="telephone1"');
            expect(result).toContain('attribute name="revenue"');
            expect(result).toContain('condition attribute="statecode" operator="eq" value="0"');
            expect(result).toContain('condition attribute="revenue" operator="gt" value="1000000"');
            expect(result).toContain('condition attribute="isactive" operator="eq" value="true"');
            expect(result).toContain('order attribute="revenue" descending="true"');
            expect(result).toContain('top="50"');
        });

        it('should generate query for accounts with contacts and opportunities', () => {
            const account = new AccountEntity('account');
            
            const result = account
                .select('name', 'revenue')
                .sum('revenue', 'TotalRevenue')
                .where('statecode', 'eq', 0)
                .join<Contact>('contact', 'accountid', 'parentcustomerid', 'PrimaryContact')
                    .select('firstname', 'lastname', 'emailaddress1')
                    .where('statecode', 'eq', 0)
                    .end()
                .join<Opportunity>('opportunity', 'accountid', 'parentaccountid', 'AccountOpportunities')
                    .select('name', 'revenue')
                    .where('statecode', 'eq', 0)
                    .where('probability', 'gt', 50)
                    .end()
                .orderBy('revenue', 'desc')
                .distinct()
                .build();

            expect(result).toContain('entity name="account"');
            expect(result).toContain('attribute name="name"');
            expect(result).toContain('attribute name="revenue"');
            expect(result).toContain('attribute name="revenue" aggregate="sum" alias="TotalRevenue"');
            expect(result).toContain('link-entity name="contact" from="accountid" to="parentcustomerid" alias="PrimaryContact"');
            expect(result).toContain('attribute name="firstname"');
            expect(result).toContain('attribute name="lastname"');
            expect(result).toContain('attribute name="emailaddress1"');
            expect(result).toContain('link-entity name="opportunity" from="accountid" to="parentaccountid" alias="AccountOpportunities"');
            expect(result).toContain('attribute name="name"');
            expect(result).toContain('attribute name="revenue"');
            expect(result).toContain('condition attribute="probability" operator="gt" value="50"');
            expect(result).toContain('order attribute="revenue" descending="true"');
            expect(result).toContain('distinct="true"');
        });

        it('should generate query for contacts with recent emails', () => {
            const contact = new ContactEntity('contact');
            
            const result = contact
                .select('firstname', 'lastname', 'emailaddress1', 'jobtitle')
                .where('statecode', 'eq', 0)
                .where('emailaddress1', 'not-null')
                .join<Email>('email', 'contactid', 'regardingobjectid', 'ContactEmails')
                    .select('subject', 'emailaddress')
                    .where('statecode', 'eq', 0)
                    .where('createdon', 'last-seven-days')
                    .where('directioncode', 'eq', 1) // Incoming emails
                    .end()
                .orderBy('lastname', 'asc')
                .orderBy('firstname', 'asc')
                .page(1, 25)
                .build();

            expect(result).toContain('entity name="contact"');
            expect(result).toContain('attribute name="firstname"');
            expect(result).toContain('attribute name="lastname"');
            expect(result).toContain('attribute name="emailaddress1"');
            expect(result).toContain('attribute name="jobtitle"');
            expect(result).toContain('condition attribute="statecode" operator="eq" value="0"');
            expect(result).toContain('condition attribute="emailaddress1" operator="not-null"');
            expect(result).toContain('link-entity name="email" from="contactid" to="regardingobjectid" alias="ContactEmails"');
            expect(result).toContain('attribute name="subject"');
            expect(result).toContain('attribute name="emailaddress"');
            expect(result).toContain('condition attribute="createdon" operator="last-seven-days"');
            expect(result).toContain('condition attribute="directioncode" operator="eq" value="1"');
            expect(result).toContain('order attribute="lastname" descending="false"');
            expect(result).toContain('order attribute="firstname" descending="false"');
            expect(result).toContain('page="1" count="25"');
        });

        it('should generate query for opportunities with complex filtering', () => {
            const opportunity = new OpportunityEntity('opportunity');
            
            const result = opportunity
                .select('name', 'revenue', 'probability', 'estimatedclosedate')
                .where('statecode', 'eq', 0)
                .where('probability', 'ge', 25)
                .where('revenue', 'gt', 50000)
                .where('estimatedclosedate', 'this-month')
                .join<Account>('account', 'parentaccountid', 'accountid', 'OpportunityAccount')
                    .select('name', 'address1_city', 'address1_country')
                    .where('statecode', 'eq', 0)
                    .end()
                .join<Contact>('contact', 'parentcontactid', 'contactid', 'OpportunityContact')
                    .select('firstname', 'lastname', 'jobtitle')
                    .where('statecode', 'eq', 0)
                    .end()
                .orderBy('revenue', 'desc')
                .orderBy('probability', 'desc')
                .top(100)
                .build();

            expect(result).toContain('entity name="opportunity"');
            expect(result).toContain('attribute name="name"');
            expect(result).toContain('attribute name="revenue"');
            expect(result).toContain('attribute name="probability"');
            expect(result).toContain('attribute name="estimatedclosedate"');
            expect(result).toContain('condition attribute="statecode" operator="eq" value="0"');
            expect(result).toContain('condition attribute="probability" operator="ge" value="25"');
            expect(result).toContain('condition attribute="revenue" operator="gt" value="50000"');
            expect(result).toContain('condition attribute="estimatedclosedate" operator="this-month"');
            expect(result).toContain('link-entity name="account" from="parentaccountid" to="accountid" alias="OpportunityAccount"');
            expect(result).toContain('attribute name="name"');
            expect(result).toContain('attribute name="address1_city"');
            expect(result).toContain('attribute name="address1_country"');
            expect(result).toContain('link-entity name="contact" from="parentcontactid" to="contactid" alias="OpportunityContact"');
            expect(result).toContain('attribute name="firstname"');
            expect(result).toContain('attribute name="lastname"');
            expect(result).toContain('attribute name="jobtitle"');
            expect(result).toContain('order attribute="revenue" descending="true"');
            expect(result).toContain('order attribute="probability" descending="true"');
            expect(result).toContain('top="100"');
        });
    });

    describe('Aggregation and Analytics Queries', () => {
        it('should generate revenue analytics query', () => {
            const account = new AccountEntity('account');
            
            const result = account
                .select('address1_country')
                .sum('revenue', 'TotalRevenue')
                .avg('revenue', 'AverageRevenue')
                .count('accountid', 'AccountCount')
                .where('statecode', 'eq', 0)
                .where('revenue', 'gt', 0)
                .join<Opportunity>('opportunity', 'accountid', 'parentaccountid', 'AccountOpportunities')
                    .select('revenue', 'opportunityid')
                    .where('statecode', 'eq', 0)
                    .end()
                .orderBy('TotalRevenue', 'desc')
                .groupBy('address1_country')
                .build();

            expect(result).toContain('entity name="account"');
            expect(result).toContain('attribute name="address1_country"');
            expect(result).toContain('attribute name="revenue" aggregate="sum" alias="TotalRevenue"');
            expect(result).toContain('attribute name="revenue" aggregate="avg" alias="AverageRevenue"');
            expect(result).toContain('attribute name="accountid" aggregate="count" alias="AccountCount"');
            expect(result).toContain('link-entity name="opportunity" from="accountid" to="parentaccountid" alias="AccountOpportunities"');
            expect(result).toContain('attribute name="revenue"');
            expect(result).toContain('attribute name="opportunityid"');
            expect(result).toContain('order attribute="TotalRevenue" descending="true"');
        });

        it('should generate contact activity query', () => {
            const contact = new ContactEntity('contact');
            
            const result = contact
                .select('firstname', 'lastname')
                .count('contactid', 'ContactCount')
                .join<Email>('email', 'contactid', 'regardingobjectid', 'ContactEmails')
                    .select('emailid')
                    .where('statecode', 'eq', 0)
                    .where('createdon', 'last-month')
                    .end()
                .join<Opportunity>('opportunity', 'contactid', 'parentcontactid', 'ContactOpportunities')
                    .select('opportunityid', 'revenue')
                    .where('statecode', 'eq', 0)
                    .end()
                .where('statecode', 'eq', 0)
                .orderBy('contactid', 'desc')
                .top(50)
                .build();

            expect(result).toContain('entity name="contact"');
            expect(result).toContain('attribute name="firstname"');
            expect(result).toContain('attribute name="lastname"');
            expect(result).toContain('attribute name="contactid" aggregate="count" alias="ContactCount"');
            expect(result).toContain('link-entity name="email" from="contactid" to="regardingobjectid" alias="ContactEmails"');
            expect(result).toContain('attribute name="emailid"');
            expect(result).toContain('condition attribute="createdon" operator="last-month"');
            expect(result).toContain('link-entity name="opportunity" from="contactid" to="parentcontactid" alias="ContactOpportunities"');
            expect(result).toContain('attribute name="opportunityid"');
            expect(result).toContain('attribute name="revenue"');
            expect(result).toContain('order attribute="contactid" descending="true"');
            expect(result).toContain('top="50"');
        });
    });

    describe('Complex Filtering Scenarios', () => {
        it('should generate query with nested conditions', () => {
            const account = new AccountEntity('account');
            
            const result = account
                .select('name', 'revenue', 'address1_city')
                .where('statecode', 'eq', 0)
                .where('revenue', 'gt', 100000)
                .where('address1_city', 'like', 'New York')
                .where('address1_country', 'eq', 'United States')
                .join<Contact>('contact', 'accountid', 'parentcustomerid', 'AccountContacts')
                    .select('firstname', 'lastname', 'jobtitle')
                    .where('statecode', 'eq', 0)
                    .where('jobtitle', 'like', 'Manager')
                    .end()
                .orderBy('revenue', 'desc')
                .distinct()
                .build();

            expect(result).toContain('entity name="account"');
            expect(result).toContain('condition attribute="statecode" operator="eq" value="0"');
            expect(result).toContain('condition attribute="revenue" operator="gt" value="100000"');
            expect(result).toContain('condition attribute="address1_city" operator="like" value="New York"');
            expect(result).toContain('condition attribute="address1_country" operator="eq" value="United States"');
            expect(result).toContain('link-entity name="contact" from="accountid" to="parentcustomerid" alias="AccountContacts"');
            expect(result).toContain('condition attribute="jobtitle" operator="like" value="Manager"');
            expect(result).toContain('distinct="true"');
        });

        it('should generate query with date range filtering', () => {
            const opportunity = new OpportunityEntity('opportunity');
            
            const result = opportunity
                .select('name', 'revenue', 'estimatedclosedate', 'probability')
                .where('statecode', 'eq', 0)
                .where('estimatedclosedate', 'on-or-after', '2024-01-01')
                .where('estimatedclosedate', 'on-or-before', '2024-12-31')
                .where('probability', 'ge', 75)
                .join<Account>('account', 'parentaccountid', 'accountid', 'OpportunityAccount')
                    .select('name', 'address1_country')
                    .where('statecode', 'eq', 0)
                    .end()
                .orderBy('estimatedclosedate', 'asc')
                .orderBy('revenue', 'desc')
                .build();

            expect(result).toContain('entity name="opportunity"');
            expect(result).toContain('condition attribute="estimatedclosedate" operator="on-or-after" value="2024-01-01"');
            expect(result).toContain('condition attribute="estimatedclosedate" operator="on-or-before" value="2024-12-31"');
            expect(result).toContain('condition attribute="probability" operator="ge" value="75"');
            expect(result).toContain('order attribute="estimatedclosedate" descending="false"');
            expect(result).toContain('order attribute="revenue" descending="true"');
        });
    });

    describe('Performance and Optimization Queries', () => {
        it('should generate optimized query with pagination', () => {
            const account = new AccountEntity('account');
            
            const result = account
                .select('name', 'emailaddress1', 'revenue')
                .where('statecode', 'eq', 0)
                .where('revenue', 'gt', 0)
                .orderBy('revenue', 'desc')
                .page(3, 20)
                .build();

            expect(result).toContain('entity name="account"');
            expect(result).toContain('attribute name="name"');
            expect(result).toContain('attribute name="emailaddress1"');
            expect(result).toContain('attribute name="revenue"');
            expect(result).toContain('condition attribute="statecode" operator="eq" value="0"');
            expect(result).toContain('condition attribute="revenue" operator="gt" value="0"');
            expect(result).toContain('order attribute="revenue" descending="true"');
            expect(result).toContain('page="3" count="20"');
        });

        it('should generate query with specific field selection for performance', () => {
            const contact = new ContactEntity('contact');
            
            const result = contact
                .select('firstname', 'lastname', 'emailaddress1')
                .where('statecode', 'eq', 0)
                .where('emailaddress1', 'not-null')
                .orderBy('lastname', 'asc')
                .orderBy('firstname', 'asc')
                .top(1000)
                .build();

            expect(result).toContain('entity name="contact"');
            expect(result).toContain('attribute name="firstname"');
            expect(result).toContain('attribute name="lastname"');
            expect(result).toContain('attribute name="emailaddress1"');
            expect(result).toContain('condition attribute="statecode" operator="eq" value="0"');
            expect(result).toContain('condition attribute="emailaddress1" operator="not-null"');
            expect(result).toContain('order attribute="lastname" descending="false"');
            expect(result).toContain('order attribute="firstname" descending="false"');
            expect(result).toContain('top="1000"');
        });
    });
});
