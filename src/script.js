// --- POMODORO TIMER LOGIC ---
let timerId = null;
let timeLeft = 25 * 60; 
let initialTimeForSession = 25 * 60; 
let isPaused = true;

// Fitur 3: State Alarm & Modal
let alarmOscillator = null;
let audioCtx = null;
const alarmModal = document.getElementById('alarm-modal');
const btnModalOk = document.getElementById('btn-modal-ok');

// Fitur 2: State Antrian
let timerQueue = [];
let currentQueueItem = { label: "Belajar", minutes: 25 }; 

// DOM Elements
const timerDisplay = document.getElementById('timer-display');
const btnStart = document.getElementById('btn-start');
const btnPause = document.getElementById('btn-pause');
const btnReset = document.getElementById('btn-reset');
const btnTrash = document.getElementById('btn-trash');

const inputMinutes = document.getElementById('input-minutes');
const themeBtns = document.querySelectorAll('.theme-btn');
const btnAddQueue = document.getElementById('btn-add-queue');
const queueSection = document.getElementById('queue-section');
const queueList = document.getElementById('queue-list');

const btnMinimize = document.getElementById('btn-minimize');
const pomodoroSection = document.getElementById('pomodoro-section');
const iconMinimize = document.getElementById('icon-minimize');
const iconMaximize = document.getElementById('icon-maximize');

const miniCurrentTask = document.getElementById('mini-current-task');
const miniNextTask = document.getElementById('mini-next-task');
const customNameContainer = document.getElementById('custom-name-container');
const inputCustomName = document.getElementById('input-custom-name');
let activeThemeLabel = "Belajar";

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const displayStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    timerDisplay.textContent = displayStr;
    document.title = `${displayStr} - FokusAja`;
    
    const currentLabel = currentQueueItem ? currentQueueItem.label : 'Fokus';
    miniCurrentTask.textContent = `Saat ini: ${currentLabel}`;
    
    if (timerQueue.length > 0) {
        miniNextTask.textContent = `Berikutnya: ${timerQueue[0].label} (${timerQueue[0].minutes}m)`;
        miniNextTask.classList.remove('hidden');
    } else {
        miniNextTask.classList.add('hidden');
    }
}

// Fitur 3: Sistem Alarm Persisten (Web Audio API)
function startAlarm() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Buzzer sound using square wave
    alarmOscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    alarmOscillator.type = 'square';
    alarmOscillator.frequency.setValueAtTime(440, audioCtx.currentTime); 
    
    // Create a beeping effect
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    for (let i = 0; i < 60; i += 0.5) {
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + i);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + i + 0.25);
    }
    
    alarmOscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    alarmOscillator.start();
}

function stopAlarm() {
    if (alarmOscillator) {
        alarmOscillator.stop();
        alarmOscillator = null;
    }
}

function showAlarmModal() {
    alarmModal.classList.remove('hidden');
    setTimeout(() => {
        alarmModal.classList.remove('opacity-0');
        alarmModal.querySelector('div').classList.remove('scale-95');
    }, 10);
    startAlarm();
}

btnModalOk.addEventListener('click', () => {
    stopAlarm();
    alarmModal.classList.add('opacity-0');
    alarmModal.querySelector('div').classList.add('scale-95');
    setTimeout(() => {
        alarmModal.classList.add('hidden');
        startNextInQueue(); // Lanjut ke antrian berikutnya setelah OK
    }, 300);
});

function updateQueueUI() {
    if (timerQueue.length === 0) {
        queueSection.classList.add('hidden');
    } else {
        queueSection.classList.remove('hidden');
        queueList.innerHTML = '';
        timerQueue.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100';
            li.innerHTML = `
                <div class="flex items-center">
                    <span class="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-bold mr-3">${index + 1}</span>
                    <span class="font-medium text-gray-700">${item.label} (${item.minutes}m)</span>
                </div>
                <button onclick="removeFromQueue(${index})" class="text-gray-400 hover:text-red-500 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            `;
            queueList.appendChild(li);
        });
    }
    updateDisplay();
}

window.removeFromQueue = (index) => {
    timerQueue.splice(index, 1);
    updateQueueUI();
};

