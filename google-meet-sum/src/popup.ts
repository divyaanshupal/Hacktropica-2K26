/**
 * Popup script — shows live transcript, provides PDF download,
 * and Gemini AI summarization.
 */

interface TranscriptEntry {
  timestamp: string;
  speaker: string;
  text: string;
}

// ── DOM Elements ─────────────────────────────────────────────────────

const transcriptArea = document.getElementById('transcript-content')!;
const emptyState = document.getElementById('empty-state')!;
const entryCount = document.getElementById('entry-count')!;
const statusBar = document.getElementById('status-bar')!;
const statusText = document.getElementById('status-text')!;
const btnDownload = document.getElementById('btn-download')!;
const btnClear = document.getElementById('btn-clear')!;
const btnSummarize = document.getElementById('btn-summarize')!;
const btnDetectTasks = document.getElementById('btn-detect-tasks')!;

// Summary panel
const summaryPanel = document.getElementById('summary-panel')!;
const btnCloseSummary = document.getElementById('btn-close-summary')!;
const summaryLoading = document.getElementById('summary-loading')!;
const summaryResult = document.getElementById('summary-result')!;
const summaryError = document.getElementById('summary-error')!;

let previousEntryCount = 0;
let previousLastText = '';
let refreshTimer: ReturnType<typeof setInterval> | null = null;
let lastTranscriptText = '';

// ── Render Transcript ────────────────────────────────────────────────

function renderTranscript(entries: TranscriptEntry[]): void {
  if (entries.length === 0) {
    emptyState.classList.remove('hidden');
    transcriptArea.innerHTML = '';
    entryCount.textContent = '0 lines';
    lastTranscriptText = '';
    return;
  }

  emptyState.classList.add('hidden');
  entryCount.textContent = `${entries.length} line${entries.length !== 1 ? 's' : ''}`;

  // Build plain text for summarization
  lastTranscriptText = formatEntriesAsText(entries);

  // Only re-render if entry count changed OR the last entry's text changed
  const lastText = entries[entries.length - 1]?.text || '';
  if (entries.length === previousEntryCount && lastText === previousLastText) return;

  previousEntryCount = entries.length;
  previousLastText = lastText;

  // Group consecutive entries by speaker
  interface SpeakerBlock {
    speaker: string;
    timestamp: string;
    lines: string[];
  }

  const blocks: SpeakerBlock[] = [];
  let currentBlock: SpeakerBlock | null = null;

  for (const entry of entries) {
    if (!currentBlock || currentBlock.speaker !== entry.speaker) {
      currentBlock = {
        speaker: entry.speaker,
        timestamp: entry.timestamp,
        lines: [entry.text],
      };
      blocks.push(currentBlock);
    } else {
      currentBlock.lines.push(entry.text);
    }
  }

  // Build HTML
  transcriptArea.innerHTML = blocks
    .map(
      (block) => `
      <div class="transcript-block">
        <div class="transcript-speaker">
          <span class="speaker-name">${escapeHtml(block.speaker)}</span>
          <span class="speaker-time">${escapeHtml(block.timestamp)}</span>
        </div>
        <div class="transcript-text">${escapeHtml(block.lines.join(' '))}</div>
      </div>
    `
    )
    .join('');

  // Auto-scroll to bottom
  const area = document.getElementById('transcript-area')!;
  area.scrollTop = area.scrollHeight;
}

