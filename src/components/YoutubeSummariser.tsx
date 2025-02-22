'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

const YouTubeSummarizer = () => {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSummary('')

    try {
      const response = await fetch('/api/transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate summary')
      }

      const data = await response.json()
      setSummary(data.summary)
    } catch (err: any) {
      setError(err.message || 'Failed to generate summary. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl w-full mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">Note GPT</h1>
        <p className="text-gray-600 text-md">Transform YouTube videos into concise, actionable summaries</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>YouTube Video Summarizer</CardTitle>
          <CardDescription>Enter a YouTube video URL to get an AI-generated summary</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input type="text" placeholder="Paste YouTube URL here..." value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" />
              <Button type="submit" disabled={!url || loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Summarizing...
                  </>
                ) : (
                  'Summarize'
                )}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {summary && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Summary</h3>
                <Textarea value={summary} readOnly className="min-h-[200px]" />
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default YouTubeSummarizer
