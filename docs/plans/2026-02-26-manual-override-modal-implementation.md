# Manual Override Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a refine modal allowing users to manually correct company/role extraction and provide custom instructions for AI regeneration.

**Architecture:**
- Store original JD text in App state to enable regeneration
- Create RefineModal component with form fields for company, role, and custom instructions
- Update generate.ts to accept customInstructions parameter and inject into AI prompt
- Add modal trigger after preview link generation, re-render on submission

**Tech Stack:** React, TypeScript, Tailwind CSS, OpenAI API

---

## Task 1: Update generate.ts - Add customInstructions Parameter

**Files:**
- Modify: `src/lib/generate.ts`

**Step 1: Update type signature**

In `src/lib/generate.ts`, update the function signatures to accept optional `customInstructions`:

```typescript
// Around line 90, update aiGenerate signature:
async function aiGenerate(jdText: string, customInstructions?: string): Promise<GeneratedPitch> {
  // ... existing code
}

// Around line 50, update fallbackGenerate signature:
function fallbackGenerate(jdText: string, customInstructions?: string): GeneratedPitch {
  // ... existing code
}

// Around line 269, update generatePitch signature:
export async function generatePitch(jdText: string, customInstructions?: string): Promise<GeneratedPitch> {
  if (!jdText.trim()) throw new Error('Please paste a job description.');
  try {
    return await aiGenerate(jdText, customInstructions);
  } catch {
    return fallbackGenerate(jdText, customInstructions);
  }
}
```

**Step 2: Inject customInstructions into AI prompt**

In `aiGenerate()` around line 213, after the userPrompt definition, add:

```typescript
  const userPrompt = `Job description:\n\n${jdText.slice(0, 12000)}${
    customInstructions ? `\n\nCUSTOM REFINEMENT INSTRUCTIONS:\n${customInstructions}` : ''
  }`;
```

And update the system prompt around line 131 to include refinement guidance:

```typescript
  const systemPrompt = `You are helping Candice (Xinchen) Shen create a personalized pitch page for a job application.
Use ONLY the following rich career data to fill "I delivered" sections. Do not invent facts or metrics.

RICH CAREER DATA (from NotebookLM):
${richCareerData}

BASIC CAREER DATA:
${careerContext}

${customInstructions ? `CUSTOM REFINEMENT INSTRUCTIONS:\nThe user has requested the following refinements:\n${customInstructions}\n\nPlease incorporate these into the generated pitch while maintaining the core structure and all important details from the career data.\n\n` : ''}

Output valid JSON only, no markdown, with this exact shape:
...rest of prompt`;
```

**Step 3: Verify types compile**

Run: `npx tsc -b`
Expected: No errors

**Step 4: Commit**

```bash
git add src/lib/generate.ts
git commit -m "feat: add customInstructions parameter to pitch generation

- Update aiGenerate, fallbackGenerate, and generatePitch signatures
- Inject custom instructions into AI prompt when provided
- Add refinement guidance to system prompt

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create RefineModal Component

**Files:**
- Create: `src/components/RefineModal.tsx`

**Step 1: Create component file**

```typescript
import React, { useState } from 'react';

interface RefineModalProps {
  isOpen: boolean;
  companyName: string;
  roleName: string;
  isLoading?: boolean;
  onSubmit: (company: string, role: string, instructions: string) => void;
  onClose: () => void;
}

