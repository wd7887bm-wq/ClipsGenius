/**
 * Environment detection and capability checking
 * Detects serverless environments that can't run video processing
 */

export interface EnvironmentCapabilities {
  canRunFFmpeg: boolean;
  canRunPython: boolean;
  canSpawnProcesses: boolean;
  hasDatabase: boolean;
  isServerless: boolean;
  platform: string;
  errorMessage?: string;
}

let cachedCapabilities: EnvironmentCapabilities | null = null;

export function detectEnvironment(): EnvironmentCapabilities {
  if (cachedCapabilities) return cachedCapabilities;

  const isNetlify = !!process.env.NETLIFY || !!process.env.NETLIFY_DEV;
  const isVercel = !!process.env.VERCEL;
  const isAWS = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  const isCloudflare = !!process.env.CF_PAGES;
  
  const isServerless = isNetlify || isVercel || isAWS || isCloudflare;
  const hasDatabase = !!process.env.DATABASE_URL;

  let platform = "server";
  if (isNetlify) platform = "netlify";
  else if (isVercel) platform = "vercel";
  else if (isAWS) platform = "aws-lambda";
  else if (isCloudflare) platform = "cloudflare";

  // Serverless can't run video processing
  const canRunProcesses = !isServerless;

  let errorMessage: string | undefined;
  if (isServerless) {
    errorMessage = `Video processing is not available on ${platform}. This app requires a server environment with FFmpeg and Python. Please deploy to a VPS, Railway, Render, or similar platform.`;
  } else if (!hasDatabase) {
    errorMessage = "Database not configured. Please set DATABASE_URL environment variable.";
  }

  cachedCapabilities = {
    canRunFFmpeg: canRunProcesses,
    canRunPython: canRunProcesses,
    canSpawnProcesses: canRunProcesses,
    hasDatabase,
    isServerless,
    platform,
    errorMessage,
  };

  return cachedCapabilities;
}

export function isProcessingSupported(): boolean {
  const caps = detectEnvironment();
  return caps.canRunFFmpeg && caps.canRunPython && caps.hasDatabase;
}
