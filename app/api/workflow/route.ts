import { serve } from "@upstash/workflow/nextjs"
import { NextResponse } from "next/server"

export const { POST } = serve(
    async (context) => {
        // Step 1: Initial processing
        const result1 = await context.run("step-1-initial", async () => {
            console.log("Step 1: Initial processing started")
            return { 
                step: 1,
                message: "Initial data processing completed", 
                timestamp: new Date().toISOString() 
            }
        })

        // Sleep for 2 seconds to demonstrate workflow pause
        await context.sleep("sleep-between-steps", 2)

        return result1
    }
)