export const RefineModal: React.FC<RefineModalProps> = ({
  isOpen,
  companyName,
  roleName,
  isLoading = false,
  onSubmit,
  onClose,
}) => {
  const [company, setCompany] = useState(companyName);
  const [role, setRole] = useState(roleName);
  const [instructions, setInstructions] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(company.trim(), role.trim(), instructions.trim());
  };

  const charCount = instructions.length;
  const charLimit = 500;
  const exceedsLimit = charCount > charLimit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black">Refine Your Pitch</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 disabled:bg-gray-100 disabled:opacity-50"
              placeholder="e.g., Kong"
            />
          </div>

          {/* Role Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Role Name
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 disabled:bg-gray-100 disabled:opacity-50"
              placeholder="e.g., Senior Product Manager"
            />
          </div>

          {/* Custom Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Custom Instructions <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value.slice(0, charLimit))}
              disabled={isLoading}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 disabled:bg-gray-100 disabled:opacity-50 resize-none"
              placeholder="e.g., Emphasize my AI infrastructure experience and agentic framework expertise"
            />
            <div className="flex items-center justify-between mt-1">
              <span className={`text-xs ${exceedsLimit ? 'text-red-500' : 'text-gray-500'}`}>
                {charCount} / {charLimit}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !company.trim() || !role.trim()}
              className="px-4 py-2 bg-yellow text-black font-semibold rounded-md hover:bg-yellow-dark disabled:opacity-50 flex items-center gap-2"
              style={{
                backgroundColor: 'var(--yellow)',
              }}
            >
              {isLoading && <span>⏳</span>}
              {isLoading ? 'Updating...' : 'Update Pitch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

**Step 2: Verify component renders in isolation**

Create temporary test file `src/components/RefineModal.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { RefineModal } from './RefineModal';

test('renders modal when open', () => {
  render(
    <RefineModal
      isOpen={true}
      companyName="Kong"
      roleName="Senior PMM"
      onSubmit={() => {}}
      onClose={() => {}}
    />
  );
  expect(screen.getByText('Refine Your Pitch')).toBeInTheDocument();
});

test('hides modal when closed', () => {
  const { container } = render(
    <RefineModal
      isOpen={false}
      companyName="Kong"
      roleName="Senior PMM"
      onSubmit={() => {}}
      onClose={() => {}}
    />
  );
  expect(container.firstChild).toBeEmptyDOMElement();
});
```

Run: `npm test -- RefineModal.test.tsx`
Expected: Tests pass (if testing library installed) or at least component imports without error

**Step 3: Commit**

```bash
git add src/components/RefineModal.tsx src/components/RefineModal.test.tsx
git commit -m "feat: create RefineModal component with form fields

- Company name input (required)
- Role name input (required)
- Custom instructions textarea (optional, 500 char limit)
- Loading state and disabled states
- Tailwind styled to match design system

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Update App.tsx to Track Original JD and Show Modal

**Files:**
- Modify: `src/App.tsx`

**Step 1: Add state for original JD and modal**

Around line 20-30 in App.tsx, add to state:

```typescript
const [originalJd, setOriginalJd] = useState('');
const [showRefineModal, setShowRefineModal] = useState(false);
const [isRegenerating, setIsRegenerating] = useState(false);
```

**Step 2: Store original JD when generating**

In the `handleGenerate` function (around line 50-80), after calling `generatePitch()`:

```typescript
const handleGenerate = async (jd: string) => {
  setLoading(true);
  setError('');
  try {
    const result = await generatePitch(jd);
    setOriginalJd(jd);  // Store for later regeneration
    setGeneratedPitch(result);
    // ... rest of existing code
  } catch (err) {
    // ... error handling
  }
};
```

**Step 3: Add refineModal submission handler**

Add new function before render:

```typescript
const handleRefineSubmit = async (company: string, role: string, instructions: string) => {
  setIsRegenerating(true);
  try {
    const result = await generatePitch(originalJd, instructions);

    // Override extracted values with user inputs
    setGeneratedPitch({
      ...result,
      companyName: company || result.companyName,
      roleName: role || result.roleName,
    });

    setShowRefineModal(false);
  } catch (err) {
    alert('Failed to regenerate pitch. Please try again.');
    console.error(err);
  } finally {
    setIsRegenerating(false);
  }
};
```

**Step 4: Show modal after preview generation**

After the preview link is displayed (around where you show the copy button), add:

```typescript
{previewUrl && (
  <div className="mt-4 space-y-4">
    {/* Existing preview link section */}

    {/* Add refine button */}
    <button
      onClick={() => setShowRefineModal(true)}
      className="mt-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-900 font-medium"
    >
      Refine Company/Role
    </button>
  </div>
)}

{/* Add modal to render */}
<RefineModal
  isOpen={showRefineModal}
  companyName={generatedPitch?.companyName || 'the company'}
  roleName={generatedPitch?.roleName || 'this position'}
  isLoading={isRegenerating}
  onSubmit={handleRefineSubmit}
  onClose={() => setShowRefineModal(false)}
/>
```

**Step 5: Import RefineModal**

At top of App.tsx, add:

```typescript
import { RefineModal } from './components/RefineModal';
```

**Step 6: Verify types compile**

Run: `npx tsc -b`
Expected: No errors

**Step 7: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate RefineModal into App, add regeneration flow

- Track original JD for regeneration
- Show refine button after preview link generated
- Handle modal submission with custom instructions
- Override company/role with user input
- Add loading states during regeneration

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Test Full Flow Locally

**Files:**
- Test: Manual testing in browser

**Step 1: Rebuild and start preview server**

```bash
cd "/Users/xinchenshen/Desktop/Vibe Coding/Personal Pitch"
npm run build
npx vite preview --port 5173
```

Expected: Server running at http://localhost:5173/pitch/

**Step 2: Test with Kong JD**

1. Navigate to http://localhost:5173/pitch/
2. Paste the Kong job description (provided by user)
3. Wait for pitch generation
4. Verify preview link appears
5. Click "Refine Company/Role" button
6. Verify modal opens with pre-filled values:
   - Company Name: "Kong"
   - Role Name: "Senior Technical Product Marketing Manager - AI"
   - Custom Instructions: empty
7. Edit fields:
   - Keep company as "Kong"
   - Change role to "Sr. PMM, AI"
   - Add instructions: "Emphasize AI infrastructure and agentic framework expertise"
8. Click "Update Pitch"
9. Verify modal closes
10. Verify preview page updates with new role name

**Step 3: Test error handling**

1. Try submitting modal with empty company/role (button should be disabled)
2. Open DevTools Network tab and throttle connection
3. Click "Update Pitch" and watch loading state
4. If API fails, verify error handling works

**Step 4: Commit test observations**

```bash
git add -A
git commit -m "test: verify manual override modal flow end-to-end

