import { useState, useRef } from 'react'
import { getPitchHtml } from './lib/template'
import { deployPitch } from './lib/deploy'
import { generatePitch, type GeneratedPitch } from './lib/generate'
import { generateCoverLetterPdf } from './lib/pdf'
import { RefineModal } from './components/RefineModal'

function App() {
  const [jdText, setJdText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generated, setGenerated] = useState<GeneratedPitch | null>(null)
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null)
  const [deploying, setDeploying] = useState(false)
  const [deployMessage, setDeployMessage] = useState<string | null>(null)
  const [originalJd, setOriginalJd] = useState('')
  const [showRefineModal, setShowRefineModal] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [refineError, setRefineError] = useState('')
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>()

  const handleGenerate = async () => {
    setError(null)
    setGenerated(null)
    setGeneratedHtml(null)
    setLoading(true)
    try {
      const pitch = await generatePitch(jdText)
      setOriginalJd(jdText)
      setGenerated(pitch)
      const html = getPitchHtml({
        companyName: pitch.companyName,
        roleName: pitch.roleName,
        tailoredAboutMe: pitch.tailoredAboutMe,
        pairs: pitch.pairs,
      })
      setGeneratedHtml(html)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDeploy = async () => {
    if (!generated || !generatedHtml) return
    setDeployMessage(null)
    setDeploying(true)
    try {
      const result = await deployPitch(
        generated.companyName,
        generated.roleName,
        generatedHtml
      )
      if (result.ok && result.url) {
        setDeployMessage(`Success! Live at: ${result.url}`)
      } else {
        setDeployMessage(`Deploy failed: ${result.error ?? 'Unknown error'}`)
      }
    } catch (e) {
      setDeployMessage(e instanceof Error ? e.message : 'Deploy failed')
    } finally {
      setDeploying(false)
    }
  }

  const handleDownloadPdf = () => {
    if (!generated) return

    // Construct the pitch URL
    const cleanCompany = generated.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    const cleanRole = generated.roleName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    const pitchUrl = `https://candiceshen.com/pitch/${cleanCompany}-${cleanRole}`

    generateCoverLetterPdf({
      companyName: generated.companyName,
      roleName: generated.roleName,
      tailoredAboutMe: generated.tailoredAboutMe,
      pairs: generated.pairs,
      pitchUrl,
    })
  }

  const handleRefineSubmit = async (company: string, role: string, instructions: string) => {
    if (isRegenerating) return

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)

    setIsRegenerating(true)
    setRefineError('')

    try {
      const result = await generatePitch(originalJd, instructions)

      // Override extracted values with user inputs
      const updatedPitch: GeneratedPitch = {
        ...result,
        companyName: company || result.companyName,
        roleName: role || result.roleName,
      }

      setGenerated(updatedPitch)
      const html = getPitchHtml({
        companyName: updatedPitch.companyName,
        roleName: updatedPitch.roleName,
        tailoredAboutMe: updatedPitch.tailoredAboutMe,
        pairs: updatedPitch.pairs,
      })
      setGeneratedHtml(html)
      setShowRefineModal(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to regenerate pitch'
      setRefineError(message)
      setIsRegenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] font-sans antialiased">
      <nav className="sticky top-0 z-10 border-b border-black/10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto max-w-4xl px-6 h-14 flex items-center justify-between">
          <span className="font-bold tracking-tight text-lg text-black">
            Personal Pitch Generator
          </span>
          <a
            href="mailto:candice.shen@yale.edu"
            className="text-sm font-medium text-black hover:underline"
          >
            candice.shen@yale.edu
          </a>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
          Step 1 · Paste the job description
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-black mb-6">
          Dynamic Pitch Generator
        </h1>
        <p className="text-gray-600 mb-8 max-w-2xl">
          Paste the full Job Description below. I’ll analyze it, pick the top 4 requirements,
          match them to my experience (Yale MBA, Microsoft PMM, Materialize/Starburst, vibe coding),
          and generate a tailored pitch page.
        </p>

        <textarea
          className="w-full min-h-[280px] px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black/30 resize-y font-mono text-sm"
          placeholder="Paste the full Job Description here (title, company, requirements, responsibilities…)"
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
        />

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !jdText.trim()}
            className="px-6 py-3 rounded-lg bg-black text-white font-bold text-sm shadow-sm hover:bg-gray-800 disabled:opacity-50 disabled:pointer-events-none transition"
          >
            {loading ? 'Generating…' : 'Generate pitch'}
          </button>
        </div>

        {generated && generatedHtml && (
          <>
            <div className="mt-12 pt-12 border-t border-gray-200">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                Step 2 · Preview & deploy
              </p>
              <h2 className="text-2xl font-extrabold tracking-tighter text-black mb-4">
                {generated.companyName} · {generated.roleName}
              </h2>
              <p className="text-gray-600 mb-4">
                4 "You want / I delivered" pairs generated with rich career stories.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    const url = URL.createObjectURL(new Blob([generatedHtml], { type: 'text/html' }));
                    window.open(url, '_blank', 'noopener');
                  }}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white font-semibold text-sm text-black hover:bg-gray-50 transition"
                >
                  Open preview in new tab
                </button>
                <button
                  type="button"
                  onClick={() => setShowRefineModal(true)}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white font-semibold text-sm text-black hover:bg-gray-50 transition"
                >
                  Refine Company/Role
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white font-semibold text-sm text-black hover:bg-gray-50 transition"
                >
                  Download PDF Cover Letter
                </button>
                <button
                  type="button"
                  onClick={handleDeploy}
                  disabled={deploying}
                  className="px-5 py-2.5 rounded-lg bg-black text-white font-bold text-sm shadow-sm hover:bg-gray-800 disabled:opacity-50 disabled:pointer-events-none transition"
                >
                  {deploying ? 'Deploying…' : 'Deploy to GitHub'}
                </button>
              </div>
              {deployMessage && (
                <div className="mt-4">
                  <p className={`text-sm ${deployMessage.startsWith('Success') ? 'text-green-700' : 'text-red-700'}`}>
                    {deployMessage}
                  </p>
                  {deployMessage.startsWith('Success') && (
                    <button
                      type="button"
                      onClick={() => {
                        const urls = localStorage.getItem('generated-pitches');
                        if (urls) {
                          const blob = new Blob([urls], { type: 'application/json' });
                          const downloadUrl = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = downloadUrl;
                          link.download = 'generated-pitches.json';
                          link.click();
                          URL.revokeObjectURL(downloadUrl);
                        }
                      }}
                      className="mt-2 text-xs text-gray-600 hover:text-gray-800 underline"
                    >
                      Download all generated URLs
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <RefineModal
          isOpen={showRefineModal}
          companyName={generated?.companyName || 'the company'}
          roleName={generated?.roleName || 'this position'}
          isLoading={isRegenerating}
          error={refineError}
          onSubmit={handleRefineSubmit}
          onClose={() => {
            setShowRefineModal(false)
            setRefineError('')
          }}
        />
      </main>
    </div>
  )
}

export default App
