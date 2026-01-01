import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { LoggingLevel } from "@modelcontextprotocol/sdk/types.js";
export declare function logMessage(server: Server, level: LoggingLevel, message: string, data?: unknown): void;
export declare function shouldLog(level: LoggingLevel): boolean;
export declare function setLogLevel(level: LoggingLevel): void;
export declare function getCurrentLogLevel(): LoggingLevel;
