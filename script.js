const bookSelect = document.createElement('select');
const path = window.location.pathname;
const studentSlug = path.substring(path.lastIndexOf('/') + 1);

bookSelect.innerHTML = `
  <option value="minna-no-nihongo-1.json">Minna no Nihongo 1</option>
  <option value="genki-1.json">Genki 1</option>
`;
bookSelect.onchange = loadQuiz;
document.body.insertBefore(bookSelect, document.getElementById('quiz-container'));

async function loadQuiz() {
  const bookFile = 'books/' + bookSelect.value;

  const [studentData, bookData] = await Promise.all([
    fetch('student-data.json').then(res => res.json()),
    fetch(bookFile).then(res => res.json())
  ]);

  const questionIds = studentData[studentSlug];
  const container = document.getElementById('questions');

  const problems = Object.values(bookData.chapters).flatMap(ch => ch.problems);
  const selectedProblems = questionIds
    ? problems.filter(p => questionIds.includes(p.id))
    : problems;

  selectedProblems.forEach(problem => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('problem');

    const title = document.createElement('h2');
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
}
loadQuiz();