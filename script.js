let allTasks = [];
let valueInput = '';
let input = null;
let activeEditTask = null;

window.onload = async function init() {
  input = document.getElementById('add-task');
  input.addEventListener('change', updateValue);
  const resp = await fetch('http://localhost:8000/allTasks', {
    method: 'GET',
  });
  let result = await resp.json();
  allTasks = result.data;
  render();
};

onClickButton = async () => {
  allTasks.push({ text: valueInput, isCheck: false });
  const resp = await fetch('http://localhost:8000/createTask', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ text: valueInput, isCheck: false }),
  });
  let result = await resp.json();
  allTasks = result.data;
  valueInput = '';
  input.value = '';
  render();
};

updateValue = (event) => {
  valueInput = event.target.value;
};

render = () => {
  const content = document.getElementById('content-page');
  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }

  allTasks.sort((a, b) =>
    a.isCheck > b.isCheck ? 1 : a.isCheck < b.isCheck ? -1 : 0
  );

  allTasks.map((item, index) => {
    const container = document.createElement('div');
    container.id = `task-${index}`;
    container.className = 'task-container';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.isCheck;
    checkbox.onchange = function () {
      onChangeCheckbox(index);
    };
    container.appendChild(checkbox);

    if (index === activeEditTask) {
      const inputTask = document.createElement('input');
      inputTask.type = 'text';
      inputTask.value = item.text;
      inputTask.addEventListener('change', updateTaskText);
      inputTask.addEventListener('blur', doneEditTask);
      container.appendChild(inputTask);
    } else {
      const text = document.createElement('p');
      text.innerText = item.text;
      text.className = item.isCheck ? 'text-task done-text' : 'text-task';
      container.appendChild(text);
    }

    if (!item.isCheck) {
      if (index === activeEditTask) {
        const imageDone = document.createElement('img');
        imageDone.src = 'images/done.png';
        imageDone.onclick = function () {
          doneEditTask;
        };
        container.appendChild(imageDone);
      } else {
        const imageEdit = document.createElement('img');
        imageEdit.src = 'images/edit.jpg';
        imageEdit.onclick = function () {
          activeEditTask = index;
          render();
        };
        container.appendChild(imageEdit);
      }

      const imageDelete = document.createElement('img');
      imageDelete.src = 'images/remove.png';
      imageDelete.onclick = function () {
        onDeleteTask(index);
      };
      container.appendChild(imageDelete);
    }

    content.appendChild(container);
  });
};

onChangeCheckbox = async (index) => {
  allTasks[index].isCheck = !allTasks[index].isCheck;

  await fetch('http://localhost:8000/updateTask', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(allTasks[index]),
  });

  render();
};

onDeleteTask = async (index) => {
  const resp = await fetch(
    `http://localhost:8000/deleteTask?id=${allTasks[index].id}`,
    {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ text: valueInput, isCheck: false }),
    }
  );

  const { data } = await resp.json();
  allTasks = data;

  render();
};

updateTaskText = (event) => {
  allTasks[activeEditTask].text = event.target.value;

  render();
};

doneEditTask = async () => {
  await fetch(`http://localhost:8000/updateTask`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(allTasks[activeEditTask]),
  });

  activeEditTask = null;
  render();
};
