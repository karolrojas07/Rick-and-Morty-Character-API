import { Request, Response, NextFunction } from "express";

// ANSI color codes for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
};

// Sensitive fields that should be masked in logs
const sensitiveFields = [
  "password",
  "token",
  "authorization",
  "auth",
  "secret",
  "key",
  "apiKey",
  "accessToken",
  "refreshToken",
  "creditCard",
  "cardNumber",
  "ssn",
  "socialSecurityNumber",
];

// Helper function to mask sensitive data
const maskSensitiveData = (obj: any): any => {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(maskSensitiveData);
  }

  const masked: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveFields.some(
      (field) => lowerKey.includes(field) || field.includes(lowerKey)
    );

    if (isSensitive) {
      masked[key] = "***MASKED***";
    } else if (typeof value === "object" && value !== null) {
      masked[key] = maskSensitiveData(value);
    } else {
      masked[key] = value;
    }
  }
  return masked;
};

// Helper function to get method color
const getMethodColor = (method: string): string => {
  switch (method.toUpperCase()) {
    case "GET":
      return colors.green;
    case "POST":
      return colors.blue;
    case "PUT":
      return colors.yellow;
    case "PATCH":
      return colors.magenta;
    case "DELETE":
      return colors.red;
    default:
      return colors.white;
  }
};

// Helper function to get status color
const getStatusColor = (status: number): string => {
  if (status >= 200 && status < 300) return colors.green;
  if (status >= 300 && status < 400) return colors.yellow;
  if (status >= 400 && status < 500) return colors.red;
  if (status >= 500) return colors.bgRed + colors.white;
  return colors.white;
};

// Helper function to format timestamp
const formatTimestamp = (): string => {
  const now = new Date();
  return now.toISOString();
};

// Helper function to get client IP
const getClientIP = (req: Request): string => {
  return req.ip || req.socket.remoteAddress || "unknown";
};

// Helper function to filter relevant headers
const getRelevantHeaders = (req: Request): Record<string, string> => {
  const relevantHeaders = [
    "user-agent",
    "content-type",
    "accept",
    "authorization",
    "x-forwarded-for",
    "x-real-ip",
    "referer",
    "origin",
  ];

  const filtered: Record<string, string> = {};
  for (const header of relevantHeaders) {
    const value = req.get(header);
    if (value) {
      // Mask authorization header
      if (header === "authorization") {
        filtered[header] = value.startsWith("Bearer ")
          ? "Bearer ***MASKED***"
          : "***MASKED***";
      } else {
        filtered[header] = value;
      }
    }
  }
  return filtered;
};

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = process.hrtime.bigint();
  const timestamp = formatTimestamp();
  const method = req.method;
  const url = req.url;
  const clientIP = getClientIP(req);

  // Log request start
  console.log(
    `\n${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.white}📥 INCOMING REQUEST${colors.reset} ${colors.dim}${timestamp}${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`
  );

  // Method and URL
  console.log(
    `${colors.bright}${getMethodColor(method)}${method.padEnd(7)}${
      colors.reset
    } ${colors.white}${url}${colors.reset}`
  );

  // Client IP
  console.log(
    `${colors.dim}📍 Client IP:${colors.reset} ${colors.white}${clientIP}${colors.reset}`
  );

  // Query parameters
  if (Object.keys(req.query).length > 0) {
    console.log(
      `${colors.dim}🔍 Query:${colors.reset} ${colors.white}${JSON.stringify(
        req.query
      )}${colors.reset}`
    );
  }

  // Headers
  const relevantHeaders = getRelevantHeaders(req);
  if (Object.keys(relevantHeaders).length > 0) {
    console.log(`${colors.dim}📋 Headers:${colors.reset}`);
    for (const [key, value] of Object.entries(relevantHeaders)) {
      console.log(
        `${colors.dim}   ${key}:${colors.reset} ${colors.white}${value}${colors.reset}`
      );
    }
  }

  // Request body (for POST, PUT, PATCH)
  if (
    ["POST", "PUT", "PATCH"].includes(method.toUpperCase()) &&
    req.body &&
    Object.keys(req.body).length > 0
  ) {
    const maskedBody = maskSensitiveData(req.body);
    console.log(
      `${colors.dim}📦 Body:${colors.reset} ${colors.white}${JSON.stringify(
        maskedBody,
        null,
        2
      )}${colors.reset}`
    );
  }

  // Override res.end to capture response details
  const originalEnd = res.end;
  res.end = function (chunk?: any, encoding?: any, cb?: any) {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    const statusCode = res.statusCode;

    // Log response
    console.log(
      `\n${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`
    );
    console.log(
      `${colors.bright}${colors.white}📤 RESPONSE${colors.reset} ${
        colors.dim
      }${formatTimestamp()}${colors.reset}`
    );
    console.log(
      `${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}`
    );

    // Status code with color
    const statusColor = getStatusColor(statusCode);
    const statusIcon =
      statusCode >= 200 && statusCode < 300
        ? "✅"
        : statusCode >= 400
        ? "❌"
        : "⚠️";

    console.log(
      `${statusIcon} ${statusColor}${statusCode}${colors.reset} ${colors.white}${method} ${url}${colors.reset}`
    );
    console.log(
      `${colors.dim}⏱️  Duration:${colors.reset} ${
        colors.white
      }${duration.toFixed(2)}ms${colors.reset}`
    );

    // Content type
    const contentType = res.get("content-type");
    if (contentType) {
      console.log(
        `${colors.dim}📄 Content-Type:${colors.reset} ${colors.white}${contentType}${colors.reset}`
      );
    }

    // Content length
    const contentLength = res.get("content-length");
    if (contentLength) {
      console.log(
        `${colors.dim}📏 Content-Length:${colors.reset} ${colors.white}${contentLength} bytes${colors.reset}`
      );
    }

    console.log(
      `${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════════${colors.reset}\n`
    );

    // Call original end method and return its result
    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};
