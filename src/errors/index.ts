export class FetchXMLError extends Error {
    constructor(message: string, public code?: string) {
        super(message);
        this.name = "FetchXML error";
        Object.setPrototypeOf(this, FetchXMLError.prototype);
    }
}

export class ValidationError extends FetchXMLError {
    constructor(message: string, public field?: string) {
        super(message, "VALIDATION_ERROR");
        this.name = "Validation error";
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

export class QueryBuildError extends FetchXMLError {
    constructor(message: string) {
        super(message, "QUERY_BUILD_ERROR");
        this.name = "QueryBuild error";
        Object.setPrototypeOf(this, QueryBuildError.prototype);
    }
}

export class AttributeError extends FetchXMLError {
    constructor(message: string, public attribute?: string) {
        super(message, "ATTRIBUTE_ERROR");
        this.name = "Attribute error";
        Object.setPrototypeOf(this, AttributeError.prototype);
    }
}
