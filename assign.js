let selectedStudentId = null;
let stagedProblems = [];
let studentData = {};
let selectedProblemsSet = new Set();

async function loadStudents() {
  const res = await fetch('./student-data.json');
  studentData = await res.json();

  const studentDropdown = document.getElementById('studentDropdown');
  Object.entries(studentData).forEach(([id, info]) => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = info.name;
    studentDropdown.appendChild(opt);
  });

  studentDropdown.onchange = () => {
    selectedStudentId = studentDropdown.value;
    if (selectedStudentId) {
      displayAssignments();
    }
  };
}

function displayAssignments() {
  const student = studentData[selectedStudentId];
  const tableBody = document.getElementById('assignmentList');
  tableBody.innerHTML = '';

  Object.entries(student.assignments).forEach(([label, assignment]) => {
    const row = document.createElement('tr');

    const subjectCell = document.createElement('td');
    subjectCell.textContent = label;
    row.appendChild(subjectCell);

    const dueDateCell = document.createElement('td');
    dueDateCell.textContent = assignment.dueDate || '';
    row.appendChild(dueDateCell);

    const problemCountCell = document.createElement('td');
    problemCountCell.textContent = assignment.problems.length;
    row.appendChild(problemCountCell);

    const completedCell = document.createElement('td');
    completedCell.innerHTML = assignment.completed ? '🟢' : '❌';
    row.appendChild(completedCell);

    const markedCell = document.createElement('td');
    markedCell.innerHTML = assignment.marked ? '✅' : '❌';
    row.appendChild(markedCell);

    const editCell = document.createElement('td');
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => {
      const assignment = student.assignments[label];
      stagedProblems = [...assignment.problems];
      document.getElementById('assignmentLabel').value = label;
      document.getElementById('assignmentDueDate').value = assignment.dueDate || '';
      selectedProblemsSet.clear();
      assignment.problems.forEach(p => selectedProblemsSet.add(p));
      document.getElementById('bookSelector').dispatchEvent(new Event('change'));
      updateSelectedProblemList();
    };
    editCell.appendChild(editBtn);
    row.appendChild(editCell);

    const markCell = document.createElement('td');
    const button = document.createElement('button');
    button.textContent = 'Mark';
    button.onclick = () => {
      window.location.href = `mark.html?student=${selectedStudentId}&assignment=${encodeURIComponent(label)}`;
    };
    markCell.appendChild(button);
    row.appendChild(markCell);

    const deleteCell = document.createElement('td');
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => {
      if (confirm(`Are you sure you want to delete "${label}"?`)) {
        delete student.assignments[label];
        displayAssignments();
      }
    };
    deleteCell.appendChild(deleteBtn);
    row.appendChild(deleteCell);

    tableBody.appendChild(row);
  });
}

function setupHomeworkBuilder() {
  const bookSelector = document.getElementById('bookSelector');
  const container = document.getElementById('problemSelectorContainer');
  const assignButton = document.getElementById('assignButton');
  const selectedList = document.getElementById('selectedProblemList');

  let currentProblems = [];

  bookSelector.onchange = () => {
    container.innerHTML = '';
    const bookFile = bookSelector.value;
    fetch(bookFile)
      .then(res => res.json())
      .then(bookData => {
        currentProblems = Object.values(bookData.chapters).flatMap(ch => ch.problems);
        currentProblems.forEach(p => {
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.value = p.id;
          checkbox.id = p.id;
          checkbox.checked = selectedProblemsSet.has(p.id);

          checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
              if (!selectedProblemsSet.has(p.id)) {
                selectedProblemsSet.add(p.id);
                stagedProblems.push(p.id);
              }
            } else {
              selectedProblemsSet.delete(p.id);
              stagedProblems = stagedProblems.filter(id => id !== p.id);
            }
            updateSelectedProblemList();
          });

          const checkboxWrapper = document.createElement('div');
          checkboxWrapper.className = 'checkbox-wrapper';
          checkboxWrapper.appendChild(checkbox);

          const labelWrapper = document.createElement('div');
          labelWrapper.className = 'label-wrapper';
          labelWrapper.textContent = `${p.id} - ${p.title}`;

          const div = document.createElement('div');
          div.className = 'problem-option';
          div.appendChild(checkboxWrapper);
          div.appendChild(labelWrapper);

          container.appendChild(div);
        });
      });
  };

  function updateSelectedProblemList() {
    selectedList.innerHTML = '';
    stagedProblems.forEach(problemId => {
      const li = document.createElement('li');
      li.textContent = problemId;
      selectedList.appendChild(li);
    });
  }

  assignButton.onclick = () => {
    if (!selectedStudentId) {
      alert('Select a student first.');
      return;
    }

    const label = document.getElementById('assignmentLabel').value.trim();
    const dueDate = document.getElementById('assignmentDueDate').value;

    if (!label || stagedProblems.length === 0) {
      alert('Provide a label and add at least one problem.');
      return;
    }

    studentData[selectedStudentId].assignments[label] = {
      problems: [...stagedProblems],
      dueDate,
      completed: false,
      marked: false
    };

    console.log('Assignment created:', studentData[selectedStudentId].assignments[label]);
    stagedProblems = [];
    selectedProblemsSet.clear();
    displayAssignments();
    document.getElementById('assignmentLabel').value = '';
    document.getElementById('assignmentDueDate').value = '';
    container.innerHTML = '';
    selectedList.innerHTML = '';
  };

  // Expose updateSelectedProblemList to be used in editBtn.onclick
  window.updateSelectedProblemList = updateSelectedProblemList;

  bookSelector.dispatchEvent(new Event('change'));
}

document.addEventListener('DOMContentLoaded', () => {
  loadStudents();
  setupHomeworkBuilder();
});