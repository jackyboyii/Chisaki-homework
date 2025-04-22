async function loadStudents() {
  const res = await fetch('./student-data.json');
  const data = await res.json();

  const studentContainer = document.getElementById('studentSelect');
  const assignmentList = document.getElementById('assignmentList');
  studentContainer.innerHTML = ''; // Clear old dropdown if any

  const studentList = document.createElement('ul');
  studentList.id = 'studentList';
  studentContainer.appendChild(studentList);

  Object.entries(data).forEach(([id, info]) => {
    const li = document.createElement('li');
    li.textContent = info.name;
    li.style.cursor = 'pointer';
    li.onclick = () => {
      displayAssignments(id, data, assignmentList);
    };
    studentList.appendChild(li);
  });

  createAssignmentInterface(data, studentContainer, assignmentList);
}

function displayAssignments(studentId, data, assignmentList) {
  const student = data[studentId];
  assignmentList.innerHTML = '';
  Object.entries(student.assignments).forEach(([key, assignment]) => {
    const li = document.createElement('li');
    li.textContent = `${key} – ${assignment.problems.join(', ')} (${assignment.status})`;
    assignmentList.appendChild(li);
  });
}

function createAssignmentInterface(data, select, assignmentList) {
  const assignDiv = document.createElement('div');
  assignDiv.style.marginTop = '2rem';

  const heading = document.createElement('h2');
  heading.textContent = 'Assign New Homework';
  assignDiv.appendChild(heading);

  const labelInput = document.createElement('input');
  labelInput.type = 'text';
  labelInput.placeholder = 'Enter assignment label or date';
  labelInput.style.marginRight = '1rem';
  assignDiv.appendChild(labelInput);

  const problemSelect = document.createElement('select');
  problemSelect.multiple = true;
  assignDiv.appendChild(problemSelect);

  fetch('./books/minna-no-nihongo-1.json')
    .then(res => res.json())
    .then(bookData => {
      const problems = Object.values(bookData.chapters).flatMap(ch => ch.problems);
      problems.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.id} - ${p.title}`;
        problemSelect.appendChild(opt);
      });
    });

  const assignButton = document.createElement('button');
  assignButton.textContent = 'Assign Homework';
  assignButton.style.display = 'block';
  assignButton.style.marginTop = '1rem';
  assignButton.onclick = () => {
    const studentList = document.getElementById('studentList');
    const selectedStudentLi = Array.from(studentList.children).find(li => li.style.fontWeight === 'bold');
    if (!selectedStudentLi) {
      alert('Please select a student.');
      return;
    }
    const studentName = selectedStudentLi.textContent;
    const studentId = Object.entries(data).find(([id, info]) => info.name === studentName)[0];
    const label = labelInput.value.trim();
    const selectedProblems = Array.from(problemSelect.selectedOptions).map(opt => opt.value);

    if (!label || selectedProblems.length === 0) {
      alert('Please enter a label and select at least one problem.');
      return;
    }

    if (!data[studentId].assignments[label]) {
      data[studentId].assignments[label] = {
        problems: selectedProblems,
        status: 'assigned'
      };
    }

    // Simulate save by logging updated data
    console.log('Updated student data:', data);

    // Refresh display
    displayAssignments(studentId, data, assignmentList);
    labelInput.value = '';
    problemSelect.selectedIndex = -1;
  };

  assignDiv.appendChild(assignButton);
  document.body.appendChild(assignDiv);
}
