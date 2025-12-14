// Global state
let selectedConcepts = new Set();
let selectedParts = new Set();
let allQuestions = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let correctAnswers = [];

// Concept configuration
const conceptConfig = {
    1: { parts: 5, label: "Pediatria" }, // CHANGED from "Concept 1"
    2: { parts: 3, label: "Kirurgia" } // CHANGED from "Concept 2"
};

// DOM elements
const openingWindow = document.getElementById('openingWindow');
const testWindow = document.getElementById('testWindow');
const resultsWindow = document.getElementById('resultsWindow');
const partsContainer = document.getElementById('partsContainer');
const partsGrid = document.getElementById('partsGrid');
const conceptButtons = document.querySelectorAll('.concept-btn');
const selectAllBtn = document.getElementById('selectAllBtn');
const startBtn = document.getElementById('startBtn');
const limitQuestionsToggle = document.getElementById('limitQuestions');
const limitQuestions200Toggle = document.getElementById('limitQuestions200');
const limitQuestions500Toggle = document.getElementById('limitQuestions500');
const label100 = document.getElementById('label100');
const label200 = document.getElementById('label200');
const label500 = document.getElementById('label500');
const increaseLimitBtn = document.getElementById('increaseLimitBtn');
const decreaseLimitBtn = document.getElementById('decreaseLimitBtn');
const toggleContainer = document.getElementById('toggleContainer');
const darkModeToggle = document.getElementById('darkModeToggle');
const darkModeToggleTest = document.getElementById('darkModeToggleTest');
const nextBtn = document.getElementById('nextBtn');
const questionText = document.getElementById('questionText');
const answersContainer = document.getElementById('answersContainer');
const questionNumber = document.getElementById('questionNumber');
const progressFill = document.getElementById('progressFill');
const restartBtn = document.getElementById('restartBtn');
const correctCount = document.getElementById('correctCount');
const incorrectCount = document.getElementById('incorrectCount');
const totalCount = document.getElementById('totalCount');

// Dark mode functionality
function initDarkMode() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    updateDarkModeIcon(theme);
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateDarkModeIcon(newTheme);
}

function updateDarkModeIcon(theme) {
    const icons = document.querySelectorAll('.dark-mode-icon');
    icons.forEach(icon => {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    });
}

// Generate parts based on selected concepts
function generateParts() {
    partsGrid.innerHTML = '';
    selectedParts.clear();

    const partsToShow = new Set();
    selectedConcepts.forEach(concept => {
        const config = conceptConfig[concept];
        for (let i = 1; i <= config.parts; i++) {
            const partKey = `${concept}-${i}`;
            partsToShow.add(partKey);
        }
    });

    if (partsToShow.size === 0) {
        partsContainer.style.display = 'none';
        selectAllBtn.style.display = 'none';
        return;
    }

    partsContainer.style.display = 'block';
    selectAllBtn.style.display = 'block';

    // Group parts by concept
    const partsByConcept = {};
    partsToShow.forEach(partKey => {
        const [concept, part] = partKey.split('-');
        if (!partsByConcept[concept]) {
            partsByConcept[concept] = [];
        }
        partsByConcept[concept].push({ concept, part });
    });

    // Create parts grouped by concept
    Object.keys(partsByConcept).sort().forEach(concept => {
        const conceptParts = partsByConcept[concept];
        conceptParts.forEach(({ concept, part }) => {
            const partBtn = document.createElement('button');
            partBtn.className = 'part-btn';
            partBtn.dataset.concept = concept;
            partBtn.dataset.part = part;
            partBtn.dataset.partKey = `${concept}-${part}`;

            const partName = document.createElement('span');
            partName.className = 'part-name';
            // Use the updated concept label in the button text
            const conceptLabel = conceptConfig[concept].label;
            partName.textContent = `${conceptLabel} - Part ${part}`;

            const partQuestions = document.createElement('span');
            partQuestions.className = 'part-questions';

            // Logic for displaying the specific question counts
            if (concept === '1' && part === '5') {
                // Concept 1, Part 5: 78 sual (CHANGED from 100 sual)
                partQuestions.textContent = '78 sual';
            } else if (concept === '2' && part === '3') {
                // Concept 2, Part 3: 49 sual (CHANGED from 100 sual)
                partQuestions.textContent = '49 sual';
            } else if (concept === '1' && part <= '4') {
                // Concept 1, Parts 1-4: 100 sual (assuming default for others in C1)
                partQuestions.textContent = '100 sual';
            } else if (concept === '2' && part <= '2') {
                // Concept 2, Parts 1-2: 100 sual (assuming default for others in C2)
                partQuestions.textContent = '100 sual';
            } else {
                partQuestions.textContent = 'sual';
            }

            // OLD CODE:
            // partQuestions.textContent = concept === '1' && part <= '5' ? '100 sual' : 
            //                                  concept === '2' && part <= '3' ? '100 sual' : 'sual';

            partBtn.appendChild(partName);
            partBtn.appendChild(partQuestions);

            partBtn.addEventListener('click', () => {
                const partKey = partBtn.dataset.partKey;
                if (selectedParts.has(partKey)) {
                    selectedParts.delete(partKey);
                    partBtn.classList.remove('selected');
                } else {
                    selectedParts.add(partKey);
                    partBtn.classList.add('selected');
                }
                updateStartButton();
                updateToggleVisibility();
            });

            partsGrid.appendChild(partBtn);
        });
    });

    updateStartButton();
    updateToggleVisibility();
}

