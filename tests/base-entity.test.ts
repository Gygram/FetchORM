import { BaseEntity } from '../src/entities/base-entity';

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

describe('BaseEntity XML Generation', () => {
    let entity: TestEntity;

    beforeEach(() => {
        entity = new TestEntity('account');
    });

    describe('Basic Query Building', () => {
        it('should generate basic XML with entity name', () => {
            const result = entity.build();

            expect(result).toBe('<fetch><entity name="account"></entity></fetch>');
        });

        it('should generate XML with selected attributes', () => {
            const result = entity
                .select('name', 'emailaddress1')
                .build();

            expect(result).toBe('<fetch><entity name="account"><attribute name="name"/><attribute name="emailaddress1"/></entity></fetch>');
        });

        it('should generate XML with selectAs', () => {
            const result = entity
                .selectAs('name', 'AccountName')
                .build();

            expect(result).toBe('<fetch><entity name="account"><attribute name="name" alias="AccountName"/></entity></fetch>');
        });
    });

    describe('Aggregate Functions', () => {
        it('should generate count aggregate', () => {
            const result = entity
                .count()
                .build();

            expect(result).toBe('<fetch><entity name="account"><attribute name="accountid" aggregate="count"/></entity></fetch>');
        });

        it('should generate count with specific attribute', () => {
            const result = entity
                .count('name')
                .build();

            expect(result).toBe('<fetch><entity name="account"><attribute name="name" aggregate="count"/></entity></fetch>');
        });

        it('should generate count with alias', () => {
            const result = entity
                .count('name', 'NameCount')
                .build();

            expect(result).toBe('<fetch><entity name="account"><attribute name="name" aggregate="count" alias="NameCount"/></entity></fetch>');
        });

        it('should generate sum aggregate', () => {
            const result = entity
                .sum('revenue', 'TotalRevenue')
                .build();

            expect(result).toBe('<fetch><entity name="account"><attribute name="revenue" aggregate="sum" alias="TotalRevenue"/></entity></fetch>');
        });

        it('should generate avg aggregate', () => {
            const result = entity
                .avg('revenue', 'AverageRevenue')
                .build();

            expect(result).toBe('<fetch><entity name="account"><attribute name="revenue" aggregate="avg" alias="AverageRevenue"/></entity></fetch>');
        });

        it('should generate min aggregate', () => {
            const result = entity
                .min('revenue', 'MinRevenue')
                .build();

            expect(result).toBe('<fetch><entity name="account"><attribute name="revenue" aggregate="min" alias="MinRevenue"/></entity></fetch>');
        });

        it('should generate max aggregate', () => {
            const result = entity
                .max('revenue', 'MaxRevenue')
                .build();

            expect(result).toBe('<fetch><entity name="account"><attribute name="revenue" aggregate="max" alias="MaxRevenue"/></entity></fetch>');
        });

        it('should generate multiple aggregates', () => {
            const result = entity
                .count('name', 'NameCount')
                .sum('revenue', 'TotalRevenue')
                .avg('revenue', 'AverageRevenue')
                .build();

            expect(result).toBe('<fetch><entity name="account"><attribute name="name" aggregate="count" alias="NameCount"/><attribute name="revenue" aggregate="sum" alias="TotalRevenue"/><attribute name="revenue" aggregate="avg" alias="AverageRevenue"/></entity></fetch>');
        });
    });

    describe('Filter Conditions', () => {
        it('should generate simple where condition', () => {
            const result = entity
                .where('name', 'eq', 'Test Account')
                .build();

            expect(result).toBe('<fetch><entity name="account"><filter type="and"><condition attribute="name" operator="eq" value="Test Account"/></filter></entity></fetch>');
        });

        it('should generate multiple where conditions', () => {
            const result = entity
                .where('name', 'like', 'Test')
                .where('statecode', 'eq', 0)
                .build();

            expect(result).toBe('<fetch><entity name="account"><filter type="and"><condition attribute="name" operator="like" value="Test"/><condition attribute="statecode" operator="eq" value="0"/></filter></entity></fetch>');
        });

        it('should handle all filter operators', () => {
            const result = entity
                .where('name', 'eq', 'Test')
                .where('name', 'ne', 'Demo')
                .where('revenue', 'gt', 1000)
                .where('revenue', 'ge', 500)
                .where('revenue', 'lt', 10000)
                .where('revenue', 'le', 5000)
                .where('name', 'like', 'Test')
                .where('name', 'not-like', 'Demo')
                .where('statecode', 'null')
                .where('emailaddress1', 'not-null')
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

        it('should handle date operators', () => {
            const result = entity
                .where('createdon', 'on', '2023-01-01')
                .where('createdon', 'on-or-before', '2023-12-31')
                .where('createdon', 'on-or-after', '2023-01-01')
                .where('createdon', 'yesterday')
                .where('createdon', 'today')
                .where('createdon', 'tomorrow')
                .build();

            expect(result).toContain('operator="on"');
            expect(result).toContain('operator="on-or-before"');
            expect(result).toContain('operator="on-or-after"');
            expect(result).toContain('operator="yesterday"');
            expect(result).toContain('operator="today"');
            expect(result).toContain('operator="tomorrow"');
        });

        it('should handle time-based operators', () => {
            const result = entity
                .where('createdon', 'last-seven-days')
                .where('createdon', 'next-seven-days')
                .where('createdon', 'last-week')
                .where('createdon', 'this-week')
                .where('createdon', 'next-week')
                .where('createdon', 'last-month')
                .where('createdon', 'this-month')
                .where('createdon', 'next-month')
                .where('createdon', 'last-year')
                .where('createdon', 'this-year')
                .where('createdon', 'next-year')
                .build();

            expect(result).toContain('operator="last-seven-days"');
            expect(result).toContain('operator="next-seven-days"');
            expect(result).toContain('operator="last-week"');
            expect(result).toContain('operator="this-week"');
            expect(result).toContain('operator="next-week"');
            expect(result).toContain('operator="last-month"');
            expect(result).toContain('operator="this-month"');
            expect(result).toContain('operator="next-month"');
            expect(result).toContain('operator="last-year"');
            expect(result).toContain('operator="this-year"');
            expect(result).toContain('operator="next-year"');
        });
    });

    describe('Order By', () => {
        it('should generate single order by', () => {
            const result = entity
                .orderBy('name')
                .build();

            expect(result).toBe('<fetch><entity name="account"><order attribute="name" descending="false"/></entity></fetch>');
        });

        it('should generate order by with desc', () => {
            const result = entity
                .orderBy('createdon', 'desc')
                .build();

            expect(result).toBe('<fetch><entity name="account"><order attribute="createdon" descending="true"/></entity></fetch>');
        });

        it('should generate multiple order by clauses', () => {
            const result = entity
                .orderBy('name', 'asc')
                .orderBy('createdon', 'desc')
                .build();

            expect(result).toBe('<fetch><entity name="account"><order attribute="name" descending="false"/><order attribute="createdon" descending="true"/></entity></fetch>');
        });
    });

    describe('Fetch Options', () => {
        it('should generate distinct query', () => {
            const result = entity
                .distinct()
                .build();

            expect(result).toBe('<fetch distinct="true"><entity name="account"></entity></fetch>');
        });

        it('should generate top query', () => {
            const result = entity
                .top(10)
                .build();

            expect(result).toBe('<fetch top="10"><entity name="account"></entity></fetch>');
        });

        it('should generate pagination query', () => {
            const result = entity
                .page(2, 25)
                .build();

            expect(result).toBe('<fetch page="2" count="25"><entity name="account"></entity></fetch>');
        });

        it('should generate pagination with default page size', () => {
            const result = entity
                .page(1)
                .build();

            expect(result).toBe('<fetch page="1" count="50"><entity name="account"></entity></fetch>');
        });
    });

    describe('Complex Queries', () => {
        it('should generate complex query with all components', () => {
            const result = entity
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
            expect(result).toContain('filter type="and"');
            expect(result).toContain('condition attribute="statecode" operator="eq" value="0"');
            expect(result).toContain('condition attribute="name" operator="like" value="Test"');
            expect(result).toContain('order attribute="name" descending="false"');
            expect(result).toContain('order attribute="revenue" descending="true"');
        });

        it('should generate query with aggregates and filters', () => {
            const result = entity
                .count('name', 'NameCount')
                .sum('revenue', 'TotalRevenue')
                .avg('revenue', 'AverageRevenue')
                .where('statecode', 'eq', 0)
                .where('revenue', 'gt', 1000)
                .orderBy('revenue', 'desc')
                .top(50)
                .build();

            expect(result).toContain('attribute name="name" aggregate="count" alias="NameCount"');
            expect(result).toContain('attribute name="revenue" aggregate="sum" alias="TotalRevenue"');
            expect(result).toContain('attribute name="revenue" aggregate="avg" alias="AverageRevenue"');
            expect(result).toContain('condition attribute="statecode" operator="eq" value="0"');
            expect(result).toContain('condition attribute="revenue" operator="gt" value="1000"');
            expect(result).toContain('order attribute="revenue" descending="true"');
            expect(result).toContain('top="50"');
        });
    });

    describe('Chaining', () => {
        it('should support method chaining', () => {
            const result = entity
                .select('name')
                .where('statecode', 'eq', 0)
                .orderBy('name')
                .top(10)
                .build();

            expect(result).toContain('attribute name="name"');
            expect(result).toContain('condition attribute="statecode" operator="eq" value="0"');
            expect(result).toContain('order attribute="name" descending="false"');
            expect(result).toContain('top="10"');
        });

        it('should allow multiple calls to same method', () => {
            const result = entity
                .select('name')
                .select('emailaddress1')
                .select('telephone1')
                .where('statecode', 'eq', 0)
                .where('name', 'like', 'Test')
                .orderBy('name', 'asc')
                .orderBy('createdon', 'desc')
                .build();

            expect(result).toContain('attribute name="name"');
            expect(result).toContain('attribute name="emailaddress1"');
            expect(result).toContain('attribute name="telephone1"');
            expect(result).toContain('condition attribute="statecode" operator="eq" value="0"');
            expect(result).toContain('condition attribute="name" operator="like" value="Test"');
            expect(result).toContain('order attribute="name" descending="false"');
            expect(result).toContain('order attribute="createdon" descending="true"');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty select', () => {
            const result = entity.build();

            expect(result).toBe('<fetch><entity name="account"></entity></fetch>');
        });

        it('should handle select with no attributes', () => {
            const result = entity.select().build();

            expect(result).toBe('<fetch><entity name="account"></entity></fetch>');
        });

        it('should handle multiple select calls', () => {
            const result = entity
                .select('name')
                .select('emailaddress1')
                .build();

            expect(result).toBe('<fetch><entity name="account"><attribute name="name"/><attribute name="emailaddress1"/></entity></fetch>');
        });

        it('should handle selectAs after select', () => {
            const result = entity
                .select('name')
                .selectAs('emailaddress1', 'Email')
                .build();

            expect(result).toBe('<fetch><entity name="account"><attribute name="name"/><attribute name="emailaddress1" alias="Email"/></entity></fetch>');
        });

        it('should handle aggregates with select', () => {
            const result = entity
                .select('name')
                .count('accountid', 'Count')
                .sum('revenue', 'Total')
                .build();

            expect(result).toBe('<fetch><entity name="account"><attribute name="name"/><attribute name="accountid" aggregate="count" alias="Count"/><attribute name="revenue" aggregate="sum" alias="Total"/></entity></fetch>');
        });
    });

    describe('Data Types', () => {
        it('should handle string values', () => {
            const result = entity
                .where('name', 'eq', 'Test Account')
                .build();

            expect(result).toContain('value="Test Account"');
        });

        it('should handle numeric values', () => {
            const result = entity
                .where('revenue', 'gt', 1000000)
                .build();

            expect(result).toContain('value="1000000"');
        });

        it('should handle boolean values', () => {
            const result = entity
                .where('isactive', 'eq', true)
                .build();

            expect(result).toContain('value="true"');
        });

        it('should handle zero values', () => {
            const result = entity
                .where('statecode', 'eq', 0)
                .build();

            expect(result).toContain('value="0"');
        });

        it('should handle negative values', () => {
            const result = entity
                .where('revenue', 'lt', -1000)
                .build();

            expect(result).toContain('value="-1000"');
        });
    });
});
