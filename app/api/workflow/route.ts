import { serve } from "@upstash/workflow/nextjs"

export const { POST } = serve(
    async (context) => {
        const result1 = await context.run("initial-step", async () => {
            console.log("Initial step started")
            return { message: "Step 1 completed", timestamp: new Date().toISOString() }
        })

        const result2 = await context.run("data-processing", async () => {
            console.log("Processing data from step 1:", result1)
            await context.sleep("wait-5-seconds", 5)
            return { 
                message: "Step 2 completed after waiting", 
                previousResult: result1,
                timestamp: new Date().toISOString() 
            }
        })

        const finalResult = await context.run("final-step", async () => {
            console.log("Final step with results:", { result1, result2 })
            return {
                message: "Workflow completed successfully",
                allResults: { result1, result2 },
                completedAt: new Date().toISOString()
            }
        })

        return finalResult
    }
)