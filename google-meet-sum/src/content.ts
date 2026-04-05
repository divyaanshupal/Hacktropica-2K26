/**
 * Content script for Google Meet Transcript Capture
 *
 * Selectors derived from real Google Meet DOM:
 *   Container:   [aria-label="Captions"]
 *   Speaker:     .NWpY1d
 *   Caption text: .ygicle
 */

(() => {
  // ── Selectors ──────────────────────────────────────────────────────
  const CAPTION_CONTAINER_SELECTOR = '[aria-label="Captions"]';
  const SPEAKER_NAME_SELECTOR = '.NWpY1d';
  const CAPTION_TEXT_SELECTOR = '.ygicle';

  // ── State ──────────────────────────────────────────────────────────
  interface TranscriptEntry {
    timestamp: string;
    speaker: string;
    text: string;
  }

  let transcriptEntries: TranscriptEntry[] = [];
  let observer: MutationObserver | null = null;
  
  // Track the associated array index for each particular caption DOM block
  let blockIndexMap = new WeakMap<Element, number>();

  /**
   * Returns a formatted timestamp string.
   */
  function getTimestamp(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  function processCaptions(): void {
    const container = document.querySelector(CAPTION_CONTAINER_SELECTOR);
    if (!container) return;

    const captionBlocks = container.querySelectorAll('.nMcdL');

    captionBlocks.forEach((block) => {
      const speakerEl = block.querySelector(SPEAKER_NAME_SELECTOR);
      const textEl = block.querySelector(CAPTION_TEXT_SELECTOR);

      if (!textEl?.textContent) return;

      const speaker = speakerEl?.textContent?.trim() ?? 'Unknown';
      const text = textEl.textContent.trim();
      if (!text) return;

      const existingIndex = blockIndexMap.get(block);

      if (existingIndex !== undefined && transcriptEntries[existingIndex]) {
        // We already created an entry for this exact DOM block.
        // Google Meet is just typing out more text, so update it.
        transcriptEntries[existingIndex].text = text;
      } else {
        // This is a brand new caption block in the DOM.
        const entry: TranscriptEntry = {
          timestamp: getTimestamp(),
          speaker,
          text,
        };
        const index = transcriptEntries.length;
        transcriptEntries.push(entry);
        blockIndexMap.set(block, index);
      }
    });
  }

  /**
   * Starts the MutationObserver on the captions container.
   */
  function startObserving(): void {
    const targetNode = document.querySelector(CAPTION_CONTAINER_SELECTOR);
    if (!targetNode) return;

    if (observer) observer.disconnect();

    observer = new MutationObserver(() => {
      processCaptions();
    });

    observer.observe(targetNode, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    console.log('[Meet Transcriber] ✅ Started capturing captions.');
  }

  /**
   * Formats the transcript entries into a readable string.
   */
  function formatTranscript(): string {
    let result = '';
    let currentSpeaker = '';

    for (const entry of transcriptEntries) {
      if (entry.speaker !== currentSpeaker) {
        currentSpeaker = entry.speaker;
        result += `\n[${entry.timestamp}] ${entry.speaker}:\n`;
      }
      result += `${entry.text}\n`;
    }

    return result.trim();
  }

  /**
   * Returns the structured transcript entries as JSON-serializable data.
   */
  function getTranscriptData(): TranscriptEntry[] {
    return [...transcriptEntries];
  }

  // ── Message Listener ───────────────────────────────────────────────

  chrome.runtime.onMessage.addListener(
    (request: { action: string }, _sender, sendResponse) => {
      switch (request.action) {
        case 'generate_pdf':
          sendResponse({ transcript: formatTranscript() });
          break;

        case 'get_live_transcript':
          sendResponse({ entries: getTranscriptData() });
          break;

        case 'clear_transcript':
          transcriptEntries = [];
          blockIndexMap = new WeakMap<Element, number>();
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ error: 'Unknown action' });
      }
      return true;
    }
  );

  // ── Polling for Caption Container ──────────────────────────────────

  const POLL_INTERVAL_MS = 2000;
  const MAX_POLL_ATTEMPTS = 300; // ~10 minutes
  let pollCount = 0;

  const pollInterval = setInterval(() => {
    pollCount++;
    const container = document.querySelector(CAPTION_CONTAINER_SELECTOR);

    if (container) {
      startObserving();
      clearInterval(pollInterval);
      console.log('[Meet Transcriber] Caption container found.');
    } else if (pollCount >= MAX_POLL_ATTEMPTS) {
      clearInterval(pollInterval);
      console.log('[Meet Transcriber] Caption container not found after max attempts.');
    }
  }, POLL_INTERVAL_MS);

  console.log('[Meet Transcriber] Content script loaded, polling for captions...');
})();