// Concept selection
conceptButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const concept = btn.dataset.concept;
        if (selectedConcepts.has(concept)) {
            selectedConcepts.delete(concept);
            btn.classList.remove('selected');
        } else {
            selectedConcepts.add(concept);
            btn.classList.add('selected');
        }
        generateParts();
    });
});

// Select all parts
selectAllBtn.addEventListener('click', () => {
    const allPartButtons = document.querySelectorAll('.part-btn');
    const allSelected = allPartButtons.length > 0 &&
        Array.from(allPartButtons).every(btn => selectedParts.has(btn.dataset.partKey));

    if (allSelected) {
        selectedParts.clear();
        allPartButtons.forEach(btn => btn.classList.remove('selected'));
    } else {
        selectedParts.clear();
        allPartButtons.forEach(btn => {
            const partKey = btn.dataset.partKey;
            selectedParts.add(partKey);
            btn.classList.add('selected');
        });
    }
    updateStartButton();
    updateToggleVisibility();
});

function updateStartButton() {
    startBtn.disabled = selectedParts.size === 0;
    const allPartButtons = document.querySelectorAll('.part-btn');
    const totalParts = allPartButtons.length;
    selectAllBtn.textContent = selectedParts.size === totalParts && totalParts > 0 ? 'Hamsını seç' : 'Hamsını seç';
}



// Limit Configuration
let currentLimit = 100;

function updateLimitLabels(activeToggle) {
    // Reset labels
    label100.textContent = '100 suala limitle';
    label200.textContent = '200 suala limitle';
    label500.textContent = '500 suala limitle';

    if (activeToggle && activeToggle.checked) {
        if (activeToggle === limitQuestionsToggle) label100.textContent = `${currentLimit} suala limitle`;
        if (activeToggle === limitQuestions200Toggle) label200.textContent = `${currentLimit} suala limitle`;
        if (activeToggle === limitQuestions500Toggle) label500.textContent = `${currentLimit} suala limitle`;
    }
}

function handleLimitToggle(toggle, baseLimit) {
    if (toggle.checked) {
        currentLimit = baseLimit;
        // Uncheck others
        [limitQuestionsToggle, limitQuestions200Toggle, limitQuestions500Toggle].forEach(t => {
            if (t !== toggle) t.checked = false;
        });
        updateLimitLabels(toggle);
    } else {
        updateLimitLabels(null);
    }
}

limitQuestionsToggle.addEventListener('change', () => handleLimitToggle(limitQuestionsToggle, 100));
limitQuestions200Toggle.addEventListener('change', () => handleLimitToggle(limitQuestions200Toggle, 200));
limitQuestions500Toggle.addEventListener('change', () => handleLimitToggle(limitQuestions500Toggle, 500));

increaseLimitBtn.addEventListener('click', () => {
    currentLimit += 50;
    const activeToggle = [limitQuestionsToggle, limitQuestions200Toggle, limitQuestions500Toggle].find(t => t.checked);
    if (activeToggle) {
        updateLimitLabels(activeToggle);
    } else {
        // Build behavior: if none checked, check 100
        limitQuestionsToggle.checked = true;
        updateLimitLabels(limitQuestionsToggle);
    }
});

decreaseLimitBtn.addEventListener('click', () => {
    if (currentLimit > 50) currentLimit -= 50;
    const activeToggle = [limitQuestionsToggle, limitQuestions200Toggle, limitQuestions500Toggle].find(t => t.checked);
    if (activeToggle) {
        updateLimitLabels(activeToggle);
    } else {
        limitQuestionsToggle.checked = true;
        updateLimitLabels(limitQuestionsToggle);
    }
});

function updateToggleVisibility() {
    if (selectedParts.size > 1) {
        toggleContainer.style.display = 'block';
    } else {
        toggleContainer.style.display = 'none';
        limitQuestionsToggle.checked = false;
        limitQuestions200Toggle.checked = false;
        limitQuestions500Toggle.checked = false;
        updateLimitLabels(null);
    }
}

