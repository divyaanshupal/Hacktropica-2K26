/**
 * Background service worker for Google Meet Transcript PDF generation
 * and Gemini AI summarization.
 */

import { jsPDF } from 'jspdf';

// ── Constants ────────────────────────────────────────────────────────

const PAGE_MARGIN = 15;
const LINE_HEIGHT = 6;
const TITLE_FONT_SIZE = 16;
const BODY_FONT_SIZE = 10;
const HEADER_SPACING = 12;

// ✅ WORKING GEMINI CONFIG
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_KEY = '';

const GEMINI_API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const DETECT_TASKS_PROMPT = `
You are an expert project manager. Analyze the provided meeting transcript and extract all discussed tasks and issues.

For each task or issue:
- Identify the relevant employee responsible.
- If a participant does not have an employee ID mentioned, invent a dummy one such as "emp-001", "emp-002", etc.
- If an issue is not directly addressed or explicitly assigned to anyone, do not mention assignment.

Return the output as a valid JSON array of objects with EXACTLY the following structure and NO extra text:

[
  {
    "taskContext": "...",
    "domain": "...",
    "priority": "..."
  }
]

STRICT RULES:
- "domain" MUST be EXACTLY one of the following values (do not change spelling, casing, or spaces):
  [
    "AI & Machine Learning",
    "Cybersecurity",
    "Backend Developer",
    "Frontend Developer",
    "DevOps",
    "Cloud"
  ]
- Choose the most appropriate domain based on the task context.

PRIORITY ASSIGNMENT RULES:
- Set "priority" based on urgency, tone, and intent detected in the transcript:
  - "high" → urgent issues, blockers, deadlines, critical bugs, production failures, strong/emotional emphasis
  - "medium" → important but not urgent, planned work, ongoing tasks
  - "low" → minor issues, small improvements, optional tasks, low-impact discussions
- Infer priority from phrases like:
  - "ASAP", "urgent", "blocking", "critical", "not working" → high
  - "we should", "plan to", "next sprint" → medium
  - "minor", "small issue", "not a big problem" → low

TASK CONTEXT RULE:
- Write "taskContext" as a natural, plain-text description of the issue.
- If from the transcript you find out that the task is assigned to someone then include BOTH the person's name and employee ID naturally in the same sentence.
  - Example: "Fix incorrect predictions in fraud detection model assigned to John EMP-002."
- If unassigned, just describe the issue normally.

- Do NOT include any explanations, markdown, or text outside the JSON array.
`;

const SUMMARIZE_PROMPT = `You are an expert meeting analyst. Analyze this meeting transcript and extract the most important information a professional would need after the meeting.

Format your response EXACTLY as follows with these section headers. If a section has no relevant content, write "None identified."

## 📋 Meeting Overview
A 1-2 sentence summary of what the meeting was about.

## ✅ Key Decisions Made
- [Decision 1]
- [Decision 2]

## 📌 Action Items
- [Person]&#58; [Task] (Deadline: [date if mentioned])

## 📅 Deadlines & Dates
- [Date/deadline mentioned and its context]

## 💬 Important Discussion Points
- [Topic 1]&#58; [Brief summary of the discussion]
- [Topic 2]&#58; [Brief summary of the discussion]

## ⚠️ Unresolved Issues / Follow-ups
- [Issue that needs further discussion or follow-up]

## 👥 Participants Mentioned
- [List of names mentioned in the transcript]
`;

// ── Message Handler ──────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  switch (request.action) {
    case 'create_pdf':
      if (request.transcript) {
        generateAndDownloadPDF(request.transcript)
          .then(() => sendResponse({ success: true }))
          .catch((err) => sendResponse({ success: false, error: err.message }));
        return true;
      }
      break;

    case 'summarize_transcript':
      if (request.transcript) {
        callCachedGemini(request.transcript, 'summary')
          .then((summary) => sendResponse({ success: true, summary }))
          .catch((err) =>
            sendResponse({ success: false, error: err.message })
          );
        return true;
      } else {
        sendResponse({ success: false, error: 'No transcript provided' });
      }
      break;

    case 'detect_tasks':
      if (request.transcript) {
        callCachedGemini(request.transcript, 'tasks')
          .then((summary) => sendResponse({ success: true, summary }))
          .catch((err) =>
            sendResponse({ success: false, error: err.message })
          );
        return true;
      } else {
        sendResponse({ success: false, error: 'No transcript provided' });
      }
      break;

    default:
      sendResponse({ error: 'Unknown action' });
  }

  return true;
});

