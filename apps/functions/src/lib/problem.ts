import type { HandlerResponse } from "@netlify/functions";

/**
 * RFC 7807 Problem Details for HTTP APIs
 * @see https://tools.ietf.org/html/rfc7807
 */
interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
}

export const problem = (
  status: number,
  title: string,
  detail?: string,
  type: string = "about:blank"
): HandlerResponse => {
  const problemDetails: ProblemDetails = {
    type,
    title,
    status,
    detail,
  };

  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/problem+json",
    },
    body: JSON.stringify(problemDetails),
  };
};
