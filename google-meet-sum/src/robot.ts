import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());
import * as fs from 'fs';
import * as path from 'path';

const MEET_URL = process.argv[2];

if (!MEET_URL) {
  console.error('\n❌ Please provide a Google Meet URL.\nUsage: npx tsx src/robot.ts <meet-url>\n');
  process.exit(1);
}

const TRANSCRIPT_FILE = path.join(process.cwd(), 'transcript.txt');

// Initialize or clear the transcript file
fs.writeFileSync(TRANSCRIPT_FILE, `Google Meet Transcript\nStarted at: ${new Date().toLocaleString()}\n----------------------------------------\n\n`);

console.log(`[Robot] 🤖 Starting bot for ${MEET_URL}`);

(async () => {
  // Launch browser with flags to automatically allow camera/microphone
  const browser = await puppeteer.launch({
    headless: false, // Must be false to properly interact with Meet's joining UI easily
    userDataDir: path.join(process.cwd(), '.chrome_data'), // Keeps you logged in
    executablePath: '/usr/bin/google-chrome', // Use actual Chrome so Google doesn't block the browser
    ignoreDefaultArgs: ['--enable-automation'], // Removes the "Chrome is being controlled by automated software" banner
    args: [
      '--use-fake-ui-for-media-stream', // Automatically grants permissions
      '--use-fake-device-for-media-stream', // Feeds a dummy video/audio stream instead of actual hardware
      '--disable-notifications',
    ],
  });

  const page = await browser.newPage();

  // Expose function to write appended lines directly to our local file
  await page.exposeFunction('onLineFinalized', (text: string) => {
    fs.appendFileSync(TRANSCRIPT_FILE, `${text}\n`);
    console.log(`[Transcript] ${text}`);
  });

  console.log('[Robot] 🌐 Navigating to Meet...');
  await page.goto(MEET_URL, { waitUntil: 'networkidle2' });

  // Wait for the "What's your name?" input or directly join if signed in
  console.log('[Robot] ⏳ Waiting for pre-join screen...');
  console.log(`[Robot] 💡 If Google Meet shows "You can't join this video call", please click "Sign In" and log in.`);
  console.log(`[Robot] 💡 The bot will wait up to 3 minutes for you to log in manually...`);
  
  try {
    // Wait up to 180 seconds for the user to solve any sign-in walls and arrive at the pre-join screen
    let isReady = false;
    for(let i=0; i<90; i++) {
        isReady = await page.evaluate(() => {
            const hasInput = !!document.querySelector('input[type="text"]');
            const hasJoinBtn = Array.from(document.querySelectorAll('button')).some(b => 
                b.textContent?.includes('Ask to join') || 
                b.textContent?.includes('Join now') || 
                b.textContent?.includes('Join')
            );
            return hasInput || hasJoinBtn;
        });
        if (isReady) break;
        await new Promise(r => setTimeout(r, 2000));
    }
    
    // 1. If there's an input field for anonymous guests, fill it
    const nameInput = await page.$('input[type="text"]');
    if (nameInput) {
      console.log('[Robot] ✍️  Entering name...');
      await nameInput.type('Meet Transcriber Bot');
    }
    
    console.log('[Robot] 🖱️  Attempting to click Join / Ask to join...');
    // 2. Click the specific Ask to join / Join now button
    const clickSuccess = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const joinBtn = buttons.find(b => 
        b.textContent?.includes('Ask to join') || 
        b.textContent?.includes('Join now') || 
        b.textContent?.includes('Join')
      );
      if (joinBtn) {
        joinBtn.click();
        return true;
      }
      return false;
    });
    
    // Fallback: press Enter just in case the button click missed
    if (!clickSuccess) {
      await page.keyboard.press('Enter');
    }
    
    console.log('[Robot] 🛎️  Requested to join. Waiting for host to admit (or directly joining)...');
  } catch (e) {
    console.log('[Robot] ⚠️  Pre-join automation failed, continuing anyway...');
  }

  // Wait until we are inside the call. 
  // We can detect this by looking for the "Turn on captions" toggle or the main controls bar.
  console.log('[Robot] ⏳ Waiting to be admitted...');
  await page.waitForSelector('[aria-label*="Turn on captions"]', { timeout: 0 }); // Wait indefinitely for host to admit

  console.log('[Robot] ✅ Joined the meeting!');

  // Turn on captions
  console.log('[Robot] 📝 Turning on captions...');
  await page.click('[aria-label*="Turn on captions"]');

  // Inject the DOM transcription extraction logic
  console.log('[Robot] 🧠 Injecting transcriber logic...');
  
  await page.evaluate(() => {
    // Note: We are inside the browser context here.
    
    // We use the function exposed from Puppeteer via window

    const CAPTION_CONTAINER_SELECTOR = '[aria-label="Captions"]';
    const SPEAKER_NAME_SELECTOR = '.NWpY1d';
    const CAPTION_TEXT_SELECTOR = '.ygicle';

    // Same logic from the Chrome Extension
    interface TranscriptEntry {
      timestamp: string;
      speaker: string;
      text: string;
    }

    let transcriptEntries: TranscriptEntry[] = [];
    const blockIndexMap = new WeakMap<Element, number>();

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
      
      const currentBlocks = new Set<Element>();

      captionBlocks.forEach((block) => {
        currentBlocks.add(block);
        const speakerEl = block.querySelector(SPEAKER_NAME_SELECTOR);
        const textEl = block.querySelector(CAPTION_TEXT_SELECTOR);

        if (!textEl?.textContent) return;

        const speaker = speakerEl?.textContent?.trim() ?? 'Unknown';
        const text = textEl.textContent.trim();
        if (!text) return;

        const existingIndex = blockIndexMap.get(block);

        if (existingIndex !== undefined && transcriptEntries[existingIndex]) {
          transcriptEntries[existingIndex].text = text;
        } else {
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

      // To handle streaming to the Node.js file, we need a way to detect when a line is "done".
      // Google Meet removes old nodes from the DOM once they scroll out.
      // So if a node we tracked is NO LONGER inside `currentBlocks`, 
      // we consider it finalized and send it to Node.js!
    }

    const observer = new MutationObserver(() => processCaptions());

    // Wait until the caption container appears in the DOM
    const initInterval = setInterval(() => {
      const container = document.querySelector(CAPTION_CONTAINER_SELECTOR);
      if (container) {
        observer.observe(container, {
          childList: true,
          subtree: true,
          characterData: true,
        });

        // Background poller to check for finalized nodes
        setInterval(() => {
          // Identify nodes that scrolled out of view to finalize them
          
          for (let i = 0; i < transcriptEntries.length; i++) {
            const entry = transcriptEntries[i];
            if (!(entry as any).finalized) {
               // We don't have a direct reverse map from index to Node,
               // but we know that if an element is offscreen, its entry is done.
               // Actually, it's safer to just track the "last rendered" index in Node.
               // A simpler approach: Just track the highest index that is currently active,
               // and anything BEFORE that can be safely flushed.
            }
          }
        }, 2000);

        clearInterval(initInterval);
      }
    }, 2000);
  });

  // Let's modify the above logic lightly. It's much easier to just send 
  // the entire current transcript buffer up to Node every X seconds and have 
  // Node write the difference, OR we can flush finalized lines. 
  // I will re-inject a better `page.evaluate()` block to properly flush sentences.

  await page.evaluate(() => {
    // Override the previous inject with a simpler one that flushes

    const CAPTION_CONTAINER_SELECTOR = '[aria-label="Captions"]';
    
    let lastFlushedIndex = -1;
    let transcriptEntries: { speaker: string; text: string; timestamp: string }[] = [];
    const blockIndexMap = new WeakMap<Element, number>();

    const observer = new MutationObserver(() => {
      const container = document.querySelector(CAPTION_CONTAINER_SELECTOR);
      if (!container) return;

      const blocks = container.querySelectorAll('.nMcdL');
      
      blocks.forEach((block) => {
        const speaker = block.querySelector('.NWpY1d')?.textContent?.trim() ?? 'Unknown';
        const text = block.querySelector('.ygicle')?.textContent?.trim() ?? '';
        
        if (!text) return;

        const idx = blockIndexMap.get(block);
        if (idx !== undefined) {
          transcriptEntries[idx].text = text;
        } else {
          const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          transcriptEntries.push({ speaker, text, timestamp });
          blockIndexMap.set(block, transcriptEntries.length - 1);
        }
      });
    });

    setInterval(() => {
      // Find the index of the first ACTIVE block on screen
      const activeBlocks = document.querySelectorAll('.nMcdL');
      if (activeBlocks.length === 0) return;

      const firstActiveIndex = blockIndexMap.get(activeBlocks[0]);
      
      if (firstActiveIndex !== undefined) {
        // Anything strictly LESS than the first active index has scrolled off screen,
        // which means Google Meet is done updating it. It is safe to flush!
        for (let i = lastFlushedIndex + 1; i < firstActiveIndex; i++) {
          const entry = transcriptEntries[i];
          const formatted = `[${entry.timestamp}] ${entry.speaker}: ${entry.text}`;
          (window as any).onLineFinalized(formatted);
          lastFlushedIndex = i;
        }
      }
    }, 2000);

    const initInterval = setInterval(() => {
      const container = document.querySelector(CAPTION_CONTAINER_SELECTOR);
      if (container) {
        observer.observe(container, { childList: true, subtree: true, characterData: true });
        clearInterval(initInterval);
      }
    }, 2000);
  });

  console.log('\n[Robot] 🎧 Listening to the meeting. Press Ctrl+C to stop.\n');

  // Keep script alive indefinitely
  await new Promise(() => {});

})();
