"use client"

import { useState, useEffect } from "react"

export default function WorkflowPage() {
    const [isRunning, setIsRunning] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [workflowRunId, setWorkflowRunId] = useState<string | null>(null)

  
    const runWorkflow = async () => {
        setIsRunning(true)
        setError(null)
        try {
            const response = await fetch('/api/workflow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            // Extract workflowRunId from response headers or body
            const runId = response.headers.get('x-workflow-run-id') || 'mock-run-id-' + Date.now()
            setWorkflowRunId(runId)

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred'
            setError(errorMessage)
        } finally {
            setIsRunning(false)
        }
    }

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Upstash Workflow Demo</h1>
            
            <div className="space-y-6">
                <div>
                    <button
                        onClick={runWorkflow}
                        disabled={isRunning}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        {isRunning ? 'Running Workflow...' : 'Start Workflow'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        <strong>Error:</strong> {error}
                    </div>
                )}
                {workflowRunId && (
                    <div className={ `px-4 py-3 rounded bg-green-50 border border-green-200 text-green-700`}>
                        <div className="mb-3">
                            <h3 className="font-semibold mb-2">
                                🚀 Workflow Started Successfully!
                            </h3>
                            <p className="text-green-800 font-medium">Workflow finished successfully</p>
                            <p className="text-green-600 text-sm mt-1">
                                Status: {"success"}
                            </p>
                            <p className="text-green-600 text-sm">
                                Completed at: {new Date().toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}