import type { HandlerResponse } from "@netlify/functions";

/**
 * RFC 7807 Problem Details for HTTP APIs
 */
interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  traceId?: string;
}

/**
 * Génère un traceId unique pour le tracing
 */
function generateTraceId(): string {
  return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const problem = (
  status: number,
  title: string,
  detail?: string,
  type: string = "about:blank",
  traceId?: string
): HandlerResponse => {
  const problemDetails: ProblemDetails = {
    type,
    title,
    status,
    detail,
    traceId: traceId || generateTraceId(),
  };

  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/problem+json",
      "X-Trace-Id": problemDetails.traceId!,
    },
    body: JSON.stringify(problemDetails),
  };
};
