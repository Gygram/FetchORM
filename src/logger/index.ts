import winston from "winston";
import { LoggerConfig } from "../types";

/**
 * Logger utility
 * Provides structured logging with configurable levels
 */
export class Logger {
    private static instance: Logger;
    private logger: winston.Logger;
    private config: LoggerConfig;

    private constructor(config: LoggerConfig = { level: 'info', enabled: true }) {
        this.config = config;
        this.logger = winston.createLogger({
            level: config.level,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                })
            ],
            silent: !config.enabled
        });
    }

    /**
     * Get singleton instance of logger
     */
    public static getInstance(config?: LoggerConfig): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger(config);
        }
        return Logger.instance;
    }

    /**
     * Log error message
     */
    public error(message: string, meta?: any): void {
        this.logger.error(message, meta);
    }

    /**
     * Log warning message
     */
    public warn(message: string, meta?: any): void {
        this.logger.warn(message, meta);
    }

    /**
     * Log info message
     */
    public info(message: string, meta?: any): void {
        this.logger.info(message, meta);
    }

    /**
     * Log debug message
     */
    public debug(message: string, meta?: any): void {
        this.logger.debug(message, meta);
    }

    /**
     * Update logger configuration
     */
    public updateConfig(config: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...config };
        this.logger.level = this.config.level;
        this.logger.silent = !this.config.enabled;
    }
}
