import { FetchXMLBuilder } from '../src/builders/xml-builder';
import { FetchQuery, FilterGroup, FilterCondition, LinkEntity } from '../src/types';

describe('FetchXMLBuilder', () => {
    let builder: FetchXMLBuilder;

    beforeEach(() => {
        // Reset builder for each test
    });

    describe('Basic XML Generation', () => {
        it('should generate basic fetch XML with entity name', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: []
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"></entity></fetch>');
        });

        it('should generate XML with single attribute', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [{ name: 'name' }]
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><attribute name="name"/></entity></fetch>');
        });

        it('should generate XML with multiple attributes', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [
                    { name: 'name' },
                    { name: 'emailaddress1' },
                    { name: 'telephone1' }
                ]
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><attribute name="name"/><attribute name="emailaddress1"/><attribute name="telephone1"/></entity></fetch>');
        });
    });

    describe('Attribute Generation', () => {
        it('should generate attribute with alias', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [{ name: 'name', alias: 'AccountName' }]
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><attribute name="name" alias="AccountName"/></entity></fetch>');
        });

        it('should generate aggregate attributes', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [
                    { name: 'name' },
                    { name: 'revenue', aggregate: 'sum', alias: 'TotalRevenue' },
                    { name: 'accountid', aggregate: 'count', alias: 'AccountCount' }
                ]
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><attribute name="name"/><attribute name="revenue" aggregate="sum" alias="TotalRevenue"/><attribute name="accountid" aggregate="count" alias="AccountCount"/></entity></fetch>');
        });

        it('should handle all aggregate types', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [
                    { name: 'revenue', aggregate: 'sum' },
                    { name: 'revenue', aggregate: 'avg' },
                    { name: 'revenue', aggregate: 'min' },
                    { name: 'revenue', aggregate: 'max' },
                    { name: 'accountid', aggregate: 'count' },
                    { name: 'name', aggregate: 'countcolumn' }
                ]
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toContain('aggregate="sum"');
            expect(result).toContain('aggregate="avg"');
            expect(result).toContain('aggregate="min"');
            expect(result).toContain('aggregate="max"');
            expect(result).toContain('aggregate="count"');
            expect(result).toContain('aggregate="countcolumn"');
        });
    });

    describe('Filter Generation', () => {
        it('should generate simple where condition', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                filters: {
                    type: 'and',
                    conditions: [
                        { attribute: 'name', operator: 'eq', value: 'Test Account' }
                    ]
                }
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><filter type="and"><condition attribute="name" operator="eq" value="Test Account"/></filter></entity></fetch>');
        });

        it('should generate multiple conditions with AND', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                filters: {
                    type: 'and',
                    conditions: [
                        { attribute: 'name', operator: 'like', value: 'Test' },
                        { attribute: 'statecode', operator: 'eq', value: 0 }
                    ]
                }
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><filter type="and"><condition attribute="name" operator="like" value="Test"/><condition attribute="statecode" operator="eq" value="0"/></filter></entity></fetch>');
        });

        it('should generate multiple conditions with OR', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                filters: {
                    type: 'or',
                    conditions: [
                        { attribute: 'name', operator: 'like', value: 'Test' },
                        { attribute: 'name', operator: 'like', value: 'Demo' }
                    ]
                }
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><filter type="or"><condition attribute="name" operator="like" value="Test"/><condition attribute="name" operator="like" value="Demo"/></filter></entity></fetch>');
        });

        it('should generate nested filter groups', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                filters: {
                    type: 'and',
                    conditions: [
                        { attribute: 'statecode', operator: 'eq', value: 0 },
                        {
                            type: 'or',
                            conditions: [
                                { attribute: 'name', operator: 'like', value: 'Test' },
                                { attribute: 'name', operator: 'like', value: 'Demo' }
                            ]
                        }
                    ]
                }
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><filter type="and"><condition attribute="statecode" operator="eq" value="0"/><filter type="or"><condition attribute="name" operator="like" value="Test"/><condition attribute="name" operator="like" value="Demo"/></filter></filter></entity></fetch>');
        });

        it('should handle conditions without values', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                filters: {
                    type: 'and',
                    conditions: [
                        { attribute: 'name', operator: 'null' },
                        { attribute: 'emailaddress1', operator: 'not-null' }
                    ]
                }
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><filter type="and"><condition attribute="name" operator="null"/><condition attribute="emailaddress1" operator="not-null"/></filter></entity></fetch>');
        });

        it('should handle all filter operators', () => {
            const operators = [
                'eq', 'ne', 'gt', 'ge', 'lt', 'le', 'like', 'not-like',
                'in', 'not-in', 'null', 'not-null', 'on', 'on-or-before',
                'on-or-after', 'yesterday', 'today', 'tomorrow'
            ];

            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                filters: {
                    type: 'and',
                    conditions: operators.map(op => ({
                        attribute: 'test',
                        operator: op as any,
                        value: 'test'
                    }))
                }
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            operators.forEach(op => {
                expect(result).toContain(`operator="${op}"`);
            });
        });
    });

    describe('Order Generation', () => {
        it('should generate single order by', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                orders: [{ attribute: 'name', order: 'asc' }]
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><order attribute="name" descending="false"/></entity></fetch>');
        });

        it('should generate multiple order by clauses', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                orders: [
                    { attribute: 'name', order: 'asc' },
                    { attribute: 'createdon', order: 'desc' }
                ]
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><order attribute="name" descending="false"/><order attribute="createdon" descending="true"/></entity></fetch>');
        });

        it('should handle descending order', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                orders: [{ attribute: 'createdon', order: 'desc' }]
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><order attribute="createdon" descending="true"/></entity></fetch>');
        });
    });

    describe('Link Entity Generation', () => {
        it('should generate simple link entity', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                links: [{
                    name: 'contact',
                    from: 'accountid',
                    to: 'parentcustomerid',
                    attributes: []
                }]
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><link-entity name="contact" from="accountid" to="parentcustomerid"></link-entity></entity></fetch>');
        });

        it('should generate link entity with alias', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                links: [{
                    name: 'contact',
                    from: 'accountid',
                    to: 'parentcustomerid',
                    alias: 'PrimaryContact',
                    attributes: []
                }]
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><link-entity name="contact" from="accountid" to="parentcustomerid" alias="PrimaryContact"></link-entity></entity></fetch>');
        });

        it('should generate link entity with link type', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                links: [{
                    name: 'contact',
                    from: 'accountid',
                    to: 'parentcustomerid',
                    linkType: 'outer',
                    attributes: []
                }]
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><link-entity name="contact" from="accountid" to="parentcustomerid" link-type="outer"></link-entity></entity></fetch>');
        });

        it('should generate link entity with attributes', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                links: [{
                    name: 'contact',
                    from: 'accountid',
                    to: 'parentcustomerid',
                    attributes: [
                        { name: 'firstname' },
                        { name: 'lastname', alias: 'ContactLastName' }
                    ]
                }]
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><link-entity name="contact" from="accountid" to="parentcustomerid"><attribute name="firstname"/><attribute name="lastname" alias="ContactLastName"/></link-entity></entity></fetch>');
        });

        it('should generate link entity with filters', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                links: [{
                    name: 'contact',
                    from: 'accountid',
                    to: 'parentcustomerid',
                    attributes: [],
                    filters: {
                        type: 'and',
                        conditions: [
                            { attribute: 'statecode', operator: 'eq', value: 0 }
                        ]
                    }
                }]
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><link-entity name="contact" from="accountid" to="parentcustomerid"><filter type="and"><condition attribute="statecode" operator="eq" value="0"/></filter></link-entity></entity></fetch>');
        });

        it('should generate nested link entities', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                links: [{
                    name: 'contact',
                    from: 'accountid',
                    to: 'parentcustomerid',
                    attributes: [],
                    links: [{
                        name: 'email',
                        from: 'contactid',
                        to: 'regardingobjectid',
                        attributes: []
                    }]
                }]
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><link-entity name="contact" from="accountid" to="parentcustomerid"><link-entity name="email" from="contactid" to="regardingobjectid"></link-entity></link-entity></entity></fetch>');
        });
    });

    describe('Fetch Options', () => {
        it('should generate distinct query', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                distinct: true
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch distinct="true"><entity name="account"></entity></fetch>');
        });

        it('should generate top query', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                top: 10
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch top="10"><entity name="account"></entity></fetch>');
        });

        it('should generate pagination query', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                page: 2,
                count: 25
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch page="2" count="25"><entity name="account"></entity></fetch>');
        });

        it('should generate query with all options', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                distinct: true,
                top: 50,
                page: 1,
                count: 100
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch distinct="true" top="50" page="1" count="100"><entity name="account"></entity></fetch>');
        });
    });

    describe('Complex Query Generation', () => {
        it('should generate complex query with all components', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [
                    { name: 'name' },
                    { name: 'revenue', aggregate: 'sum', alias: 'TotalRevenue' }
                ],
                filters: {
                    type: 'and',
                    conditions: [
                        { attribute: 'statecode', operator: 'eq', value: 0 },
                        {
                            type: 'or',
                            conditions: [
                                { attribute: 'name', operator: 'like', value: 'Test' },
                                { attribute: 'name', operator: 'like', value: 'Demo' }
                            ]
                        }
                    ]
                },
                orders: [
                    { attribute: 'name', order: 'asc' },
                    { attribute: 'revenue', order: 'desc' }
                ],
                links: [{
                    name: 'contact',
                    from: 'accountid',
                    to: 'parentcustomerid',
                    alias: 'PrimaryContact',
                    attributes: [
                        { name: 'firstname' },
                        { name: 'lastname' }
                    ],
                    filters: {
                        type: 'and',
                        conditions: [
                            { attribute: 'statecode', operator: 'eq', value: 0 }
                        ]
                    }
                }],
                distinct: true,
                top: 100
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            // Verify all components are present
            expect(result).toContain('distinct="true"');
            expect(result).toContain('top="100"');
            expect(result).toContain('entity name="account"');
            expect(result).toContain('attribute name="name"');
            expect(result).toContain('attribute name="revenue" aggregate="sum" alias="TotalRevenue"');
            expect(result).toContain('filter type="and"');
            expect(result).toContain('condition attribute="statecode" operator="eq" value="0"');
            expect(result).toContain('filter type="or"');
            expect(result).toContain('condition attribute="name" operator="like" value="Test"');
            expect(result).toContain('condition attribute="name" operator="like" value="Demo"');
            expect(result).toContain('order attribute="name" descending="false"');
            expect(result).toContain('order attribute="revenue" descending="true"');
            expect(result).toContain('link-entity name="contact" from="accountid" to="parentcustomerid" alias="PrimaryContact"');
            expect(result).toContain('attribute name="firstname"');
            expect(result).toContain('attribute name="lastname"');
        });
    });

    describe('XML Escaping', () => {
        it('should escape XML special characters in attribute names', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [{ name: 'name<test>' }]
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toContain('name="name&lt;test&gt;"');
        });

        it('should escape XML special characters in values', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                filters: {
                    type: 'and',
                    conditions: [
                        { attribute: 'name', operator: 'eq', value: 'Test & Demo < 100 > 50' }
                    ]
                }
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toContain('value="Test &amp; Demo &lt; 100 &gt; 50"');
        });

        it('should escape quotes in values', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                filters: {
                    type: 'and',
                    conditions: [
                        { attribute: 'name', operator: 'eq', value: 'Test "quoted" value' }
                    ]
                }
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toContain('value="Test &quot;quoted&quot; value"');
        });

        it('should escape apostrophes in values', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                filters: {
                    type: 'and',
                    conditions: [
                        { attribute: 'name', operator: 'eq', value: "O'Connor" }
                    ]
                }
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toContain('value="O&#39;Connor"');
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty attributes array', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: []
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"></entity></fetch>');
        });

        it('should handle undefined optional properties', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: []
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"></entity></fetch>');
        });

        it('should handle null values in conditions', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                filters: {
                    type: 'and',
                    conditions: [
                        { attribute: 'name', operator: 'eq', value: null }
                    ]
                }
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><filter type="and"><condition attribute="name" operator="eq"/></filter></entity></fetch>');
        });

        it('should handle undefined values in conditions', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                filters: {
                    type: 'and',
                    conditions: [
                        { attribute: 'name', operator: 'eq', value: undefined }
                    ]
                }
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><filter type="and"><condition attribute="name" operator="eq"/></filter></entity></fetch>');
        });

        it('should handle numeric values', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                filters: {
                    type: 'and',
                    conditions: [
                        { attribute: 'revenue', operator: 'gt', value: 1000000 }
                    ]
                }
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><filter type="and"><condition attribute="revenue" operator="gt" value="1000000"/></filter></entity></fetch>');
        });

        it('should handle boolean values', () => {
            const query: FetchQuery = {
                entity: 'account',
                attributes: [],
                filters: {
                    type: 'and',
                    conditions: [
                        { attribute: 'isactive', operator: 'eq', value: true }
                    ]
                }
            };

            builder = new FetchXMLBuilder(query);
            const result = builder.build();

            expect(result).toBe('<fetch><entity name="account"><filter type="and"><condition attribute="isactive" operator="eq" value="true"/></filter></entity></fetch>');
        });
    });
});
