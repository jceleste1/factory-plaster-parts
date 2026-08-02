// T195: Logging Service
// Structured logging for development and production

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  context?: Record<string, any>;
}

class LoggingService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private currentLevel: LogLevel;
  private enabled: boolean;

  constructor() {
    this.enabled = true;
    const logLevel = import.meta.env.VITE_LOG_LEVEL || 'debug';
    this.currentLevel = this.getLevelFromString(logLevel);
  }

  /**
   * Convert string to LogLevel
   */
  private getLevelFromString(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
        return LogLevel.INFO;
      case 'warn':
        return LogLevel.WARN;
      case 'error':
        return LogLevel.ERROR;
      default:
        return LogLevel.INFO;
    }
  }

  /**
   * Get level name for display
   */
  private getLevelName(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'DEBUG';
      case LogLevel.INFO:
        return 'INFO';
      case LogLevel.WARN:
        return 'WARN';
      case LogLevel.ERROR:
        return 'ERROR';
      default:
        return 'UNKNOWN';
    }
  }

  /**
   * Get console method for level
   */
  private getConsoleMethod(level: LogLevel): 'log' | 'info' | 'warn' | 'error' {
    switch (level) {
      case LogLevel.DEBUG:
        return 'log';
      case LogLevel.INFO:
        return 'info';
      case LogLevel.WARN:
        return 'warn';
      case LogLevel.ERROR:
        return 'error';
      default:
        return 'log';
    }
  }

  /**
   * Add log entry
   */
  private addLog(level: LogLevel, message: string, data?: any, context?: Record<string, any>): void {
    if (!this.enabled || level < this.currentLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context,
    };

    this.logs.push(entry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Also log to console
    const method = this.getConsoleMethod(level);
    const levelName = this.getLevelName(level);
    console[method](
      `[${entry.timestamp}] ${levelName}: ${message}`,
      data ? data : '',
      context ? context : ''
    );
  }

  /**
   * Debug level logging
   */
  debug(message: string, data?: any, context?: Record<string, any>): void {
    this.addLog(LogLevel.DEBUG, message, data, context);
  }

  /**
   * Info level logging
   */
  info(message: string, data?: any, context?: Record<string, any>): void {
    this.addLog(LogLevel.INFO, message, data, context);
  }

  /**
   * Warning level logging
   */
  warn(message: string, data?: any, context?: Record<string, any>): void {
    this.addLog(LogLevel.WARN, message, data, context);
  }

  /**
   * Error level logging
   */
  error(message: string, data?: any, context?: Record<string, any>): void {
    this.addLog(LogLevel.ERROR, message, data, context);
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Set log level
   */
  setLogLevel(level: LogLevel | string): void {
    this.currentLevel = typeof level === 'string' ? this.getLevelFromString(level) : level;
  }
}

// Global logger instance
export const logger = new LoggingService();
