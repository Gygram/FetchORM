/**
 * Type definitions
 */

export type FilterOperator =
    | "eq" // Equal to
    | "ne" // Not equal to
    | "gt" // Greater than
    | "ge" // Greater than or equal to
    | "lt" // Less than
    | "le" // Less than or equal to
    | "like" // Contains
    | "not-like" // Does not contain
    | "in"
    | "not-in"
    | "null"
    | "not-null"
    | "on"
    | "on-or-before"
    | "on-or-after"
    | "yesterday"
    | "today"
    | "tomorrow"
    | "last-seven-days"
    | "next-seven-days"
    | "last-week"
    | "this-week"
    | "next-week"
    | "last-month"
    | "this-month"
    | "next-month"
    | "last-year"
    | "this-year"
    | "next-year";

export type OrderType = "asc" | "desc";

export type AggregateType =
    | "count"
    | "countcolumn"
    | "sum"
    | "avg"
    | "min"
    | "max";

export interface FilterCondition {
    attribute: string;
    operator: FilterOperator;
    value?: any;
}

export interface FilterGroup {
    type: "and" | "or";
    conditions: (FilterCondition | FilterGroup)[];
}

export interface OrderBy {
    attribute: string;
    order: OrderType;
}

export interface Attribute {
    name: string;
    alias?: string;
}

export interface AggregateAttribute extends Attribute {
    aggregate: AggregateType;
}

export interface LinkEntity {
    name: string;
    from: string;
    to: string;
    alias?: string;
    linkType?: "inner" | "outer";
    attributes: (Attribute | AggregateAttribute)[];
    filters?: FilterGroup;
    links?: LinkEntity[];
}

export interface FetchQuery {
    entity: string;
    attributes: (Attribute | AggregateAttribute)[];
    filters?: FilterGroup;
    orders?: OrderBy[];
    links?: LinkEntity[];
    distinct?: boolean;
    top?: number;
    page?: number;
    count?: number;
}

export interface LoggerConfig {
    level: "error" | "warn" | "info" | "debug";
    enabled: boolean;
}
