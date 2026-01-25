async function initApp() {
    let cards = [];
    let currentIndex = 0;

    // Cache for loaded decks: filename -> array of card objects
    const deckCache = {};

    const cardElement = document.getElementById('card');
    const frontText = document.getElementById('front-text');
    const backText = document.getElementById('back-text');
    const cardIndexInput = document.getElementById('cardIndexInput');
    const totalCardsSpan = document.getElementById('totalCards');
    const deckSelect = document.getElementById('deckSelect');

    // Progress controls (prev/random/next) — now located in the progress bar
    const progressControls = document.querySelector('.progress__controls');

    // When unflipping we delay showing controls until the card has finished its transform/animation
    let revealTimeout = null;
    function clearRevealTimeout() {
        if (revealTimeout) {
            clearTimeout(revealTimeout);
            revealTimeout = null;
        }
    }

    function updateControlsVisibility() {
        const flipped = cardElement.classList.contains('is-flipped');
        const controlsHidden = cardElement.classList.contains('controls-hidden');
        // Hide the progress controls while flipped or while explicitly hidden
        if (progressControls) progressControls.setAttribute('aria-hidden', (controlsHidden || flipped) ? 'true' : 'false');
    }

    function hideControlsImmediately() {
        clearRevealTimeout();
        cardElement.classList.add('controls-hidden');
        updateControlsVisibility();
        // Also add aria-hidden to progress controls immediately for instant feedback
        if (progressControls) progressControls.setAttribute('aria-hidden', 'true');
    }

    function hideControlsUntilRevealed() {
        // Keep controls hidden and set a fallback to reveal in case no transition/animation fires
        hideControlsImmediately();
        clearRevealTimeout();
        revealTimeout = setTimeout(() => {
            if (!cardElement.classList.contains('is-flipped')) {
                cardElement.classList.remove('controls-hidden');
                updateControlsVisibility();
            }
            revealTimeout = null;
        }, 750); // slightly longer than flip transition (600ms)
    }

    // Toggle flip, hide controls as needed and reveal after animation/transition
    function toggleFlip() {
        const willBeFlipped = !cardElement.classList.contains('is-flipped');
        cardElement.classList.toggle('is-flipped');
        if (willBeFlipped) {
            // Going to flipped: hide controls immediately
            hideControlsImmediately();
        } else {
            // Going back to front: keep hidden until fully back
            hideControlsUntilRevealed();
        }
    }

    // Remove controls-hidden once the transform transition ends (card fully returned to front)
    cardElement.addEventListener('transitionend', (e) => {
        const prop = e.propertyName || e.elapsedTime;
        if ((prop === 'transform' || prop.includes('transform')) && !cardElement.classList.contains('is-flipped')) {
            clearRevealTimeout();
            cardElement.classList.remove('controls-hidden');
            updateControlsVisibility();
        }
    });

    // Also watch animationend for slide-in animations used during card changes
    cardElement.addEventListener('animationend', (e) => {
        const name = e.animationName || '';
        if ((name.startsWith('slideIn') || name.startsWith('slide-in')) && !cardElement.classList.contains('is-flipped')) {
            clearRevealTimeout();
            cardElement.classList.remove('controls-hidden');
            updateControlsVisibility();
        }
    });

    const parseContent = (rawText) => {
        const sections = rawText.split(/^## /m).slice(1);
        const extractedCards = [];

        sections.forEach(sectionText => {
            const lines = sectionText.split('\n');
            const sectionTitle = lines[0].trim();
            const content = lines.slice(1).join('\n');

            // Allow optional space after ** and optional dot after number
            const questionRegex = /\*\*\s*(\d+(?:\s+xx)?)\.?\s*([\s\S]*?)\*\*\s*([\s\S]*?)(?=\n\s*(?:\*\*\d+|#|---)|$)/g;

            let match;
            while ((match = questionRegex.exec(content)) !== null) {
                const fullQuestionLine = match[0];
                // match[1] is number, match[2] is question, match[3] is answer
                const question = match[2].trim();
                const answer = match[3].trim();
                const isImportant = fullQuestionLine.includes(' xx');

                const parseMD = (txt) => {
                    let lines = txt.split('\n').map(l => l.trim()).filter(l => l !== '');
                    let html = '';
                    let inList = false;

                    lines.forEach(line => {
                        if (line.startsWith('* ')) {
                            if (!inList) {
                                html += '<ul style="text-align: left; margin: 10px 0; padding-left: 20px;">';
                                inList = true;
                            }
                            let content = line.substring(2)
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em>$1</em>');
                            html += `<li>${content}</li>`;
                        } else {
                            if (inList) {
                                html += '</ul>';
                                inList = false;
                            }
                            let content = line
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em>$1</em>');
                            html += `<div style="margin-bottom: 0.5em;">${content}</div>`;
                        }
                    });

                    if (inList) {
                        html += '</ul>';
                    }
                    return html;
                };

                extractedCards.push({
                    q: `<div style="font-size: 0.7em; opacity: 0.7; margin-bottom: 8px; text-transform: uppercase;">${sectionTitle}</div><div>${parseMD(question)}</div>`,
                    a: parseMD(answer),
                    isImportant: isImportant
                });
            }
        });
        return extractedCards;
    };

    const loadDeckFromFile = async (filename) => {
        if (deckCache[filename]) {
            return deckCache[filename];
        }
        try {
            const response = await fetch(filename);
            if (!response.ok) throw new Error(`Failed to fetch ${filename}`);
            const rawText = await response.text();
            const parsed = parseContent(rawText);
            console.log(`Parsed ${parsed.length} cards from ${filename}`);
            deckCache[filename] = parsed;
            return parsed;
        } catch (error) {
            console.error('Error loading questions:', error);
            frontText.innerHTML = "Erreur lors du chargement des questions.";
            return [];
        }
    };

    // Initial load
    await (async () => {
        const initialCards = await loadDeckFromFile('questions-plongeeplaisir.md');
        cards = [...initialCards];
        updateCard();
        // Ensure controls visibility is correct on initial load
        updateControlsVisibility();
    })();

    // 4. Functions
    function updateCardContent(index) {
        if (!cards[index]) return;
        const currentCard = cards[index];
        frontText.innerHTML = currentCard.q;
        backText.innerHTML = currentCard.a;

        frontText.style.color = '';
        frontText.style.borderColor = '';

        // Reset scroll position to top for both faces
        frontText.scrollTop = 0;
        backText.scrollTop = 0;

        cardIndexInput.value = index + 1;
        totalCardsSpan.innerText = cards.length;
    }

    function updateCard() {
        if (cards.length === 0) {
            frontText.innerHTML = "Aucune question trouvée.";
            backText.innerHTML = "";
            totalCardsSpan.innerText = "0";
            cardElement.classList.remove('is-flipped');
            return;
        }

        // Reset flip state
        const wasFlipped = cardElement.classList.contains('is-flipped');
        cardElement.classList.remove('is-flipped');
        if (wasFlipped) {
            // keep hidden until fully back
            hideControlsUntilRevealed();
        } else {
            cardElement.classList.remove('controls-hidden');
            updateControlsVisibility();
        }

        // Wait a tiny bit to update text so user doesn't see it change while flipping back
        setTimeout(() => {
            updateCardContent(currentIndex);
        }, 200);
    }

    function animateAndChange(direction) {
        // Prevent double animation if user clicks fast
        if (cardElement.classList.contains('slide-out-left') ||
            cardElement.classList.contains('slide-out-right') ||
            cardElement.classList.contains('slide-in-left') ||
            cardElement.classList.contains('slide-in-right')) {
            return;
        }

        const isFlipped = cardElement.classList.contains('is-flipped');

        // 1. Add Exit Class
        let exitClass = '';
        if (direction === 'next') {
            exitClass = isFlipped ? 'slide-out-left-flipped' : 'slide-out-left';
        } else {
            exitClass = isFlipped ? 'slide-out-right-flipped' : 'slide-out-right';
        }
        cardElement.classList.add(exitClass);

        // 2. Wait for exit animation
        setTimeout(() => {
            // 3. Change Content & Reset State
            if (direction === 'next') {
                currentIndex = (currentIndex < cards.length - 1) ? currentIndex + 1 : 0;
            } else {
                currentIndex = (currentIndex > 0) ? currentIndex - 1 : 0;
            }

            updateCardContent(currentIndex);

            // Disable transition temporarily to prevent "flying back" effect when removing is-flipped
            cardElement.style.transition = 'none';
            cardElement.classList.remove('is-flipped'); // Reset flip
            // Keep controls hidden until the enter animation or a fallback timeout finishes
            hideControlsUntilRevealed();
            cardElement.classList.remove(exitClass); // Remove exit class

            // Force reflow
            void cardElement.offsetWidth;

            // 4. Add Enter Class
            const enterClass = (direction === 'next') ? 'slide-in-right' : 'slide-in-left';
            cardElement.classList.add(enterClass);

            // Re-enable transition for next flip interaction
            // Wait for next frame or just clear inline style so CSS takes over
            requestAnimationFrame(() => {
                cardElement.style.transition = '';
            });

            // 5. Cleanup Enter Class
            setTimeout(() => {
                cardElement.classList.remove(enterClass);
            }, 300); // Animation duration

        }, 300); // Exit Animation duration
    }

    // 5. Event Listeners
    deckSelect.addEventListener('change', async () => {
        const val = deckSelect.value;
        let filename = 'questions-plongeeplaisir.md';
        let filterFn = null;

        if (val === 'pierre') {
            filename = 'questions-pierre.md';
        } else if (val === 'important') {
            filterFn = c => c.isImportant;
        }

        const deckCards = await loadDeckFromFile(filename);

        if (filterFn) {
            cards = deckCards.filter(filterFn);
        } else {
            cards = [...deckCards];
        }

        currentIndex = 0;
        updateCard();
    });

    cardIndexInput.addEventListener('change', () => {
        let val = parseInt(cardIndexInput.value);
        if (isNaN(val)) return;
        if (val < 1) val = 1;
        if (val > cards.length) val = cards.length;
        currentIndex = val - 1;
        updateCard();
    });

    cardElement.addEventListener('click', () => {
        toggleFlip();
    });

    function goNext() {
        if (currentIndex < cards.length - 1) {
            animateAndChange('next');
        } else {
            animateAndChange('next'); // Loop to start
        }
    }

    function goPrev() {
        if (currentIndex > 0) {
            animateAndChange('prev');
        }
    }

    // Buttons inside the card (may exist on both faces) — attach listeners by class

    document.querySelectorAll('.nextBtn').forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); goNext(); }));
    document.querySelectorAll('.prevBtn').forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); goPrev(); }));
    document.querySelectorAll('.randomBtn').forEach(b => b.addEventListener('click', (e) => {
        e.stopPropagation();
        if (cards.length <= 1) return;
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * cards.length);
        } while (newIndex === currentIndex);
        currentIndex = newIndex;
        updateCard();
    }));

    // Flip button(s)
    document.querySelectorAll('.flipBtn').forEach(b => b.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFlip();
    }));

    // Touch Support
    let touchStartX = 0;
    let touchStartY = 0;

    cardElement.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    cardElement.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        handleSwipeGesture(touchStartX, touchStartY, touchEndX, touchEndY);
    }, { passive: true });

    function handleSwipeGesture(startX, startY, endX, endY) {
        const diffX = endX - startX;
        const diffY = endY - startY;

        // Threshold for swipe (e.g. 50px) and check if horizontal swipe is dominant
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX < 0) {
                // Swipe Left -> Next
                goNext();
            } else {
                // Swipe Right -> Prev
                goPrev();
            }
        }
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
        // Don't trigger if user is typing in the jump-to-index input
        if (document.activeElement === cardIndexInput) return;

        switch (e.key) {
            case 'ArrowLeft':
                goPrev();
                break;
            case 'ArrowRight':
                goNext();
                break;
            case ' ':
                e.preventDefault(); // Prevent page scroll
                toggleFlip();
                break;
            case 'r':
            case 'R':
                toggleFlip();
                break;
            case '?':
                if (cards.length <= 1) return;
                let newIndex;
                do {
                    newIndex = Math.floor(Math.random() * cards.length);
                } while (newIndex === currentIndex);
                currentIndex = newIndex;
                updateCard();
                break;
        }
    });
}

