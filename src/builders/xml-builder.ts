import { FetchQuery, FilterGroup, FilterCondition, LinkEntity } from '../types';
import { QueryBuildError } from '../errors';
import { Logger } from '../logger';

/**
 * FetchXML Builder
 */
export class FetchXMLBuilder {
    private logger = Logger.getInstance();

    constructor(private query: FetchQuery) { }

    /**
     * Build complete FetchXML 
     */
    public build(): string {
        try {
            this.logger.debug('Building FetchXML', { entity: this.query.entity });

            let xml = '<fetch';

            if (this.query.distinct) xml += ' distinct="true"';
            if (this.query.top) xml += ` top="${this.query.top}"`;
            if (this.query.page) xml += ` page="${this.query.page}"`;
            if (this.query.count) xml += ` count="${this.query.count}"`;

            xml += '>';
            xml += `<entity name="${this.query.entity}">`;

            xml += this.buildAttributes();

            if (this.query.filters) xml += this.buildFilter(this.query.filters);
            if (this.query.orders) xml += this.buildOrders();
            if (this.query.links) xml += this.buildLinks();

            xml += '</entity>';
            xml += '</fetch>';

            this.logger.debug('FetchXML built successfully');
            return xml;

        } catch (error) {
            this.logger.error('Failed to build FetchXML', { error: (error as Error).message });
            throw new QueryBuildError(`Failed to build FetchXML: ${(error as Error).message}`);
        }
    }

    /**
     * Build attributes 
     */
    private buildAttributes(): string {
        let xml = '';

        for (const attr of this.query.attributes) {
            xml += '<attribute';
            xml += ` name="${this.escapeXml(attr.name)}"`;

            if (attr.alias) xml += ` alias="${this.escapeXml(attr.alias)}"`;
            if ('aggregate' in attr) xml += ` aggregate="${attr.aggregate}"`;

            xml += '/>';
        }

        return xml;
    }

    /**
     * Build filter recursively
     */
    private buildFilter(filter: FilterGroup): string {
        let xml = `<filter type="${filter.type}">`;

        for (const condition of filter.conditions) {
            if ('type' in condition) {
                xml += this.buildFilter(condition);
            } else {
                xml += this.buildCondition(condition);
            }
        }

        xml += '</filter>';
        return xml;
    }

    /**
     * Build individual condition
     */
    private buildCondition(condition: FilterCondition): string {
        let xml = '<condition';

        xml += ` attribute="${this.escapeXml(condition.attribute)}"`;
        xml += ` operator="${condition.operator}"`;

        if (condition.value !== undefined && condition.value !== null) 
            xml += ` value="${this.escapeXml(condition.value.toString())}"`;

        xml += '/>';
        return xml;
    }

    /**
     * Build orders section
     */
    private buildOrders(): string {
        let xml = '';

        for (const order of this.query.orders!) {
            xml += `<order attribute="${this.escapeXml(order.attribute)}" descending="${order.order === 'desc'}"/>`;
        }

        return xml;
    }

    /**
     * Build links section
     */
    private buildLinks(): string {
        let xml = '';

        for (const link of this.query.links!) {
            xml += this.buildLinkEntity(link);
        }

        return xml;
    }

    /**
     * Build individual link entity
     */
    private buildLinkEntity(link: LinkEntity): string {
        let xml = '<link-entity';
        xml += ` name="${this.escapeXml(link.name)}"`;
        xml += ` from="${this.escapeXml(link.from)}"`;
        xml += ` to="${this.escapeXml(link.to)}"`;

        if (link.alias) xml += ` alias="${this.escapeXml(link.alias)}"`;
        if (link.linkType) xml += ` link-type="${link.linkType}"`;

        xml += '>';

        for (const attr of link.attributes) {
            xml += '<attribute';
            xml += ` name="${this.escapeXml(attr.name)}"`;

            if (attr.alias) xml += ` alias="${this.escapeXml(attr.alias)}"`;
            if ('aggregate' in attr) xml += ` aggregate="${attr.aggregate}"`;
            
            xml += '/>';
        }

        if (link.filters) xml += this.buildFilter(link.filters);

        if (link.links) {
            for (const nestedLink of link.links) {
                xml += this.buildLinkEntity(nestedLink);
            }
        }

        xml += '</link-entity>';
        return xml;
    }

    /**
     * Escape XML special characters
     */
    private escapeXml(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}