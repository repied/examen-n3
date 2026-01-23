async function initApp() {
    let cards = [];
    let currentIndex = 0;

    const cardElement = document.getElementById('card');
    const frontText = document.getElementById('front-text');
    const backText = document.getElementById('back-text');
    const progress = document.getElementById('progress');

    // 1. Fetch the content
    try {
        const response = await fetch('questions.md');
        if (!response.ok) throw new Error('Failed to fetch questions.md');
        const rawText = await response.text();

        // 2. Parse the Markdown
        cards = rawText.split('---').map(chunk => {
            const lines = chunk.trim().split('\n');
            const question = lines[0]; // First line is question
            const answer = lines.slice(1).join('<br>'); // Rest is answer

            // basic bold parser for **text**
            const parseBold = (txt) => txt.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

            return {
                q: parseBold(question.trim()),
                a: parseBold(answer.trim())
            };
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
            progress.innerText = `Card ${currentIndex + 1} of ${cards.length}`;
        }, 200);
    }

    // 5. Event Listeners
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
}

// Initialize
initApp();