function startNextInQueue() {
    if (timerQueue.length > 0) {
        currentQueueItem = timerQueue.shift();
        timeLeft = currentQueueItem.minutes * 60;
        initialTimeForSession = timeLeft;
        updateQueueUI();
        startTimer();
    } else {
        currentQueueItem = null;
        const mins = parseInt(inputMinutes.value) || 25;
        timeLeft = mins * 60;
        initialTimeForSession = timeLeft;
        updateDisplay();
        alert('Semua antrian selesai!');
    }
}

themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        themeBtns.forEach(b => {
            b.classList.remove('bg-blue-600', 'text-white');
            b.classList.add('bg-gray-100', 'text-gray-600');
        });
        btn.classList.add('bg-blue-600', 'text-white');
        btn.classList.remove('bg-gray-100', 'text-gray-600');

        activeThemeLabel = btn.dataset.label;
        if (btn.dataset.time) {
            inputMinutes.value = btn.dataset.time;
        }

        if (activeThemeLabel === "Kustom") {
            customNameContainer.classList.remove('hidden');
        } else {
            customNameContainer.classList.add('hidden');
        }
    });
});

btnAddQueue.addEventListener('click', () => {
    const minutes = parseInt(inputMinutes.value) || 1;
    let label = activeThemeLabel;
    
    if (label === "Kustom") {
        label = inputCustomName.value.trim() || "Kustom";
    }
    
    timerQueue.push({ label, minutes });
    updateQueueUI();
    
    if (isPaused && !timerId && (!currentQueueItem || timeLeft === initialTimeForSession)) {
        if (timerQueue.length > 0 && !timerId) {
             const first = timerQueue.shift();
             currentQueueItem = first;
             timeLeft = first.minutes * 60;
             initialTimeForSession = timeLeft;
             updateQueueUI();
        }
    }
});

function startTimer() {
    if (timerId) clearInterval(timerId);
    isPaused = false;
    btnStart.classList.add('hidden');
    btnPause.classList.remove('hidden');

    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerId);
            timerId = null;
            isPaused = true;
            // Fitur 3: Tampilkan Modal & Alarm, jangan langsung lanjut
            showAlarmModal();
        }
    }, 1000);
}

btnStart.addEventListener('click', () => {
    if (!currentQueueItem || (isPaused && !timerId && timeLeft === initialTimeForSession && timerQueue.length === 0)) {
        const minutes = parseInt(inputMinutes.value) || 25;
        let label = activeThemeLabel;
        if (label === "Kustom") {
            label = inputCustomName.value.trim() || "Kustom";
        }
        currentQueueItem = { label, minutes };
        timeLeft = minutes * 60;
        initialTimeForSession = timeLeft;
    }
    
    startTimer();
    updateDisplay();
});

btnPause.addEventListener('click', () => {
    clearInterval(timerId);
    timerId = null;
    isPaused = true;
    btnStart.classList.remove('hidden');
    btnPause.classList.add('hidden');
});

btnReset.addEventListener('click', () => {
    clearInterval(timerId);
    timerId = null;
    isPaused = true;
    timeLeft = initialTimeForSession; 
    btnStart.classList.remove('hidden');
    btnPause.classList.add('hidden');
    updateDisplay();
});

btnTrash.addEventListener('click', () => {
    clearInterval(timerId);
    timerId = null;
    isPaused = true;
    btnStart.classList.remove('hidden');
    btnPause.classList.add('hidden');
    
    if (timerQueue.length > 0) {
        startNextInQueue();
    } else {
        currentQueueItem = null;
        const mins = parseInt(inputMinutes.value) || 25;
        timeLeft = mins * 60;
        initialTimeForSession = timeLeft;
        updateDisplay();
    }
});

btnMinimize.addEventListener('click', () => {
    pomodoroSection.classList.toggle('mini-mode');
    iconMinimize.classList.toggle('hidden');
    iconMaximize.classList.toggle('hidden');
});


// --- TO-DO LIST LOGIC ---
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

let todos = JSON.parse(localStorage.getItem('fokusaja-todos')) || [];

function saveTodos() {
    localStorage.setItem('fokusaja-todos', JSON.stringify(todos));
}

