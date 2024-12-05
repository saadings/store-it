"use server";

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  emptyStringAsUndefined: true,
  server: {
    CLERK_SECRET_KEY: z.string(),
    CONVEX_DEPLOYMENT: z.string(),
    CLERK_JWT_ISSUER_DOMAIN: z.string(),
    CLERK_WEBHOOK_SECRET: z.string(),
  },
  experimental__runtimeEnv: process.env,
});
