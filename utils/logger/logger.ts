/**
 * Logger utility module for application-wide logging
 */
import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Default log directory path
const logDir = path.join(process.cwd(), 'logs');

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Sanitizes a filename by removing invalid characters
 * @param {string} filename - The filename to sanitize
 * @returns {string} A safe filename
 */
const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_').substring(0, 100);
};

/**
 * Clears a specific log file
 * @param {string} moduleName - The name of the module whose logs should be cleared
 * @returns {boolean} True if successful
 */
const clearLogFile = (moduleName: string): boolean => {
  const safeModuleName = sanitizeFilename(moduleName);
  const logFilePath = path.join(logDir, `${safeModuleName}.log`);
  
  try {
    if (fs.existsSync(logFilePath)) {
      fs.writeFileSync(logFilePath, '', { flag: 'w' });
      console.log(`Cleared log file: ${logFilePath}`);
    } else {
      fs.writeFileSync(logFilePath, '');
      console.log(`Created empty log file: ${logFilePath}`);
    }
    return true;
  } catch (error) {
    console.error(`Failed to clear log file ${logFilePath}:`, error);
    return false;
  }
};

// Log format
const logFormat = winston.format.printf(({ timestamp, level, message, ...meta }) => {
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
  return `[${timestamp}] [${level.toUpperCase()}]: ${message} ${metaStr}`;
});

// Store created loggers
const loggers = new Map<string, winston.Logger>();

/**
 * Creates a new logger without clearing the log file
 * @param {string} moduleName - Name for the log file
 * @param {boolean} clearLog - Whether to clear the log file
 * @returns {winston.Logger} Configured logger
 */
const createLogger = (moduleName: string, clearLog: boolean = false): winston.Logger => {
  if (!moduleName) {
    throw new Error('Logger name is required');
  }
  
  const safeLogName = sanitizeFilename(moduleName);
  
  // Return existing logger if already created
  if (loggers.has(safeLogName)) {
    return loggers.get(safeLogName)!;
  }
  
  // Only clear if explicitly requested
  if (clearLog) {
    clearLogFile(safeLogName);
  }
  
  // Create logger
  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      logFormat
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          logFormat
        )
      }),
      new winston.transports.File({ 
        filename: path.join(logDir, `${safeLogName}.log`),
        maxsize: 10485760,
        maxFiles: 5,
        options: { flags: 'a' }
      })
    ]
  });
  
  loggers.set(safeLogName, logger);
  return logger;
};

export { createLogger, clearLogFile };