// Initialize behind a simple password gate
(function () {
    // Store only the SHA-256 hash of the normalized password (lowercased + trimmed)
    const GATE_HASH = '70b50f3421e614638c69b7cd87aaf01f6614eb6a1479c3d6d64d8ed74ce72f69';
    const unlockedKey = 'unlocked_n3';

    const gate = document.getElementById('gate');
    const passwordInput = document.getElementById('passwordInput');
    const unlockBtn = document.getElementById('unlockBtn');
    const gateMessage = document.getElementById('gateMessage');

    function showGate() {
        document.body.classList.add('locked');
        if (gate) gate.style.display = 'flex';
        if (passwordInput) passwordInput.value = '';
        if (passwordInput) passwordInput.focus();
    }

    function hideGate() {
        document.body.classList.remove('locked');
        if (gate) gate.style.display = 'none';
    }

    // Compute SHA-256 hex digest of a string using Web Crypto API
    async function sha256Hex(str) {
        const data = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async function unlock() {
        const value = passwordInput ? (passwordInput.value || '') : '';
        const normalized = value.trim().toLowerCase();
        try {
            const hashHex = await sha256Hex(normalized);
            if (hashHex === GATE_HASH) {
                localStorage.setItem(unlockedKey, 'true');
                hideGate();
                initApp();
                return;
            }
        } catch (e) {
            console.error('Hashing failed', e);
        }

        if (gateMessage) gateMessage.innerText = 'Mot de passe incorrect.';
        if (passwordInput) passwordInput.value = '';
        if (passwordInput) passwordInput.focus();
        if (passwordInput) {
            passwordInput.classList.add('shake');
            setTimeout(() => passwordInput.classList.remove('shake'), 300);
        }
    }

    // If already unlocked, start app immediately
    if (localStorage.getItem(unlockedKey) === 'true') {
        hideGate();
        initApp();
    } else {
        showGate();
    }

    if (unlockBtn) unlockBtn.addEventListener('click', unlock);
    if (passwordInput) passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') unlock();
    });
})();