function formatEntriesAsText(entries: TranscriptEntry[]): string {
  let result = '';
  let currentSpeaker = '';

  for (const entry of entries) {
    if (entry.speaker !== currentSpeaker) {
      currentSpeaker = entry.speaker;
      result += `\n[${entry.timestamp}] ${entry.speaker}:\n`;
    }
    result += `${entry.text}\n`;
  }

  return result.trim();
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ── Fetch Transcript from Content Script ─────────────────────────────

async function fetchTranscript(): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      setStatus('inactive', 'No active tab found');
      return;
    }

    // Check if we're on a Google Meet page
    if (!tab.url?.includes('meet.google.com')) {
      setStatus('inactive', 'Not on a Google Meet page');
      return;
    }

    chrome.tabs.sendMessage(
      tab.id,
      { action: 'get_live_transcript' },
      (response) => {
        if (chrome.runtime.lastError) {
          setStatus('waiting', 'Waiting for captions…');
          return;
        }

        if (response?.entries) {
          const entries = response.entries as TranscriptEntry[];
          renderTranscript(entries);

          if (entries.length > 0) {
            setStatus('active', `Capturing — ${entries.length} lines`);
          } else {
            setStatus('waiting', 'Waiting for captions…');
          }
        }
      }
    );
  } catch {
    setStatus('inactive', 'Connection error');
  }
}

// ── Status Bar ───────────────────────────────────────────────────────

function setStatus(state: 'waiting' | 'active' | 'inactive', text: string): void {
  statusBar.className = `status-bar status-${state}`;
  statusText.textContent = text;
}

// ── Summarize with Gemini ────────────────────────────────────────────

btnSummarize.addEventListener('click', async () => handleGeminiAction('summary'));
btnDetectTasks.addEventListener('click', async () => handleGeminiAction('tasks'));

async function handleGeminiAction(mode: 'summary' | 'tasks') {
  if (!lastTranscriptText) {
    // Try fresh fetch
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    chrome.tabs.sendMessage(
      tab.id,
      { action: 'generate_pdf' },
      (response) => {
        if (response?.transcript && response.transcript.length > 0) {
          lastTranscriptText = response.transcript;
          triggerGemini(mode);
        } else {
          showSummaryError('No transcript data yet. Wait for some captions to be captured.');
        }
      }
    );
    return;
  }

  triggerGemini(mode);
}

function triggerGemini(mode: 'summary' | 'tasks'): void {
  // Show summary panel with loading
  summaryPanel.classList.remove('hidden');
  summaryLoading.classList.remove('hidden');
  summaryResult.innerHTML = '';
  summaryError.classList.add('hidden');
  (btnSummarize as HTMLButtonElement).disabled = true;
  (btnDetectTasks as HTMLButtonElement).disabled = true;

  const actionName = mode === 'summary' ? 'summarize_transcript' : 'detect_tasks';

  chrome.runtime.sendMessage(
    { action: actionName, transcript: lastTranscriptText },
    (response) => {
      summaryLoading.classList.add('hidden');
      (btnSummarize as HTMLButtonElement).disabled = false;
      (btnDetectTasks as HTMLButtonElement).disabled = false;

      if (response?.success && response.summary) {
        summaryResult.innerHTML = mode === 'summary' 
          ? markdownToHtml(response.summary) 
          : renderTasksHtml(response.summary);
      } else {
        const errorMsg = response?.error || 'Failed to generate response. Please try again.';
        showSummaryError(errorMsg);
      }
    }
  );
}

function showSummaryError(message: string): void {
  summaryPanel.classList.remove('hidden');
  summaryLoading.classList.add('hidden');
  summaryResult.innerHTML = '';
  summaryError.classList.remove('hidden');
  summaryError.textContent = `⚠️ ${message}`;
}

// Close summary panel
btnCloseSummary.addEventListener('click', () => {
  summaryPanel.classList.add('hidden');
});

// ── Simple Markdown & HTML Renderers ─────────────────────────────────

function markdownToHtml(md: string): string {
  let html = escapeHtml(md);

  // Headers: ## Title → <h2>Title</h2>
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');

  // Bold: **text** → <strong>text</strong>
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Unordered list items: - text → <li>text</li>
  // Group consecutive list items into <ul>
  html = html.replace(/((?:^- .+\n?)+)/gm, (match) => {
    const items = match
      .split('\n')
      .filter((line) => line.startsWith('- '))
      .map((line) => `<li>${line.slice(2)}</li>`)
      .join('');
    return `<ul>${items}</ul>`;
  });

  // Paragraphs: wrap remaining text between block elements
  html = html
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (
        trimmed.startsWith('<h2>') ||
        trimmed.startsWith('<ul>') ||
        trimmed.startsWith('<li>') ||
        trimmed.startsWith('</ul>')
      ) {
        return trimmed;
      }
      return `<p>${trimmed}</p>`;
    })
    .join('\n');

  return html;
}