// Load questions from test files
async function loadQuestions() {
    allQuestions = [];
    const loadPromises = Array.from(selectedParts).map(async (partKey) => {
        const [concept, part] = partKey.split('-');
        try {
            // Try loading with concept prefix first: concept1part1.js, concept2part1.js, etc.
            let response = await fetch(`concept${concept}part${part}.js`);
            if (!response.ok) {
                // Try test concept-part format: test1-1.js
                response = await fetch(`test${concept}-${part}.js`);
            }
            if (!response.ok) {
                // Try just test number based on part position
                let testNumber = part;
                if (concept === '2') {
                    // Concept 2 parts continue from concept 1 (6, 7, 8)
                    testNumber = String(5 + parseInt(part));
                }
                response = await fetch(`test${testNumber}.js`);
            }
            if (!response.ok) {
                response = await fetch(`test${testNumber}.json`);
            }
            if (!response.ok) {
                response = await fetch(`part${testNumber}.json`);
            }
            if (!response.ok) throw new Error(`Failed to load concept${concept}part${part}.js`);

            const text = await response.text();
            let data;

            try {
                data = JSON.parse(text);
            } catch (e) {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    data = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('Could not parse file as JSON');
                }
            }

            const questions = Array.isArray(data) ? data : (data.questions || []);

            const questionsWithPart = questions.map(q => {
                return {
                    question: q.question,
                    options: q.options || q.answers || [],
                    correct_answer: q.correct_answer || q.correct,
                    concept: concept,
                    part: part,
                    partKey: partKey
                };
            });
            return questionsWithPart;
        } catch (error) {
            console.error(`Error loading concept${concept}part${part}.js:`, error);
            return [];
        }
    });

    const questionArrays = await Promise.all(loadPromises);
    allQuestions = questionArrays.flat();
}

// Shuffle array function
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Start test
startBtn.addEventListener('click', async () => {
    if (selectedParts.size === 0) return;

    await loadQuestions();

    currentQuestions = shuffleArray(allQuestions);

    if (selectedParts.size > 1) {
        const isLimited = limitQuestionsToggle.checked || limitQuestions200Toggle.checked || limitQuestions500Toggle.checked;
        if (isLimited) {
            currentQuestions = currentQuestions.slice(0, currentLimit);
        }
    }

    currentQuestionIndex = 0;
    userAnswers = [];
    correctAnswers = [];

    openingWindow.classList.remove('active');
    testWindow.classList.add('active');

    displayQuestion();
});

// Display question
function displayQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        showResults();
        return;
    }

    const question = currentQuestions[currentQuestionIndex];
    questionText.textContent = question.question;
    questionNumber.textContent = `Question ${currentQuestionIndex + 1} of ${currentQuestions.length}`;

    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    progressFill.style.width = `${progress}%`;

    answersContainer.innerHTML = '';

    const options = question.options || question.answers || [];

    options.forEach((option) => {
        const answerBtn = document.createElement('button');
        answerBtn.className = 'answer-btn';
        answerBtn.textContent = option;
        answerBtn.dataset.answer = option;
        const correctAnswer = question.correct_answer || question.correct;
        answerBtn.addEventListener('click', () => selectAnswer(option, correctAnswer));
        answersContainer.appendChild(answerBtn);
    });

    nextBtn.disabled = true;
    nextBtn.style.display = 'none';
}

// Select answer
function selectAnswer(selectedAnswer, correctAnswer) {
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn => {
        btn.classList.add('answered');
        btn.disabled = true;

        if (btn.dataset.answer === correctAnswer) {
            btn.classList.add('correct');
        } else if (btn.dataset.answer === selectedAnswer && selectedAnswer !== correctAnswer) {
            btn.classList.add('incorrect');
        }
    });

    userAnswers.push(selectedAnswer);
    correctAnswers.push(correctAnswer);

    nextBtn.disabled = false;
    nextBtn.style.display = 'block';
}

// Next question
nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    displayQuestion();
});

// Show results
function showResults() {
    let correct = 0;
    let incorrect = 0;

    for (let i = 0; i < userAnswers.length; i++) {
        if (userAnswers[i] === correctAnswers[i]) {
            correct++;
        } else {
            incorrect++;
        }
    }

    correctCount.textContent = correct;
    incorrectCount.textContent = incorrect;
    totalCount.textContent = userAnswers.length;

    testWindow.classList.remove('active');
    resultsWindow.classList.add('active');
}

// Restart
restartBtn.addEventListener('click', () => {
    selectedConcepts.clear();
    selectedParts.clear();
    conceptButtons.forEach(btn => btn.classList.remove('selected'));
    partsContainer.style.display = 'none';
    selectAllBtn.style.display = 'none';
    updateStartButton();
    updateToggleVisibility();
    limitQuestionsToggle.checked = false;
    limitQuestions200Toggle.checked = false;
    limitQuestions500Toggle.checked = false;

    resultsWindow.classList.remove('active');
    openingWindow.classList.add('active');
});

// Dark mode toggles
darkModeToggle.addEventListener('click', toggleDarkMode);
darkModeToggleTest.addEventListener('click', toggleDarkMode);

// Initialize
initDarkMode();
updateStartButton();
