// --- POMODORO TIMER LOGIC ---
let timerId = null;
let timeLeft = 25 * 60; 
let initialTimeForSession = 25 * 60; // Fitur 2: Simpan waktu awal sesi untuk Reset
let isPaused = true;

// Fitur 2: State Antrian
let timerQueue = [];
let currentQueueItem = { label: "Belajar", minutes: 25 }; // Default session

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

// Fitur 1: Pisahkan state display dengan input
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const displayStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    timerDisplay.textContent = displayStr;
    document.title = `${displayStr} - FokusAja`;
    
    // Fitur 4: Update Mini Mode Info
    const currentLabel = currentQueueItem ? currentQueueItem.label : 'Fokus';
    miniCurrentTask.textContent = `Saat ini: ${currentLabel}`;
    
    if (timerQueue.length > 0) {
        miniNextTask.textContent = `Berikutnya: ${timerQueue[0].label} (${timerQueue[0].minutes}m)`;
        miniNextTask.classList.remove('hidden');
    } else {
        miniNextTask.classList.add('hidden');
    }
}

function playNotificationSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); 
    oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5); 
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 1);
}

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
        // Reset ke nilai input jika antrian habis
        const mins = parseInt(inputMinutes.value) || 25;
        timeLeft = mins * 60;
        initialTimeForSession = timeLeft;
        updateDisplay();
        alert('Semua antrian selesai!');
    }
}

// Fitur 5: Tema & Kustom
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
    
    // Fitur 5: Logika Penamaan Kustom
    if (label === "Kustom") {
        label = inputCustomName.value.trim() || "Kustom";
    }
    
    timerQueue.push({ label, minutes });
    updateQueueUI();
    
    // Jika timer sedang kosong/berhenti, otomatis siapkan antrian pertama
    if (isPaused && !timerId && (!currentQueueItem || timeLeft === initialTimeForSession)) {
        // Jangan langsung start, hanya update display utama jika belum jalan
        if (timerQueue.length > 0 && !timerId) {
             // Opsional: Langsung ambil jika user ingin instan, tapi user minta update display besar saat "+"
             // Kita biarkan startNextInQueue dipicu oleh Start atau jika kita ingin update display besar sekarang:
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
            playNotificationSound();
            startNextInQueue();
        }
    }, 1000);
}

btnStart.addEventListener('click', () => {
    // Fitur 1: Ambil nilai input HANYA saat Mulai ditekan (jika belum ada item aktif)
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

// Fitur 2: Reset Sesi
btnReset.addEventListener('click', () => {
    clearInterval(timerId);
    timerId = null;
    isPaused = true;
    timeLeft = initialTimeForSession; // Kembali ke waktu awal sesi ini
    btnStart.classList.remove('hidden');
    btnPause.classList.add('hidden');
    updateDisplay();
});

// Fitur 2: Hapus (Trash)
btnTrash.addEventListener('click', () => {
    clearInterval(timerId);
    timerId = null;
    isPaused = true;
    btnStart.classList.remove('hidden');
    btnPause.classList.add('hidden');
    
    // Langsung pindah ke antrian berikutnya
    if (timerQueue.length > 0) {
        startNextInQueue();
    } else {
        // Jika antrian kosong, reset ke input
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

// Initial Render
updateDisplay();
renderTodos();