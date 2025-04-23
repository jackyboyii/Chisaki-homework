function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    studentId: params.get('student'),
    assignmentLabel: params.get('assignment')
  };
}

async function loadMarkingPage() {
  const { studentId, assignmentLabel } = getQueryParams();
  document.getElementById('assignmentName').textContent = assignmentLabel;

  const studentRes = await fetch('./student-data.json');
  const studentData = await studentRes.json();
  const student = studentData[studentId];
  document.getElementById('studentName').textContent = student?.name || 'Unknown';

  const assignment = student.assignments[assignmentLabel];
  const allBooks = ['books/minna-no-nihongo-1.json', 'books/genki-1.json'];

  let questions = [];

  for (const bookPath of allBooks) {
    const res = await fetch(bookPath);
    const book = await res.json();
    Object.values(book.chapters).forEach(chapter => {
      chapter.problems.forEach(problem => {
        if (assignment.problems.includes(problem.id)) {
          questions.push(problem);
        }
      });
    });
  }

  const answerRes = await fetch('./answerstemp.json');
  const answerData = await answerRes.json();
  const studentAnswers = (answerData[studentId] && answerData[studentId][assignmentLabel]) || [];

  const questionList = document.getElementById('questionReviewList');

  for (const problem of questions) {
    const wrapper = document.createElement('div');
    wrapper.style.marginBottom = '1.5rem';

    const title = document.createElement('h3');
    title.textContent = `${problem.id} – ${problem.title}`;
    wrapper.appendChild(title);

    if (problem.questions) {
      problem.questions.forEach((q, i) => {
        const qBlock = document.createElement('div');
        qBlock.style.border = '1px solid #ccc';
        qBlock.style.padding = '0.5rem';
        qBlock.style.marginBottom = '0.5rem';

        const qText = document.createElement('p');
        qText.innerHTML = `<strong>Q${i + 1}:</strong> ${(q.text || '').replace(/\[\[blank\]\]/g, '_____')}`;
        qBlock.appendChild(qText);

        const match = studentAnswers.find(
          a => a.problemId === problem.id && a.questionNumber === (i + 1).toString()
        );

        const studentAnswer = match?.studentAnswer || '[No answer]';
        const correctAnswer = Array.isArray(q.answer) ? q.answer.join(', ') : q.answer;
        const isCorrect = studentAnswer.trim() === correctAnswer;

        const answerP = document.createElement('p');
        answerP.innerHTML = `<strong>Student Answer:</strong> ${studentAnswer}`;
        qBlock.appendChild(answerP);

        const correctP = document.createElement('p');
        correctP.innerHTML = `<strong>Correct Answer:</strong> ${correctAnswer}`;
        qBlock.appendChild(correctP);

        const resultDiv = document.createElement('div');
        const correctBtn = document.createElement('button');
        const incorrectBtn = document.createElement('button');
        correctBtn.textContent = '⭕️ Correct';
        incorrectBtn.textContent = '❌ Incorrect';

        const answerIcon = document.createElement('span');
        answerIcon.style.marginLeft = '0.5rem';

        correctBtn.onclick = () => {
          answerIcon.textContent = '⭕️';
        };
        incorrectBtn.onclick = () => {
          answerIcon.textContent = '❌';
        };

        if (isCorrect) {
          answerIcon.textContent = '⭕️';
        }

        resultDiv.appendChild(correctBtn);
        resultDiv.appendChild(incorrectBtn);
        answerP.appendChild(answerIcon);
        qBlock.appendChild(resultDiv);

        const commentBtn = document.createElement('button');
        commentBtn.textContent = 'Add Comment';
        const commentBox = document.createElement('textarea');
        commentBox.placeholder = 'Enter comment...';
        commentBox.style.display = 'none';
        commentBox.rows = 2;
        commentBox.style.width = '100%';

        commentBtn.onclick = () => {
          commentBox.style.display = commentBox.style.display === 'none' ? 'block' : 'none';
        };

        qBlock.appendChild(commentBtn);
        qBlock.appendChild(commentBox);

        wrapper.appendChild(qBlock);
      });
    }

    questionList.appendChild(wrapper);
  }

  // Add Finish Marking button below overall feedback section
  const finishBtn = document.createElement('button');
  finishBtn.textContent = 'Finish Marking';
  finishBtn.style.marginTop = '1rem';
  finishBtn.onclick = () => {
    const { studentId, assignmentLabel } = getQueryParams();
    const feedback = document.getElementById('overallFeedback').value;
    const reviewBlocks = document.querySelectorAll('#questionReviewList > div');
    const result = [];

    reviewBlocks.forEach(block => {
      const title = block.querySelector('h3').textContent;
      const problemId = title.split(' – ')[0];
      const qDivs = block.querySelectorAll('div');

      qDivs.forEach((qDiv, index) => {
        const questionNumber = (index + 1).toString();
        const markedIcon = qDiv.querySelector('span')?.textContent || '';
        const comment = qDiv.querySelector('textarea')?.value || '';
        result.push({
          problemId,
          questionNumber,
          marked: markedIcon,
          comment
        });
      });
    });

    fetch('./markingtemp.json')
      .then(res => res.json())
      .then(data => {
        if (!data[studentId]) data[studentId] = {};
        data[studentId][assignmentLabel] = result;
        data[studentId][assignmentLabel + '_feedback'] = feedback;

        console.log('Saving to markingtemp.json:\n', JSON.stringify(data, null, 2));
        alert('Marking data collected. (This would be saved to markingtemp.json in a live environment)');
      });
  };
  document.body.appendChild(finishBtn);
}

document.addEventListener('DOMContentLoaded', loadMarkingPage);
