import { LinkEntity, FilterCondition, FilterOperator } from '../types';
import { BaseEntity } from '../entities/base-entity';
import { Validator } from '../validators';
import { Logger } from '../logger';

/**
 * Join Builder
 */
export class JoinBuilder<T> {
    private logger = Logger.getInstance();

    constructor(private link: LinkEntity, private parent: BaseEntity) {
        this.logger.debug('Creating JoinBuilder', { entityName: link.name });
    }

    /**
     * Select attributes
     */
    public select(...attributes: (keyof T)[]): this {
        try {
            this.logger.debug('Adding select attributes to join', { attributes });

            const newAttributes = attributes.map(attr => {
                const attributeName = attr as string;
                Validator.validateAttributeName(attributeName);

                return { name: attributeName };
            });

            this.link.attributes.push(...newAttributes);

            return this;
        } catch (error) {
            this.logger.error('Failed to add select attributes to join', { error: (error as Error).message });
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

            this.logger.debug('Adding select with alias to join', { attribute: attributeName, alias });

            this.link.attributes.push({
                name: attributeName,
                alias: alias
            });

            return this;
        } catch (error) {
            this.logger.error('Failed to add select with alias to join', { error: (error as Error).message });
            throw error;
        }
    }

    /**
     * Add where condition
     */
    public where(attribute: keyof T, operator: FilterOperator, value?: any): this {
        try {
            const attributeName = attribute as string;

            Validator.validateAttributeName(attributeName);

            const validOperator = Validator.validateFilterOperator(operator);
            
            this.logger.debug('Adding where condition to join', {
                attribute: attributeName,
                operator: validOperator,
                value
            });

            const condition: FilterCondition = {
                attribute: attributeName,
                operator: validOperator,
                value
            };

            if (!this.link.filters)  this.link.filters = { type: 'and', conditions: [] };

            this.link.filters.conditions.push(condition);
            return this;
        } catch (error) {
            this.logger.error('Failed to add where condition to join', { error: (error as Error).message });
            throw error;
        }
    }

    /**
     * Return to parent entity builder
     */
    public end(): BaseEntity {
        this.logger.debug('Ending join builder');
        return this.parent;
    }
}