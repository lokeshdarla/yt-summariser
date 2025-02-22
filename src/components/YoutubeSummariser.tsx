'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Youtube, FileText, Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const YouTubeSummarizer = () => {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    // Prevent the button from triggering form submission
    e.preventDefault()
    e.stopPropagation()

    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = summary
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      } catch (err) {
        console.error('Fallback copy failed:', err)
      }
      document.body.removeChild(textArea)
    }
  }

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
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <Youtube className="h-8 w-8" />
            Note GPT
          </h1>
          <p className="text-gray-600 text-lg">Transform YouTube videos into concise, actionable summaries</p>
        </div>

        <Card className="border-t border-black">
          <CardHeader>
            <CardTitle className="text-2xl">YouTube Video Summarizer</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-3">
                <Input type="text" placeholder="Paste YouTube URL here..." value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1 h-12 text-lg border-black focus:ring-black" />
                <Button type="submit" disabled={!url || loading} className="h-12 px-6 text-base bg-black hover:bg-gray-800 text-white" size="lg">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Summarize'
                  )}
                </Button>
              </div>
            </form>

            {error && (
              <Alert className="mt-4 border-black">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {summary && (
              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <h3 className="text-xl font-semibold">Generated Summary</h3>
                  </div>
                  <Button
                    type="button" // Explicitly set button type
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className={`flex items-center gap-1 border-black transition-colors duration-200 ${copied ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                </div>
                <div className="border border-black rounded p-6 prose prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-xl font-bold mb-3" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-lg font-bold mb-2" {...props} />,
                      p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-4" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-4" {...props} />,
                      li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                      blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-black pl-4 italic my-4" {...props} />,
                      code: ({ node, children, ...props }) => (
                        <code className="bg-gray-100 rounded px-1 py-0.5" {...props}>
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {summary}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default YouTubeSummarizer
