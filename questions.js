


document.addEventListener('DOMContentLoaded', () => {
  const bookSelect = document.getElementById('bookSelect');
  const questionList = document.getElementById('questionList');

  bookSelect.addEventListener('change', () => {
    const bookFile = bookSelect.value;
    fetch(bookFile)
      .then(res => res.json())
      .then(bookData => {
        questionList.innerHTML = '';
        Object.entries(bookData.chapters).forEach(([chapterNum, chapter]) => {
          chapter.problems.forEach(problem => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('problem');

            const title = document.createElement('h3');
            title.textContent = `${problem.id} – ${problem.title}`;
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
              const questionText = (q.text || "").replace(/\[\[blank\]\]/g, '_____');
              const question = document.createElement('p');
              question.textContent = `${i + 1}. ${questionText}`;
              wrapper.appendChild(question);
            });

            questionList.appendChild(wrapper);
          });
        });
      });
  });

  bookSelect.dispatchEvent(new Event('change'));
});