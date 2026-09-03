// Vercel serverless adapter
// Imports the pre-built Express server and exports it as the default handler.
// Vercel rewrites /api/* to this function via vercel.json.
import app from "../dist/index.js";
export default app;
