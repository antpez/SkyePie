interface ErrorLogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  context?: string;
  stack?: string;
  metadata?: Record<string, any>;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: ErrorLogEntry[] = [];
  private maxLogs = 100; // Keep only last 100 logs

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private addLog(entry: ErrorLogEntry): void {
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  error(message: string, error?: Error, context?: string, metadata?: Record<string, any>): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
      stack: error?.stack,
      metadata: {
        ...metadata,
        errorName: error?.name,
        errorMessage: error?.message,
      },
    };

    this.addLog(entry);
    console.error(`[${context || 'App'}] ${message}`, error, metadata);
  }

  warn(message: string, context?: string, metadata?: Record<string, any>): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
      metadata,
    };

    this.addLog(entry);
    console.warn(`[${context || 'App'}] ${message}`, metadata);
  }

  info(message: string, context?: string, metadata?: Record<string, any>): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
      metadata,
    };

    this.addLog(entry);
    console.log(`[${context || 'App'}] ${message}`, metadata);
  }

  getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  getLogsByLevel(level: ErrorLogEntry['level']): ErrorLogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  clearLogs(): void {
    this.logs = [];
  }

  getRecentErrors(count: number = 10): ErrorLogEntry[] {
    return this.getLogsByLevel('error').slice(0, count);
  }
}

export const errorLogger = ErrorLogger.getInstance();
export type { ErrorLogEntry };
