async function initApp() {
    let cards = [];
    let currentIndex = 0;
    let showOnlyImportant = false;
    let allCards = [];

    const cardElement = document.getElementById('card');
    const frontText = document.getElementById('front-text');
    const backText = document.getElementById('back-text');
    const cardIndexInput = document.getElementById('cardIndexInput');
    const totalCardsSpan = document.getElementById('totalCards');

    // 1. Fetch the content
    try {
        const response = await fetch('questions.md');
        if (!response.ok) throw new Error('Failed to fetch questions.md');
        const rawText = await response.text();

        // 2. Parse the Markdown
        const sections = rawText.split(/^## /m).slice(1);
        cards = [];

        sections.forEach(sectionText => {
            const lines = sectionText.split('\n');
            const sectionTitle = lines[0].trim();
            const content = lines.slice(1).join('\n');

            const questionRegex = /\*\*(\d+)\.\s*([\s\S]*?)\*\*\s*\* \*\*Réponse :\s*\*\*([\s\S]*?)(?=\n\s*(?:\*\*\d+\.|#|---)|$)/g;

            let match;
            while ((match = questionRegex.exec(content)) !== null) {
                const fullQuestionLine = match[0];
                const question = match[2].trim();
                const answer = match[3].trim();
                const isImportant = fullQuestionLine.includes(' xx.');

                const parseMD = (txt) => {
                    return txt
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .split('\n')
                        .map(line => {
                            line = line.trim();
                            if (line.startsWith('* ')) {
                                return `• ${line.substring(2)}`;
                            }
                            return line;
                        })
                        .filter(l => l !== '')
                        .join('<br>');
                };

                allCards.push({
                    q: `<div style="font-size: 0.7em; opacity: 0.7; margin-bottom: 8px; text-transform: uppercase;">${sectionTitle}</div><div>${parseMD(question)}</div>`,
                    a: parseMD(answer),
                    isImportant: isImportant
                });
            }
        });

        cards = [...allCards];
        updateCard();
    } catch (error) {
        console.error('Error loading questions:', error);
        frontText.innerHTML = "Erreur lors du chargement des questions.";
    }

    // 4. Functions
    function updateCard() {
        if (cards.length === 0) return;

        // Reset flip state
        cardElement.classList.remove('is-flipped');

        // Wait a tiny bit to update text so user doesn't see it change while flipping back
        setTimeout(() => {
            const currentCard = cards[currentIndex];
            frontText.innerHTML = currentCard.q;
            backText.innerHTML = currentCard.a;

            if (currentCard.isImportant) {
                frontText.style.color = 'red';
                frontText.style.borderColor = 'red';
            } else {
                frontText.style.color = '';
                frontText.style.borderColor = '';
            }

            // Reset scroll position to top for both faces
            frontText.scrollTop = 0;
            backText.scrollTop = 0;

            cardIndexInput.value = currentIndex + 1;
            totalCardsSpan.innerText = cards.length;
        }, 200);
    }

    // 5. Event Listeners
    const filterBtn = document.getElementById('filterBtn');
    filterBtn.addEventListener('click', () => {
        showOnlyImportant = !showOnlyImportant;
        if (showOnlyImportant) {
            cards = allCards.filter(c => c.isImportant);
            filterBtn.innerText = "Toutes les questions";
            filterBtn.classList.add('active-filter');
        } else {
            cards = [...allCards];
            filterBtn.innerText = "Questions importantes";
            filterBtn.classList.remove('active-filter');
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
        cardElement.classList.toggle('is-flipped');
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (currentIndex < cards.length - 1) {
            currentIndex++;
            updateCard();
        } else {
            currentIndex = 0;
            updateCard();
        }
    });

    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCard();
        }
    });

    document.getElementById('randomBtn').addEventListener('click', () => {
        if (cards.length <= 1) return;
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * cards.length);
        } while (newIndex === currentIndex);
        currentIndex = newIndex;
        updateCard();
    });

    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    // Load saved theme
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeIcon.innerText = currentTheme === 'dark' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeIcon.innerText = theme === 'dark' ? '☀️' : '🌙';
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
        // Don't trigger if user is typing in the jump-to-index input
        if (document.activeElement === cardIndexInput) return;

        switch (e.key) {
            case 'ArrowLeft':
                if (currentIndex > 0) {
                    currentIndex--;
                    updateCard();
                }
                break;
            case 'ArrowRight':
                if (currentIndex < cards.length - 1) {
                    currentIndex++;
                    updateCard();
                } else {
                    currentIndex = 0;
                    updateCard();
                }
                break;
            case ' ':
                e.preventDefault(); // Prevent page scroll
                cardElement.classList.toggle('is-flipped');
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

// Initialize
initApp();
