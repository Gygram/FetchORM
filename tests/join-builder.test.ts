import { BaseEntity } from '../src/entities/base-entity';
import { JoinBuilder } from '../src/builders/join-builder';

// Create a concrete implementation of BaseEntity for testing
class TestEntity extends BaseEntity<{
    name: string;
    emailaddress1: string;
    telephone1: string;
    revenue: number;
    accountid: string;
    statecode: number;
    createdon: Date;
    isactive: boolean;
}> {
    entityName = 'account';
}

// Create a type for contact entity
interface Contact {
    firstname: string;
    lastname: string;
    emailaddress1: string;
    contactid: string;
    statecode: number;
    parentcustomerid: string;
}

describe('JoinBuilder XML Generation', () => {
    let entity: TestEntity;
    let joinBuilder: JoinBuilder<Contact>;

    beforeEach(() => {
        entity = new TestEntity('account');
    });

    describe('Basic Join Operations', () => {
        it('should create join and return to parent', () => {
            joinBuilder = entity.join<Contact>('contact', 'accountid', 'parentcustomerid');
            
            const result = joinBuilder.end().build();

            expect(result).toBe('<fetch><entity name="account"><link-entity name="contact" from="accountid" to="parentcustomerid"></link-entity></entity></fetch>');
        });

        it('should create join with alias', () => {
            joinBuilder = entity.join<Contact>('contact', 'accountid', 'parentcustomerid', 'PrimaryContact');
            
            const result = joinBuilder.end().build();

            expect(result).toBe('<fetch><entity name="account"><link-entity name="contact" from="accountid" to="parentcustomerid" alias="PrimaryContact"></link-entity></entity></fetch>');
        });

        it('should create outer join', () => {
            joinBuilder = entity.join<Contact>('contact', 'accountid', 'parentcustomerid', undefined, 'outer');
            
            const result = joinBuilder.end().build();

            expect(result).toBe('<fetch><entity name="account"><link-entity name="contact" from="accountid" to="parentcustomerid" link-type="outer"></link-entity></entity></fetch>');
        });
    });

    describe('Join Attribute Selection', () => {
        it('should select attributes in join', () => {
            joinBuilder = entity.join<Contact>('contact', 'accountid', 'parentcustomerid');
            
            const result = joinBuilder
                .select('firstname', 'lastname')
                .end()
                .build();

            expect(result).toBe('<fetch><entity name="account"><link-entity name="contact" from="accountid" to="parentcustomerid"><attribute name="firstname"/><attribute name="lastname"/></link-entity></entity></fetch>');
        });

        it('should select attributes with alias in join', () => {
            joinBuilder = entity.join<Contact>('contact', 'accountid', 'parentcustomerid');
            
            const result = joinBuilder
                .selectAs('firstname', 'ContactFirstName')
                .selectAs('lastname', 'ContactLastName')
                .end()
                .build();

            expect(result).toBe('<fetch><entity name="account"><link-entity name="contact" from="accountid" to="parentcustomerid"><attribute name="firstname" alias="ContactFirstName"/><attribute name="lastname" alias="ContactLastName"/></link-entity></entity></fetch>');
        });

        it('should handle multiple select calls in join', () => {
            joinBuilder = entity.join<Contact>('contact', 'accountid', 'parentcustomerid');
            
            const result = joinBuilder
                .select('firstname')
                .select('lastname')
                .selectAs('emailaddress1', 'ContactEmail')
                .end()
                .build();

            expect(result).toBe('<fetch><entity name="account"><link-entity name="contact" from="accountid" to="parentcustomerid"><attribute name="firstname"/><attribute name="lastname"/><attribute name="emailaddress1" alias="ContactEmail"/></link-entity></entity></fetch>');
        });
    });

    describe('Join Filtering', () => {
        it('should add where condition to join', () => {
            joinBuilder = entity.join<Contact>('contact', 'accountid', 'parentcustomerid');
            
            const result = joinBuilder
                .where('statecode', 'eq', 0)
                .end()
                .build();

            expect(result).toBe('<fetch><entity name="account"><link-entity name="contact" from="accountid" to="parentcustomerid"><filter type="and"><condition attribute="statecode" operator="eq" value="0"/></filter></link-entity></entity></fetch>');
        });

        it('should add multiple where conditions to join', () => {
            joinBuilder = entity.join<Contact>('contact', 'accountid', 'parentcustomerid');
            
            const result = joinBuilder
                .where('statecode', 'eq', 0)
                .where('firstname', 'like', 'John')
                .end()
                .build();

            expect(result).toBe('<fetch><entity name="account"><link-entity name="contact" from="accountid" to="parentcustomerid"><filter type="and"><condition attribute="statecode" operator="eq" value="0"/><condition attribute="firstname" operator="like" value="John"/></filter></link-entity></entity></fetch>');
        });

        it('should handle all filter operators in join', () => {
            joinBuilder = entity.join<Contact>('contact', 'accountid', 'parentcustomerid');
            
            const result = joinBuilder
                .where('firstname', 'eq', 'John')
                .where('lastname', 'ne', 'Doe')
                .where('contactid', 'gt', '1000')
                .where('contactid', 'ge', '500')
                .where('contactid', 'lt', '10000')
                .where('contactid', 'le', '5000')
                .where('emailaddress1', 'like', '@example.com')
                .where('emailaddress1', 'not-like', '@spam.com')
                .where('statecode', 'null')
                .where('parentcustomerid', 'not-null')
                .end()
                .build();

            expect(result).toContain('operator="eq"');
            expect(result).toContain('operator="ne"');
            expect(result).toContain('operator="gt"');
            expect(result).toContain('operator="ge"');
            expect(result).toContain('operator="lt"');
            expect(result).toContain('operator="le"');
            expect(result).toContain('operator="like"');
            expect(result).toContain('operator="not-like"');
            expect(result).toContain('operator="null"');
            expect(result).toContain('operator="not-null"');
        });
    });

    describe('Complex Join Queries', () => {
        it('should combine attributes and filters in join', () => {
            joinBuilder = entity.join<Contact>('contact', 'accountid', 'parentcustomerid', 'PrimaryContact');
            
            const result = joinBuilder
                .select('firstname', 'lastname')
                .selectAs('emailaddress1', 'ContactEmail')
                .where('statecode', 'eq', 0)
                .where('firstname', 'like', 'John')
                .end()
                .build();

            expect(result).toBe('<fetch><entity name="account"><link-entity name="contact" from="accountid" to="parentcustomerid" alias="PrimaryContact"><attribute name="firstname"/><attribute name="lastname"/><attribute name="emailaddress1" alias="ContactEmail"/><filter type="and"><condition attribute="statecode" operator="eq" value="0"/><condition attribute="firstname" operator="like" value="John"/></filter></link-entity></entity></fetch>');
        });

        it('should combine join with parent entity operations', () => {
            joinBuilder = entity.join<Contact>('contact', 'accountid', 'parentcustomerid');
            
            const result = joinBuilder
                .select('firstname', 'lastname')
                .where('statecode', 'eq', 0)
                .end()
                .select('name', 'emailaddress1')
                .where('statecode', 'eq', 0)
                .orderBy('name')
                .build();

            expect(result).toContain('entity name="account"');
            expect(result).toContain('attribute name="name"');
            expect(result).toContain('attribute name="emailaddress1"');
            expect(result).toContain('link-entity name="contact" from="accountid" to="parentcustomerid"');
            expect(result).toContain('attribute name="firstname"');
            expect(result).toContain('attribute name="lastname"');
            expect(result).toContain('condition attribute="statecode" operator="eq" value="0"');
            expect(result).toContain('order attribute="name" descending="false"');
        });

        it('should handle multiple joins', () => {
            // First join
            let contactJoin = entity.join<Contact>('contact', 'accountid', 'parentcustomerid', 'PrimaryContact');
            contactJoin = contactJoin
                .select('firstname', 'lastname')
                .where('statecode', 'eq', 0);

            // Second join (nested)
            const emailJoin = contactJoin.end().join<{subject: string; emailaddress: string; statecode: number}>('email', 'contactid', 'regardingobjectid', 'ContactEmail');
            emailJoin
                .select('subject')
                .selectAs('emailaddress', 'EmailAddress')
                .where('statecode', 'eq', 0);

            const result = emailJoin.end().build();

            expect(result).toContain('link-entity name="contact" from="accountid" to="parentcustomerid" alias="PrimaryContact"');
            expect(result).toContain('attribute name="firstname"');
            expect(result).toContain('attribute name="lastname"');
            expect(result).toContain('link-entity name="email" from="contactid" to="regardingobjectid" alias="ContactEmail"');
            expect(result).toContain('attribute name="subject"');
            expect(result).toContain('attribute name="emailaddress" alias="EmailAddress"');
        });
    });

    describe('Method Chaining', () => {
        it('should support chaining in join builder', () => {
            joinBuilder = entity.join<Contact>('contact', 'accountid', 'parentcustomerid');
            
            const result = joinBuilder
                .select('firstname')
                .selectAs('lastname', 'ContactLastName')
                .where('statecode', 'eq', 0)
                .where('firstname', 'like', 'John')
                .end()
                .build();

            expect(result).toContain('attribute name="firstname"');
            expect(result).toContain('attribute name="lastname" alias="ContactLastName"');
            expect(result).toContain('condition attribute="statecode" operator="eq" value="0"');
            expect(result).toContain('condition attribute="firstname" operator="like" value="John"');
        });

        it('should allow multiple calls to same method in join', () => {
            joinBuilder = entity.join<Contact>('contact', 'accountid', 'parentcustomerid');
            
            const result = joinBuilder
                .select('firstname')
                .select('lastname')
                .select('emailaddress1')
                .where('statecode', 'eq', 0)
                .where('firstname', 'like', 'John')
                .where('lastname', 'like', 'Doe')
                .end()
                .build();

            expect(result).toContain('attribute name="firstname"');
            expect(result).toContain('attribute name="lastname"');
            expect(result).toContain('attribute name="emailaddress1"');
            expect(result).toContain('condition attribute="statecode" operator="eq" value="0"');
            expect(result).toContain('condition attribute="firstname" operator="like" value="John"');
            expect(result).toContain('condition attribute="lastname" operator="like" value="Doe"');
        });
    });

    describe('Data Types in Join', () => {
        it('should handle string values in join filters', () => {
            joinBuilder = entity.join<Contact>('contact', 'accountid', 'parentcustomerid');
            
            const result = joinBuilder
                .where('firstname', 'eq', 'John Doe')
                .end()
                .build();

            expect(result).toContain('value="John Doe"');
        });

        it('should handle numeric values in join filters', () => {
            joinBuilder = entity.join<Contact>('contact', 'accountid', 'parentcustomerid');
            
            const result = joinBuilder
                .where('contactid', 'gt', 1000)
                .end()
                .build();

            expect(result).toContain('value="1000"');
        });

        it('should handle boolean values in join filters', () => {
            joinBuilder = entity.join<Contact>('contact', 'accountid', 'parentcustomerid');
            
            const result = joinBuilder
                .where('statecode', 'eq', true)
                .end()
                .build();

            expect(result).toContain('value="true"');
        });

        it('should handle zero values in join filters', () => {
            joinBuilder = entity.join<Contact>('contact', 'accountid', 'parentcustomerid');
            
            const result = joinBuilder
                .where('statecode', 'eq', 0)
                .end()
                .build();

            expect(result).toContain('value="0"');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty select in join', () => {
            joinBuilder = entity.join<Contact>('contact', 'accountid', 'parentcustomerid');
            
            const result = joinBuilder
                .select()
                .end()
                .build();

            expect(result).toBe('<fetch><entity name="account"><link-entity name="contact" from="accountid" to="parentcustomerid"></link-entity></entity></fetch>');
        });

        it('should handle join with no operations', () => {
            joinBuilder = entity.join<Contact>('contact', 'accountid', 'parentcustomerid');
            
            const result = joinBuilder.end().build();

            expect(result).toBe('<fetch><entity name="account"><link-entity name="contact" from="accountid" to="parentcustomerid"></link-entity></entity></fetch>');
        });

        it('should handle multiple joins with different configurations', () => {
            // First join - inner join with attributes and filters
            let contactJoin = entity.join<Contact>('contact', 'accountid', 'parentcustomerid', 'PrimaryContact');
            contactJoin = contactJoin
                .select('firstname', 'lastname')
                .where('statecode', 'eq', 0);

            // Second join - outer join with different alias
            const opportunityJoin = contactJoin.end().join<{name: string; revenue: number; statecode: number}>('opportunity', 'contactid', 'parentcontactid', 'ContactOpportunities', 'outer');
            opportunityJoin
                .select('name')
                .selectAs('revenue', 'OpportunityRevenue')
                .where('statecode', 'eq', 0);

            const result = opportunityJoin.end().build();

            expect(result).toContain('link-entity name="contact" from="accountid" to="parentcustomerid" alias="PrimaryContact"');
            expect(result).toContain('attribute name="firstname"');
            expect(result).toContain('attribute name="lastname"');
            expect(result).toContain('link-entity name="opportunity" from="contactid" to="parentcontactid" alias="ContactOpportunities" link-type="outer"');
            expect(result).toContain('attribute name="name"');
            expect(result).toContain('attribute name="revenue" alias="OpportunityRevenue"');
        });
    });

    describe('Integration with Parent Entity', () => {
        it('should allow building complex queries with joins', () => {
            joinBuilder = entity.join<Contact>('contact', 'accountid', 'parentcustomerid', 'PrimaryContact');
            
            const result = joinBuilder
                .select('firstname', 'lastname')
                .selectAs('emailaddress1', 'ContactEmail')
                .where('statecode', 'eq', 0)
                .end()
                .select('name', 'emailaddress1')
                .sum('revenue', 'TotalRevenue')
                .where('statecode', 'eq', 0)
                .where('name', 'like', 'Test')
                .orderBy('name', 'asc')
                .orderBy('revenue', 'desc')
                .distinct()
                .top(100)
                .build();

            expect(result).toContain('distinct="true"');
            expect(result).toContain('top="100"');
            expect(result).toContain('entity name="account"');
            expect(result).toContain('attribute name="name"');
            expect(result).toContain('attribute name="emailaddress1"');
            expect(result).toContain('attribute name="revenue" aggregate="sum" alias="TotalRevenue"');
            expect(result).toContain('link-entity name="contact" from="accountid" to="parentcustomerid" alias="PrimaryContact"');
            expect(result).toContain('attribute name="firstname"');
            expect(result).toContain('attribute name="lastname"');
            expect(result).toContain('attribute name="emailaddress1" alias="ContactEmail"');
            expect(result).toContain('filter type="and"');
            expect(result).toContain('condition attribute="statecode" operator="eq" value="0"');
            expect(result).toContain('condition attribute="name" operator="like" value="Test"');
            expect(result).toContain('order attribute="name" descending="false"');
            expect(result).toContain('order attribute="revenue" descending="true"');
        });
    });
});
