# FetchORM

A TypeScript ORM for building Dynamics365 FetchXML queries with type safety, fluent API, and validation.

[![npm version](https://badge.fury.io/js/fetchorm.svg)](https://badge.fury.io/js/fetchorm)
[![License](https://img.shields.io/badge/license-CC%20BY--NC--ND%204.0-red.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.8+-blue.svg)](https://www.typescriptlang.org/)

## 🚀 Features
- **Type-Safe Query Building**: Full TypeScript support with type checking
- **Fluent API**: Chainable methods for query construction
- **Comprehensive Validation**: Built-in validation for attributes, operators, and query structure
- **Advanced Filtering**: Support for complex conditions, date ranges, and logical operators
- **Entity Joins**:  Relationship mapping with nested query support
- **Aggregation Functions**: Built-in support for count, sum, avg, min, max operations
- **Pagination & Performance**: Top, page, and distinct clauses for queries
- **Logging**: Integrated Winston logging
- **Error Handling**: Error handling with descriptive messages

## 📦 Installation

```bash
npm install fetchorm
```

### Quick Start

### Define Entity Types

```typescript
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
```

### Create Entities

```typescript
import { BaseEntity } from 'fetchorm';

class AccountEntity extends BaseEntity<Account> {
    entityName = 'account';
}

class ContactEntity extends BaseEntity<Contact> {
    entityName = 'contact';
}
```

### Build Queries

```typescript
// Simple query
const account = new AccountEntity('account');
const query = account
    .select('name', 'emailaddress1', 'revenue')
    .where('statecode', 'eq', 0)
    .where('revenue', 'gt', 1000000)
    .orderBy('revenue', 'desc')
    .top(50)
    .build();
```

## Examples

### Basic Queries

```typescript
// Select specific attributes
const query = account
    .select('name', 'emailaddress1', 'telephone1')
    .build();

// Add conditions
const query = account
    .select('name', 'revenue')
    .where('statecode', 'eq', 0)
    .where('revenue', 'gt', 100000)
    .build();

// Order results
const query = account
    .select('name', 'revenue')
    .orderBy('revenue', 'desc')
    .orderBy('name', 'asc')
    .build();
```

### Filtering

```typescript
// Date range filtering
const query = account
    .select('name', 'createdon')
    .where('createdon', 'on-or-after', '2024-01-01')
    .where('createdon', 'on-or-before', '2024-12-31')
    .build();

// Text search
const query = account
    .select('name', 'address1_city')
    .where('name', 'like', 'Acme')
    .where('address1_city', 'not-null')
    .build();

// Multiple conditions
const query = account
    .select('name', 'revenue', 'statecode')
    .where('statecode', 'eq', 0)
    .where('revenue', 'gt', 100000)
    .where('isactive', 'eq', true)
    .build();
```

### Joins

```typescript
// Join with related entities
const query = account
    .select('name', 'revenue')
    .join<Contact>('contact', 'accountid', 'parentcustomerid', 'PrimaryContact')
        .select('firstname', 'lastname', 'emailaddress1')
        .where('statecode', 'eq', 0)
        .end()
    .build();

// Multiple joins
const query = account
    .select('name', 'revenue')
    .join<Contact>('contact', 'accountid', 'parentcustomerid', 'AccountContacts')
        .select('firstname', 'lastname', 'jobtitle')
        .where('jobtitle', 'like', 'Manager')
        .end()
    .join<Opportunity>('opportunity', 'accountid', 'parentaccountid', 'AccountOpportunities')
        .select('name', 'revenue', 'probability')
        .where('probability', 'gt', 50)
        .end()
    .build();
```

### Aggregation Functions

```typescript
// Count records
const query = account
    .count('accountid', 'TotalAccounts')
    .where('statecode', 'eq', 0)
    .build();

// Sum and average
const query = account
    .select('address1_country')
    .sum('revenue', 'TotalRevenue')
    .avg('revenue', 'AverageRevenue')
    .count('accountid', 'AccountCount')
    .where('statecode', 'eq', 0)
    .groupBy('address1_country')
    .build();

// Multiple aggregates
const query = account
    .sum('revenue', 'TotalRevenue')
    .min('revenue', 'MinRevenue')
    .max('revenue', 'MaxRevenue')
    .where('revenue', 'gt', 0)
    .build();
```

### Pagination and Performance

```typescript
// Limit results
const query = account
    .select('name', 'revenue')
    .top(100)
    .build();

// Pagination
const query = account
    .select('name', 'revenue')
    .page(2, 25) // Page 2, 25 records per page
    .build();

// Distinct results
const query = account
    .select('address1_city')
    .distinct()
    .build();
```

### Complex Scenarios

```typescript
const query = account
    .select('name', 'revenue', 'address1_city', 'address1_country')
    .sum('revenue', 'TotalRevenue')
    .where('statecode', 'eq', 0)
    .where('revenue', 'gt', 100000)
    .where('isactive', 'eq', true)
    .join<Contact>('contact', 'accountid', 'parentcustomerid', 'PrimaryContact')
        .select('firstname', 'lastname', 'emailaddress1', 'jobtitle')
        .where('statecode', 'eq', 0)
        .where('jobtitle', 'like', 'Manager')
        .end()
    .join<Opportunity>('opportunity', 'accountid', 'parentaccountid', 'AccountOpportunities')
        .select('name', 'revenue', 'probability', 'estimatedclosedate')
        .where('statecode', 'eq', 0)
        .where('probability', 'ge', 75)
        .where('estimatedclosedate', 'this-month')
        .end()
    .orderBy('revenue', 'desc')
    .orderBy('name', 'asc')
    .distinct()
    .top(50)
    .build();
```

## 🔧 API

### BaseEntity Methods

#### Selection
- `select(...attributes: (keyof T)[]): this` - Select specific attributes
- `selectAs(attribute: keyof T, alias: string): this` - Select attribute with alias

#### Filtering
- `where(attribute: keyof T, operator: FilterOperator, value?: any): this` - Add filter condition

#### Aggregation
- `count(attribute?: keyof T, alias?: string): this` - Count records
- `sum(attribute: keyof T, alias?: string): this` - Sum values
- `avg(attribute: keyof T, alias?: string): this` - Average values
- `min(attribute: keyof T, alias?: string): this` - Minimum value
- `max(attribute: keyof T, alias?: string): this` - Maximum value

#### Sorting
- `orderBy(attribute: keyof T, order: OrderType = 'asc'): this` - Order results

#### Performance
- `top(count: number): this` - Limit number of results
- `page(pageNumber: number, pageSize: number = 50): this` - Add pagination
- `distinct(): this` - Return distinct results
- `groupBy(attribute: keyof T): this` - Group by attribute

#### Joins
- `join<U>(entityName: string, fromAttribute: keyof T, toAttribute: string, alias?: string, linkType?: 'inner' | 'outer'): JoinBuilder<U>` - Join with related entity

#### Output
- `build(): string` - Generate FetchXML string

### Filter Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equal to | `where('statecode', 'eq', 0)` |
| `ne` | Not equal to | `where('statecode', 'ne', 1)` |
| `gt` | Greater than | `where('revenue', 'gt', 100000)` |
| `ge` | Greater than or equal | `where('revenue', 'ge', 100000)` |
| `lt` | Less than | `where('revenue', 'lt', 100000)` |
| `le` | Less than or equal | `where('revenue', 'le', 100000)` |
| `like` | Contains | `where('name', 'like', 'Acme')` |
| `not-like` | Does not contain | `where('name', 'not-like', 'Test')` |
| `in` | In list | `where('statecode', 'in', [0, 1])` |
| `not-in` | Not in list | `where('statecode', 'not-in', [2, 3])` |
| `null` | Is null | `where('emailaddress1', 'null')` |
| `not-null` | Is not null | `where('emailaddress1', 'not-null')` |
| `today` | Today | `where('createdon', 'today')` |
| `yesterday` | Yesterday | `where('createdon', 'yesterday')` |
| `this-month` | This month | `where('createdon', 'this-month')` |
| `last-month` | Last month | `where('createdon', 'last-month')` |
| `this-year` | This year | `where('createdon', 'this-year')` |

### JoinBuilder Methods

- `select(...attributes: (keyof T)[]): this`
- `selectAs(attribute: keyof T, alias: string): this`
- `where(attribute: keyof T, operator: FilterOperator, value?: any): this`
- `end(): BaseEntity` - Return to parent entity builder

## Configuration

### Logging

FetchORM uses Winston for logging.

```typescript
import { Logger } from 'fetchorm';

// Configure logging
Logger.getInstance().setLevel('debug'); // 'error', 'warn', 'info', 'debug'
```

### Validation

All queries are validated automatically. Invalid queries will throw descriptive errors:

```typescript
try {
    const query = account
        .select('invalid_attribute')
        .where('invalid_operator', 'invalid_op', 'value')
        .build();
} catch (error) {
    console.error('Validation error:', error.message);
}
```

## License

This library is licensed under a CC BY-NC-ND 4.0 License.

- **No commercial use allowed**
- **No modifications or forks**
- **Attribution required**

For more details, see the [LICENSE](LICENSE) file.