function renderTasksHtml(jsonStr: string): string {
  try {
    const cleaned = jsonStr.replace(/^```json/im, '').replace(/```\s*$/m, '').trim();
    const tasks = JSON.parse(cleaned);

    if (!Array.isArray(tasks)) {
      throw new Error("Result is not an array");
    }
    
    if (tasks.length === 0) {
      return '<p>No tasks identified.</p>';
    }

    return tasks.map(task => {
      let prioBg = '#f1f5f9';
      let prioColor = '#475569';
      const prio = (task.priority || '').toLowerCase();
      if (prio === 'high') { prioBg = '#fee2e2'; prioColor = '#b91c1c'; }
      else if (prio === 'medium') { prioBg = '#fef3c7'; prioColor = '#92400e'; }
      else if (prio === 'low') { prioBg = '#dbeafe'; prioColor = '#1e40af'; }

      return `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
        <p style="margin: 0 0 12px 0; color: #0f172a; font-size: 13px; font-weight: 500; line-height: 1.4;">
          ${escapeHtml(task.taskContext || 'Unknown task context')}
        </p>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
          <span style="background: #e2e8f0; color: #334155; padding: 4px 8px; border-radius: 4px; font-weight: 600;">
            🏷️ ${escapeHtml(task.domain || 'Domain')}
          </span>
          <span style="background: ${prioBg}; color: ${prioColor}; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; font-weight: 700;">
            ⚡ ${escapeHtml(task.priority || 'Priority')}
          </span>
        </div>
      </div>
      `;
    }).join('');
  } catch (e) {
    return `
      <div style="color: #b91c1c; border: 1px solid #fca5a5; padding: 8px; background: #fee2e2; border-radius: 4px;">
        <strong>Error parsing JSON. Raw Output:</strong>
        <pre style="white-space: pre-wrap; font-size: 10px; margin-top: 8px;">${escapeHtml(jsonStr)}</pre>
      </div>
    `;
  }
}

// ── Download PDF ─────────────────────────────────────────────────────

btnDownload.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  btnDownload.textContent = 'Generating…';
  (btnDownload as HTMLButtonElement).disabled = true;

  chrome.tabs.sendMessage(
    tab.id,
    { action: 'generate_pdf' },
    (response) => {
      if (response?.transcript) {
        // Send to background to generate PDF
        chrome.runtime.sendMessage(
          { action: 'create_pdf', transcript: response.transcript },
          () => {
            btnDownload.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
              </svg>
              Download PDF
            `;
            (btnDownload as HTMLButtonElement).disabled = false;
          }
        );
      } else {
        btnDownload.textContent = 'No transcript yet';
        setTimeout(() => {
          btnDownload.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
            </svg>
            Download PDF
          `;
          (btnDownload as HTMLButtonElement).disabled = false;
        }, 1500);
      }
    }
  );
});

// ── Clear Transcript ─────────────────────────────────────────────────

btnClear.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  chrome.tabs.sendMessage(tab.id, { action: 'clear_transcript' }, () => {
    previousEntryCount = 0;
    lastTranscriptText = '';
    renderTranscript([]);
    setStatus('waiting', 'Transcript cleared');
    // Also close summary panel if open
    summaryPanel.classList.add('hidden');
  });
});

// ── Start Polling ────────────────────────────────────────────────────

fetchTranscript();
refreshTimer = setInterval(fetchTranscript, 1000);

// Cleanup on popup close
window.addEventListener('unload', () => {
  if (refreshTimer) clearInterval(refreshTimer);
});
