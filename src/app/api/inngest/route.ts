export const dynamic = "force-dynamic";

import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { 
  discoverNewContentOnce, 
  discoverNewContentRecurring,
  processIntelligencePipeline,
  distributePublication
} from "@/inngest/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    discoverNewContentOnce,
    discoverNewContentRecurring,
    processIntelligencePipeline,
    distributePublication,
  ],
});
