import { FilterOperator, OrderType, AggregateType } from '../types';
import { ValidationError } from '../errors';
import { Logger } from '../logger';

/**
 * Validation utilities
 */
export class Validator {
    private static logger = Logger.getInstance();

    private static MAX_PAGE_SIZE = 5000;
    private static MAX_TOP_SIZE = 5000;
    private static MIN_PAGE_SIZE = 1;
    private static MIN_TOP_SIZE = 1;

    /**
     * Validate filter operator
     */
    public static validateFilterOperator(operator: string): FilterOperator {
        const validOperators: FilterOperator[] = [
            'eq', 'ne', 'gt', 'ge', 'lt', 'le', 'like', 'not-like',
            'in', 'not-in', 'null', 'not-null', 'on', 'on-or-before',
            'on-or-after', 'yesterday', 'today', 'tomorrow',
            'last-seven-days', 'next-seven-days', 'last-week',
            'this-week', 'next-week', 'last-month', 'this-month',
            'next-month', 'last-year', 'this-year', 'next-year'
        ];

        if (!validOperators.includes(operator as FilterOperator)) {
            this.logger.error(`Invalid filter operator: ${operator}`);
            throw new ValidationError(`Invalid filter operator: ${operator}`, 'operator');
        }

        return operator as FilterOperator;
    }

    /**
     * Validate order type
     */
    public static validateOrderType(order: string): OrderType {
        const validOrders: OrderType[] = ['asc', 'desc'];

        if (!validOrders.includes(order as OrderType)) {
            this.logger.error(`Invalid order type: ${order}`);
            throw new ValidationError(`Invalid order type: ${order}`, 'order');
        }
        return order as OrderType;
    }

    /**
     * Validate aggregate type
     */
    public static validateAggregateType(aggregate: string): AggregateType {
        const validAggregates: AggregateType[] = ['count', 'countcolumn', 'sum', 'avg', 'min', 'max'];

        if (!validAggregates.includes(aggregate as AggregateType)) {
            this.logger.error(`Invalid aggregate type: ${aggregate}`);
            throw new ValidationError(`Invalid aggregate type: ${aggregate}`, 'aggregate');
        }
        return aggregate as AggregateType;
    }

    /**
     * Validate attribute name
     */
    public static validateAttributeName(attribute: string): void {
        if (!attribute || typeof attribute !== 'string' || attribute.trim() === '') {
            this.logger.error('Invalid attribute name');
            throw new ValidationError('Attribute name cannot be empty', 'attribute');
        }
    }

    /**
     * Validate entity name
     */
    public static validateEntityName(entityName: string): void {
        if (!entityName || typeof entityName !== 'string' || entityName.trim() === '') {
            this.logger.error('Invalid entity name');
            throw new ValidationError('Entity name cannot be empty', 'entityName');
        }
    }

    /**
     * Validate pagination parameters
     */
    public static validatePagination(page: number, count: number): void {
        if (page < this.MIN_PAGE_SIZE) {
            this.logger.error(`Invalid page number: ${page}`);
            throw new ValidationError(`Page number must be greater than ${this.MIN_PAGE_SIZE}`, 'page');
        }

        if (count < this.MIN_PAGE_SIZE || count > this.MAX_PAGE_SIZE) {
            this.logger.error(`Invalid page count: ${count}`);
            throw new ValidationError(`Page count must be between ${this.MIN_PAGE_SIZE} and ${this.MAX_PAGE_SIZE}`, 'count');
        }
    }

    /**
     * Validate top parameter
     */
    public static validateTop(top: number): void {
        if (top < this.MIN_TOP_SIZE || top > this.MAX_TOP_SIZE) {
            this.logger.error(`Invalid top value: ${top}`);
            throw new ValidationError(`Top value must be between ${this.MIN_TOP_SIZE} and ${this.MAX_TOP_SIZE}`, 'top');
        }
    }
}