// ── Gemini Summarization ─────────────────────────────────────────────

let geminiCache = {
  summary: { transcript: '', result: '' },
  tasks: { transcript: '', result: '' }
};

async function callCachedGemini(transcript: string, mode: 'summary' | 'tasks'): Promise<string> {
  if (geminiCache[mode].transcript === transcript && geminiCache[mode].result) {
    return geminiCache[mode].result;
  }
  const result = await callGemini(transcript, mode);
  geminiCache[mode].transcript = transcript;
  geminiCache[mode].result = result;
  return result;
}

async function callGemini(transcript: string, mode: 'summary' | 'tasks'): Promise<string> {
  const prompt = mode === 'summary' ? SUMMARIZE_PROMPT : DETECT_TASKS_PROMPT;
  const mimeType = mode === 'summary' ? "text/plain" : "application/json";

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt + '\n\nTRANSCRIPT:\n---\n' + transcript + '\n---',
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2, // lower temperature for more predictable JSON formatting
      maxOutputTokens: 2048,
      responseMimeType: mimeType,
    },
  };

  const response = await fetch(
    `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const msg =
      errorData?.error?.message || response.statusText;
    throw new Error(`Gemini API error: ${msg}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No response generated.');
  }

  return text;
}

// ── PDF Generation ───────────────────────────────────────────────────

async function generateAndDownloadPDF(text: string): Promise<void> {
  let summary = '';
  try {
    summary = await callCachedGemini(text, 'summary');
  } catch (err) {
    summary = '[Failed to generate summary]';
  }

  const fullText = `MEETING SUMMARY\n========================================\n\n${summary}\n\n\nTRANSCRIPT\n========================================\n\n${text}`;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxLineWidth = pageWidth - PAGE_MARGIN * 2;

  const meetDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const meetTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(TITLE_FONT_SIZE);
  doc.text('Google Meet Transcript', PAGE_MARGIN, PAGE_MARGIN + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(BODY_FONT_SIZE);
  doc.setTextColor(100, 100, 100);
  doc.text(`${meetDate} • ${meetTime}`, PAGE_MARGIN, PAGE_MARGIN + 13);

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(
    PAGE_MARGIN,
    PAGE_MARGIN + 17,
    pageWidth - PAGE_MARGIN,
    PAGE_MARGIN + 17
  );

  doc.setTextColor(0, 0, 0);

  let cursorY = PAGE_MARGIN + 17 + HEADER_SPACING;

  const wrappedLines = doc.splitTextToSize(fullText, maxLineWidth);

  for (const line of wrappedLines) {
    if (cursorY + LINE_HEIGHT > pageHeight - PAGE_MARGIN) {
      doc.addPage();
      cursorY = PAGE_MARGIN;

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        'Google Meet Transcript (continued)',
        PAGE_MARGIN,
        cursorY + 4
      );

      doc.setFontSize(BODY_FONT_SIZE);
      doc.setTextColor(0, 0, 0);
      cursorY += 10;
    }

    const isSpeakerLine = /^\[.*\]\s+.*:$/.test(line.trim());
    doc.setFont('helvetica', isSpeakerLine ? 'bold' : 'normal');

    doc.text(line, PAGE_MARGIN, cursorY);
    cursorY += LINE_HEIGHT;
  }

  const pdfBase64 = doc.output('datauristring');

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19);

  chrome.downloads.download({
    url: pdfBase64,
    filename: `Meet_Transcript_${timestamp}.pdf`,
    saveAs: true,
  });
}