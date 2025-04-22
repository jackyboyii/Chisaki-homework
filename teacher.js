async function loadStudents() {
  const res = await fetch('student-data.json');
  const data = await res.json();
  const select = document.getElementById('studentSelect');
  const assignmentList = document.getElementById('assignmentList');

  // Populate dropdown
  Object.entries(data).forEach(([id, info]) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = info.name;
    select.appendChild(option);
  });

  // Update display on change
  select.onchange = () => {
    const student = data[select.value];
    assignmentList.innerHTML = '';
    Object.entries(student.assignments).forEach(([key, assignment]) => {
      const li = document.createElement('li');
      li.textContent = `${key} – ${assignment.problems.join(', ')} (${assignment.status})`;
      assignmentList.appendChild(li);
    });
  };

  // Trigger initial load
  select.dispatchEvent(new Event('change'));
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

  fetch('books/minna-no-nihongo-1.json')
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
    const studentId = select.value;
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
    select.dispatchEvent(new Event('change'));
    labelInput.value = '';
    problemSelect.selectedIndex = -1;
  };

  assignDiv.appendChild(assignButton);
  document.body.appendChild(assignDiv);
}

loadStudents = async function () {
  const res = await fetch('student-data.json');
  const data = await res.json();
  const select = document.getElementById('studentSelect');
  const assignmentList = document.getElementById('assignmentList');

  Object.entries(data).forEach(([id, info]) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = info.name;
    select.appendChild(option);
  });

  select.onchange = () => {
    const student = data[select.value];
    assignmentList.innerHTML = '';
    Object.entries(student.assignments).forEach(([key, assignment]) => {
      const li = document.createElement('li');
      li.textContent = `${key} – ${assignment.problems.join(', ')} (${assignment.status})`;
      assignmentList.appendChild(li);
    });
  };

  select.dispatchEvent(new Event('change'));
  createAssignmentInterface(data, select, assignmentList);
};
