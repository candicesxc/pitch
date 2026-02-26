# Manual Override Modal Design
**Date:** 2026-02-26
**Feature:** Allow users to manually refine company name, role name, and add custom instructions after AI extraction

## Overview
After the initial pitch is generated and preview link is created, users can open a modal to refine the extracted values. This addresses cases where AI extraction is incorrect or partially complete. The custom instructions are fed back into the AI to regenerate the pitch with user-specified refinements.

## User Flow
1. User pastes job description
2. AI extracts company/role, generates pitch
3. Preview link is shown
4. Modal appears with pre-filled extracted values
5. User can edit company name, role name, and optionally add custom instructions
6. On "Update Pitch" submit:
   - Re-call AI with original JD + custom instructions
   - Update preview page in-place
   - Modal closes
7. User can re-open modal to make additional adjustments

## Modal Components

### Layout
```
┌─────────────────────────────────────┐
│ ✕  Refine Your Pitch                │
├─────────────────────────────────────┤
│  Company Name                       │
│  [text input, pre-filled]           │
│                                     │
│  Role Name                          │
│  [text input, pre-filled]           │
│                                     │
│  Custom Instructions (optional)     │
│  [textarea, placeholder text]       │
│                                     │
│         [Cancel]  [Update Pitch]    │
└─────────────────────────────────────┘
```

### Fields
- **Company Name** (text input): Pre-filled with auto-extracted value
- **Role Name** (text input): Pre-filled with auto-extracted value
- **Custom Instructions** (textarea): Empty by default, ~5-8 lines tall
  - Placeholder: "e.g., 'Emphasize my AI infrastructure experience' or 'Make the tone more conversational'"
  - Max length: 500 chars
  - Optional field

### Buttons
- **Cancel**: Close modal without changes
- **Update Pitch** (primary): Submit form and regenerate pitch
  - Disabled while loading
  - Shows spinner/loading state during regeneration

## Technical Implementation

### Components to Create
- `RefineModal.tsx`: Modal UI with form fields, validation, and error handling

### Components to Update
- `App.tsx`:
  - Track original JD text in state
  - Show modal after preview link is generated
  - Handle modal submission and pitch regeneration
  - Pass latest pitch data to preview renderer

### API Changes
- `generate.ts`:
  - Add optional `customInstructions` parameter to `generatePitch()` and `aiGenerate()`
  - Inject custom instructions into system prompt when present

### Data Flow
```
App State:
- originalJd: string
- generatedPitch: GeneratedPitch
- showRefineModal: boolean
- isRegenerating: boolean

Modal → Submit
  ├─ Get: company, role, customInstructions
  ├─ Call: generatePitch(originalJd, { company, role, customInstructions })
  └─ Update: generatedPitch in App state

App re-renders
  ├─ Preview updates with new pitch
  └─ Modal closes
```

## System Prompt Enhancement

When custom instructions are provided, add to the AI system prompt:

```
CUSTOM REFINEMENT INSTRUCTIONS:
${customInstructions}

Please adjust the generated pitch to incorporate these refinement requests while maintaining the core structure and all the important details from the career data.
```

## Error Handling

- **Re-generation fails**:
  - Show error message in modal
  - Keep modal open
  - Allow user to modify instructions and retry

- **Empty fields**:
  - Allow empty company/role (uses API defaults)
  - Show warning tooltip

- **Long instructions**:
  - Truncate to 500 chars if exceeded
  - Show char count in real-time

- **Network errors**:
  - Show retry button
  - Graceful degradation

## Edge Cases

1. **User cancels during regeneration**: Modal stays open, can close or retry
2. **Same values submitted**: Skip regeneration if nothing changed
3. **Multiple rapid submissions**: Debounce to prevent double API calls
4. **Modal reopened**: Pre-fill with current pitch values, not original extraction
5. **Mobile responsiveness**: Modal should be 90vw max width, stack layout on small screens

## Success Criteria

- ✅ Modal appears after preview link is generated
- ✅ All three fields are editable by user
- ✅ Custom instructions feed into AI prompt
- ✅ Preview page updates in-place on submit
- ✅ Users can re-open modal and make additional changes
- ✅ Error handling works gracefully
- ✅ Loading states show during regeneration
- ✅ No API call if values unchanged

## Testing Strategy

- Manual: Test with Kong JD, intentionally wrong extraction, custom instructions
- Unit: Test form validation, char limit enforcement
- Integration: Test full flow from JD paste to modal submission to preview update
