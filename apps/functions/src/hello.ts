import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const handler: Handler = async (_event: HandlerEvent, _context: HandlerContext) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello, World!" }),
    headers: {
      "Content-Type": "application/json",
    },
  };
};

export { handler };
