async function initApp() {
    let cards = [];
    let currentIndex = 0;

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
                const question = match[2].trim();
                const answer = match[3].trim();

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

                cards.push({
                    q: `<div style="font-size: 0.7em; opacity: 0.7; margin-bottom: 8px; text-transform: uppercase;">${sectionTitle}</div><div>${parseMD(question)}</div>`,
                    a: parseMD(answer)
                });
            }
        });

        updateCard();
    } catch (error) {
        console.error('Error loading questions:', error);
        frontText.innerHTML = "Error loading questions.";
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

            // Reset scroll position to top for both faces
            frontText.scrollTop = 0;
            backText.scrollTop = 0;

            cardIndexInput.value = currentIndex + 1;
            totalCardsSpan.innerText = cards.length;
        }, 200);
    }

    // 5. Event Listeners
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
}

// Initialize
initApp();
