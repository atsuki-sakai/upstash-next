"use client"

import { useState } from "react"

interface WorkflowResult {
    message: string
    allResults?: {
        result1?: { message: string; timestamp: string }
        result2?: { message: string; previousResult: object; timestamp: string }
    }
    completedAt?: string
}

export default function WorkflowPage() {
    const [isRunning, setIsRunning] = useState(false)
    const [result, setResult] = useState<WorkflowResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    const runWorkflow = async () => {
        setIsRunning(true)
        setError(null)
        setResult(null)

        try {
            // QStash経由でワークフローを開始
            const response = await fetch('/api/workflow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.QSTASH_TOKEN}`
                }
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            setResult(data)

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

                {result && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                        <h3 className="font-semibold mb-2">Workflow Result:</h3>
                        <pre className="text-sm overflow-x-auto">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}