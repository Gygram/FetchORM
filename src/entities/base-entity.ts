import {
    FetchQuery,
    FilterCondition,
    FilterOperator,
    OrderType,
    AggregateType,
    LinkEntity
} from '../types';
import { FetchXMLBuilder } from '../builders/xml-builder';
import { JoinBuilder } from '../builders/join-builder';
import { Validator } from '../validators';
import { Logger } from '../logger';

/**
 * Base Entity - Abstract base class for all entity types
 */
export abstract class BaseEntity<T = any> {
    protected logger = Logger.getInstance();
    protected query: FetchQuery;

    abstract entityName: string;

    constructor(entityName: string) {
        this.query = {
            entity: entityName,
            attributes: []
        };

        this.logger.debug('Created BaseEntity', { entityName });
    }

    /**
     * Select specific attributes
     */
    public select(...attributes: (keyof T)[]): this {
        try {
            this.logger.debug('Adding select attributes', { attributes });

            const newAttributes = attributes.map(attr => {
                const attributeName = attr as string;
                Validator.validateAttributeName(attributeName);

                return { name: attributeName };
            });

            // Append new attributes instead of overwriting
            this.query.attributes.push(...newAttributes);

            return this;
        } catch (error) {
            this.logger.error('Failed to add select attributes', { error: (error as Error).message });
            throw error;
        }
    }

    /**
     * Select attribute with alias
     */
    public selectAs(attribute: keyof T, alias: string): this {
        try {
            const attributeName = attribute as string;

            Validator.validateAttributeName(attributeName);
            Validator.validateAttributeName(alias);

            this.logger.debug('Adding select with alias', { attribute: attributeName, alias });

            this.query.attributes.push({
                name: attributeName,
                alias: alias
            });

            return this;
        } catch (error) {
            this.logger.error('Failed to add select with alias', { error: (error as Error).message });
            throw error;
        }
    }

    /**
     * Add count aggregate
     */
    public count(attribute?: keyof T, alias?: string): this {
        return this.addAggregate('count', attribute, alias);
    }

    /**
     * Add sum aggregate
     */
    public sum(attribute: keyof T, alias?: string): this {
        return this.addAggregate('sum', attribute, alias);
    }

    /**
     * Add average aggregate
     */
    public avg(attribute: keyof T, alias?: string): this {
        return this.addAggregate('avg', attribute, alias);
    }

    /**
     * Add minimum aggregate
     */
    public min(attribute: keyof T, alias?: string): this {
        return this.addAggregate('min', attribute, alias);
    }

    /**
     * Add maximum aggregate
     */
    public max(attribute: keyof T, alias?: string): this {
        return this.addAggregate('max', attribute, alias);
    }

    /**
     * Add where condition
     */
    public where(attribute: keyof T, operator: FilterOperator, value?: any): this {
        try {
            const attributeName = attribute as string;
            Validator.validateAttributeName(attributeName);

            const validOperator = Validator.validateFilterOperator(operator);

            this.logger.debug('Adding where condition', {
                attribute: attributeName,
                operator: validOperator,
                value
            });

            const condition: FilterCondition = {
                attribute: attributeName,
                operator: validOperator,
                value
            };

            if (!this.query.filters) {
                this.query.filters = { type: 'and', conditions: [] };
            }

            this.query.filters.conditions.push(condition);
            return this;
        } catch (error) {
            this.logger.error('Failed to add where condition', { error: (error as Error).message });
            throw error;
        }
    }

    /**
     * Add order by clause
     */
    public orderBy(attribute: keyof T, order: OrderType = 'asc'): this {
        try {
            const attributeName = attribute as string;
            Validator.validateAttributeName(attributeName);
            const validOrder = Validator.validateOrderType(order);

            this.logger.debug('Adding order by', { attribute: attributeName, order: validOrder });

            if (!this.query.orders) {
                this.query.orders = [];
            }

            this.query.orders.push({
                attribute: attributeName,
                order: validOrder
            });

            return this;
        } catch (error) {
            this.logger.error('Failed to add order by', { error: (error as Error).message });
            throw error;
        }
    }

    /**
     * Limit number of results
     */
    public top(count: number): this {
        try {
            Validator.validateTop(count);

            this.logger.debug('Adding top limit', { count });

            this.query.top = count;
            return this;
        } catch (error) {
            this.logger.error('Failed to add top limit', { error: (error as Error).message });
            throw error;
        }
    }

    /**
     * Add pagination
     */
    public page(pageNumber: number, pageSize: number = 50): this {
        try {
            Validator.validatePagination(pageNumber, pageSize);

            this.logger.debug('Adding pagination', { pageNumber, pageSize });

            this.query.page = pageNumber;
            this.query.count = pageSize;
            return this;
        } catch (error) {
            this.logger.error('Failed to add pagination', { error: (error as Error).message });
            throw error;
        }
    }

    /**
     * Add distinct clause
     */
    public distinct(): this {
        this.logger.debug('Adding distinct');
        this.query.distinct = true;

        return this;
    }

    /**
     * Add group by clause
     */
    public groupBy(attribute: keyof T): this {
        try {
            const attributeName = attribute as string;
            Validator.validateAttributeName(attributeName);

            this.logger.debug('Adding group by', { attribute: attributeName });

            return this;
        } catch (error) {
            this.logger.error('Failed to add group by', { error: (error as Error).message });
            throw error;
        }
    }

    /**
     * Join with related entity
     */
    public join<U>(
        entityName: string,
        fromAttribute: keyof T,
        toAttribute: string,
        alias?: string,
        linkType?: 'inner' | 'outer'
    ): JoinBuilder<U> {
        try {
            Validator.validateEntityName(entityName);
            Validator.validateAttributeName(fromAttribute as string);
            Validator.validateAttributeName(toAttribute);

            this.logger.debug('Adding join', {
                entityName,
                fromAttribute: fromAttribute as string,
                toAttribute,
                alias,
                linkType
            });

            const link: LinkEntity = {
                name: entityName,
                from: fromAttribute as string,
                to: toAttribute,
                alias,
                linkType,
                attributes: []
            };

            if (!this.query.links) {
                this.query.links = [];
            }

            this.query.links.push(link);
            return new JoinBuilder<U>(link, this);
        } catch (error) {
            this.logger.error('Failed to add join', { error: (error as Error).message });
            throw error;
        }
    }

    /**
     * Build FetchXML string
     */
    public build(): string {
        try {
            this.logger.debug('Building FetchXML query');

            const builder = new FetchXMLBuilder(this.query);
            const xml = builder.build();

            this.logger.info('FetchXML query built successfully');
            return xml;
        } catch (error) {
            this.logger.error('Failed to build FetchXML query', { error: (error as Error).message });
            throw error;
        }
    }

    /**
     * Add aggregate function
     */
    private addAggregate(aggregate: AggregateType, attribute?: keyof T, alias?: string): this {
        try {
            const validAggregate = Validator.validateAggregateType(aggregate);
            const attributeName = attribute ? attribute as string : this.entityName + 'id';

            if (attribute)  Validator.validateAttributeName(attributeName);

            this.logger.debug('Adding aggregate', { aggregate: validAggregate, attribute: attributeName, alias });

            this.query.attributes.push({
                name: attributeName,
                alias: alias,
                aggregate: validAggregate
            });

            return this;
        } catch (error) {
            this.logger.error('Failed to add aggregate', { error: (error as Error).message });
            throw error;
        }
    }
}