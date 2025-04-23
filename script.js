const studentSlug = window.location.hash.replace(/^#/, "") || "demo";
const subHeading = document.getElementById('sub-heading');
const isStudent = studentSlug !== "demo";

if (!isStudent) {
  const bookSelect = document.createElement('select');
  bookSelect.innerHTML = `
    <option value="minna-no-nihongo-1.json">Minna no Nihongo 1</option>
    <option value="genki-1.json">Genki 1</option>
  `;
  bookSelect.onchange = loadQuiz;
  document.getElementById('controls').appendChild(bookSelect);
  window.bookSelect = bookSelect; // expose globally for use in loadQuiz
}

async function loadQuiz() {
  const bookFiles = {
    "minna-no-nihongo-1.json": await fetch('./books/minna-no-nihongo-1.json').then(res => res.json()),
    "genki-1.json": await fetch('./books/genki-1.json').then(res => res.json())
  };

  const [studentData, answerData, markData] = await Promise.all([
    fetch('./student-data.json').then(res => res.json()),
    fetch('./answerstemp.json').then(res => res.json()),
    fetch('./markingtemp.json').then(res => res.json()).catch(() => ({}))
  ]);

  const container = document.getElementById('questions');
  container.innerHTML = "";

  if (!isStudent) return; // Skip dashboard if not a student

  const studentAssignments = studentData[studentSlug]?.assignments || {};
  const sortedLabels = Object.keys(studentAssignments).sort().reverse();

  subHeading.textContent = `${studentData[studentSlug].name} Homework`;

  const messageEl = document.getElementById('assignment-message');
  if (sortedLabels.length === 0) {
    messageEl.textContent = "You currently have no homework assigned. Please check back later.";
  } else {
    messageEl.textContent = "";
  }

  sortedLabels.forEach(label => {
    const assignment = studentAssignments[label];
    const div = document.createElement('div');
    div.classList.add('assignment-tile');

    const title = document.createElement('h2');
    title.textContent = label;
    div.appendChild(title);

    const problemIds = assignment.problems || [];
    const isSubmitted = answerData[studentSlug]?.[label];
    const isMarked = markData[studentSlug]?.[label];

    const startBtn = document.createElement('button');
    startBtn.textContent = isSubmitted ? 'View' : 'Start';
    startBtn.disabled = isSubmitted && isMarked; // Disable button if already marked
    startBtn.onclick = () => {
      if (isSubmitted && isMarked) return; // Do nothing if already submitted and marked
      displayAssignment(problemIds, bookFiles, label, isSubmitted);
    };
    div.appendChild(startBtn);

    if (isMarked) {
      const markTag = document.createElement('span');
      markTag.textContent = ' ⭕️ Marked';
      markTag.style.marginLeft = '1rem';
      div.appendChild(markTag);
    }

    container.appendChild(div);
  });
}

function displayAssignment(problemIds, bookFiles, label, isSubmitted = false) {
  const container = document.getElementById('questions');
  container.innerHTML = '';
  const allProblems = Object.values(bookFiles).flatMap(book => Object.values(book.chapters).flatMap(ch => ch.problems));
  const selectedProblems = allProblems.filter(p => problemIds.includes(p.id));

  const header = document.createElement('h2');
  header.textContent = `Assignment: ${label}`;
  container.appendChild(header);

  selectedProblems.forEach(problem => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('problem');

    const title = document.createElement('h3');
    title.textContent = problem.title;
    wrapper.appendChild(title);

    if (problem.example) {
      const example = document.createElement('p');
      example.innerHTML = '<strong>例:</strong> ' + problem.example;
      wrapper.appendChild(example);
    }

    if (problem.audio) {
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.src = problem.audio;
      wrapper.appendChild(audio);
    }

    if (problem.image) {
      const img = document.createElement('img');
      img.src = problem.image;
      img.style.maxWidth = '100%';
      wrapper.appendChild(img);
    }

    problem.questions.forEach((q, i) => {
      const questionText = (q.text || "").replace(/\[\[blank\]\]/g, '<input type="text" />');
      const question = document.createElement('div');
      question.classList.add('question');
      question.innerHTML = `<p>${i + 1}. ${questionText}</p>`;
      wrapper.appendChild(question);
    });

    container.appendChild(wrapper);
  });

  if (!isSubmitted) {
    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Submit Answers';
    submitBtn.classList.add('submit-button');
    submitBtn.onclick = () => {
      const allInputs = container.querySelectorAll('input');
      const responses = [];
      let inputIndex = 0;

      selectedProblems.forEach(problem => {
        problem.questions.forEach((q, i) => {
          const inputElements = q.text.match(/\[\[blank\]\]/g) || [];
          const answers = [];
          inputElements.forEach(() => {
            const userInput = allInputs[inputIndex];
            answers.push(userInput.value.trim());
            inputIndex++;
          });
          responses.push({
            problemId: problem.id,
            questionNumber: (i + 1).toString(),
            studentAnswer: answers.join(', '),
            feedback: ''
          });
        });
      });

      fetch('./answerstemp.json')
        .then(res => res.json())
        .then(data => {
          if (!data[studentSlug]) data[studentSlug] = {};
          data[studentSlug][label] = responses;
          console.log('Student answers submitted:\n', JSON.stringify(data, null, 2));
          alert('Answers submitted! (Simulated saving to answerstemp.json)');
        });
    };
    container.appendChild(submitBtn);
  }
}