Manual testing confirmed:
- Modal opens after pitch generation
- Pre-filled values display correctly
- Form submission triggers regeneration
- Preview updates with user-provided company/role
- Custom instructions fed to AI prompt
- Loading states display during regeneration

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Polish and Error Handling

**Files:**
- Modify: `src/components/RefineModal.tsx`
- Modify: `src/App.tsx`

**Step 1: Add error state to modal**

Update RefineModal props:

```typescript
interface RefineModalProps {
  isOpen: boolean;
  companyName: string;
  roleName: string;
  isLoading?: boolean;
  error?: string;  // Add this
  onSubmit: (company: string, role: string, instructions: string) => void;
  onClose: () => void;
}
```

Add error display in modal after form:

```typescript
{error && (
  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
    <p className="text-sm text-red-700">{error}</p>
    <button
      onClick={() => onSubmit(company, role, instructions)}
      className="mt-2 text-xs text-red-600 hover:text-red-700 underline"
    >
      Try again
    </button>
  </div>
)}
```

**Step 2: Update App.tsx to pass error to modal**

Add error state:

```typescript
const [refineError, setRefineError] = useState('');
```

Update handler:

```typescript
const handleRefineSubmit = async (company: string, role: string, instructions: string) => {
  setIsRegenerating(true);
  setRefineError('');
  try {
    // ... existing code
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to regenerate pitch';
    setRefineError(message);
    setIsRegenerating(false);
    // Don't close modal, let user retry
  }
};
```

Pass to modal:

```typescript
<RefineModal
  isOpen={showRefineModal}
  companyName={generatedPitch?.companyName || 'the company'}
  roleName={generatedPitch?.roleName || 'this position'}
  isLoading={isRegenerating}
  error={refineError}
  onSubmit={handleRefineSubmit}
  onClose={() => {
    setShowRefineModal(false);
    setRefineError('');
  }}
/>
```

**Step 3: Add debounce to prevent double submissions**

In App.tsx, add helper:

```typescript
const debounceTimerRef = useRef<NodeJS.Timeout>();

const handleRefineSubmit = async (company: string, role: string, instructions: string) => {
  if (isRegenerating) return; // Already submitting

  if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

  setIsRegenerating(true);
  setRefineError('');

  try {
    // ... rest of code
  }
};
```

**Step 4: Test error handling**

1. Disable network in DevTools
2. Open modal and try to submit
3. Verify error message appears
4. Re-enable network
5. Click "Try again"
6. Verify regeneration works

**Step 5: Commit**

```bash
git add src/components/RefineModal.tsx src/App.tsx
git commit -m "feat: add error handling and debounce to modal

- Display error message when regeneration fails
- Add retry button in error state
- Debounce form submissions to prevent double API calls
- Clear error when modal closes
- Modal stays open on error for retry

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Push to GitHub and Verify Deployment

**Files:**
- All changes committed

**Step 1: Push to GitHub**

```bash
git push origin main
```

Expected: All commits pushed successfully

**Step 2: Verify GitHub Actions runs**

Go to: https://github.com/candicesxc/pitch/actions
Expected: "Deploy to GitHub Pages" workflow runs and completes

**Step 3: Test deployed version**

After GitHub Actions completes:
1. Navigate to http://candiceshen.com/pitch/
2. Paste Kong JD
3. Verify extraction works (should now have API key from secrets)
4. Click "Refine Company/Role"
5. Edit fields and verify regeneration
6. Verify preview updates

**Step 4: Final commit**

```bash
git log --oneline -6
```

Document summary:

```bash
git commit --allow-empty -m "docs: manual override modal feature complete

Deployed to production:
- Refine modal allows company/role/instruction overrides
- Custom instructions fed to AI for regeneration
- Full error handling and retry flow
- Tests pass locally and in preview

Deployed features:
- RefineModal component with form
- generatePitch accepts customInstructions
- App tracks original JD for regeneration
- Modal triggered after preview link generation

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Implementation Notes

### Testing Approach
- Use local preview server during development
- Manual testing with Kong JD (provided by user)
- Test error scenarios: network failure, API error, invalid input
- Verify UI states: loading, disabled, error

### API Cost Consideration
- Each modal submission triggers new API call
- User should understand this (could add warning)
- Consider adding "Preview changes" vs "Save" flow if cost is concern

### Future Enhancements
- Save generated pitches history
- Quick-access templates for instructions
- Batch regeneration for multiple JDs
- Analytics on what instructions users typically apply