function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-transparent hover:border-blue-200 transition group';
        
        li.innerHTML = `
            <div class="flex items-center space-x-3">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                    class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    onchange="toggleTodo(${index})">
                <span class="${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'} font-medium transition">
                    ${todo.text}
                </span>
            </div>
            <button onclick="deleteTodo(${index})" class="text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1-1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
            </button>
        `;
        todoList.appendChild(li);
    });
}

todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text) {
        todos.push({ text, completed: false });
        todoInput.value = '';
        saveTodos();
        renderTodos();
    }
});

window.toggleTodo = (index) => {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
};

window.deleteTodo = (index) => {
    todos = todos.filter((_, i) => i !== index);
    saveTodos();
    renderTodos();
};


// --- FITUR 2: KALKULATOR & CATATAN (BARU) ---

// Kalkulator Logic
const calcDisplay = document.getElementById('calc-display');
let calcCurrent = '0';
let calcPrev = '';
let calcOpPending = null;

function updateCalc() {
    calcDisplay.textContent = calcCurrent;
}

window.calcNum = (num) => {
    if (calcCurrent === '0' && num !== '.') {
        calcCurrent = num;
    } else {
        calcCurrent += num;
    }
    updateCalc();
};

window.calcOp = (op) => {
    calcPrev = calcCurrent;
    calcCurrent = '0';
    calcOpPending = op;
    updateCalc();
};

window.calcClear = () => {
    calcCurrent = '0';
    calcPrev = '';
    calcOpPending = null;
    updateCalc();
};

window.calcEqual = () => {
    if (!calcOpPending) return;
    const a = parseFloat(calcPrev);
    const b = parseFloat(calcCurrent);
    let result = 0;
    switch (calcOpPending) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/': result = a / b; break;
    }
    calcCurrent = result.toString();
    calcOpPending = null;
    updateCalc();
};

// Scratchpad Logic
const scratchpad = document.getElementById('scratchpad');
scratchpad.value = localStorage.getItem('fokusaja-scratchpad') || '';

scratchpad.addEventListener('input', () => {
    localStorage.setItem('fokusaja-scratchpad', scratchpad.value);
});

// --- FITUR TOOLBOX TOGGLE (BARU) ---
window.toggleTool = (tool) => {
    const calcPanel = document.getElementById('panel-calc');
    const scratchPanel = document.getElementById('panel-scratch');
    const calcBtn = document.getElementById('btn-toolbox-calc');
    const scratchBtn = document.getElementById('btn-toolbox-scratch');

    if (tool === 'calc') {
        const isOpen = !calcPanel.classList.contains('hidden');
        
        // Tutup scratchpad (Mutually Exclusive)
        scratchPanel.classList.add('hidden', 'opacity-0', 'scale-95');
        scratchBtn.classList.remove('bg-blue-50', 'text-blue-600');
        scratchBtn.classList.add('text-gray-400');

        if (isOpen) {
            calcPanel.classList.add('hidden', 'opacity-0', 'scale-95');
            calcBtn.classList.remove('bg-blue-50', 'text-blue-600');
            calcBtn.classList.add('text-gray-400');
        } else {
            calcPanel.classList.remove('hidden');
            setTimeout(() => {
                calcPanel.classList.remove('opacity-0', 'scale-95');
            }, 10);
            calcBtn.classList.add('bg-blue-50', 'text-blue-600');
            calcBtn.classList.remove('text-gray-400');
        }
    } else if (tool === 'scratch') {
        const isOpen = !scratchPanel.classList.contains('hidden');
        
        // Tutup kalkulator (Mutually Exclusive)
        calcPanel.classList.add('hidden', 'opacity-0', 'scale-95');
        calcBtn.classList.remove('bg-blue-50', 'text-blue-600');
        calcBtn.classList.add('text-gray-400');

        if (isOpen) {
            scratchPanel.classList.add('hidden', 'opacity-0', 'scale-95');
            scratchBtn.classList.remove('bg-blue-50', 'text-blue-600');
            scratchBtn.classList.add('text-gray-400');
        } else {
            scratchPanel.classList.remove('hidden');
            setTimeout(() => {
                scratchPanel.classList.remove('opacity-0', 'scale-95');
            }, 10);
            scratchBtn.classList.add('bg-blue-50', 'text-blue-600');
            scratchBtn.classList.remove('text-gray-400');
        }
    }
};


// Initial Render
updateDisplay();
renderTodos();