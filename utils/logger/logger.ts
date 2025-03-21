import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Get the calling file name to use for the log file
const getCallerFileName = () => {
  const error = new Error();
  const stack = error.stack?.split('\n') || [];
  
  // Find the first entry that's not from logger.ts
  const callerLine = stack.find(line => !line.includes('logger.ts') && line.includes('.ts'));
  
  if (callerLine) {
    // Extract file name from the stack trace
    const match = callerLine.match(/([^\/\\]+)\.ts/);
    return match ? match[1] : 'app';
  }
  
  return 'app';
};

// Function to create a logger instance with dynamic file name
const createLogger = (customFilename?: string) => {
  // Use custom filename if provided, otherwise derive it from the caller
  const logName = customFilename || getCallerFileName();
  
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `[${timestamp}] [${level.toUpperCase()}]: ${message} ${metaStr}`;
      })
    ),
    transports: [
      // Console output
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
            return `[${timestamp}] [${level.toUpperCase()}]: ${message} ${metaStr}`;
          })
        )
      }),
      
      // File output - dynamic filename based on calling file
      new winston.transports.File({ 
        filename: path.join(logDir, `${logName}.log`),
        maxsize: 10485760, // 10MB
        maxFiles: 10
      }),
      
      // Error file output
      new winston.transports.File({ 
        filename: path.join(logDir, 'error.log'),
        level: 'error'
      })
    ]
  });
};

// Default logger instance
const logger = createLogger();

// Export both the default logger and the factory function
export default logger;
export { createLogger };