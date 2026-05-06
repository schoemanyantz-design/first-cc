// 配置
const CONFIG = {
  workTime: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  circumference: 2 * Math.PI * 90 // 圆环周长
}

// 状态
let state = {
  timeLeft: CONFIG.workTime,
  isRunning: false,
  isWorkTime: true,
  pomodoroCount: 0,
  timerId: null
}

// DOM 元素
const elements = {
  timeDisplay: document.getElementById('timeDisplay'),
  statusDisplay: document.getElementById('statusDisplay'),
  progressRing: document.getElementById('progressRing'),
  pomodoroCount: document.getElementById('pomodoroCount'),
  startBtn: document.getElementById('startBtn'),
  resetBtn: document.getElementById('resetBtn'),
  skipBtn: document.getElementById('skipBtn'),
  closeBtn: document.getElementById('closeBtn'),
  container: document.querySelector('.container')
}

// 初始化圆环
elements.progressRing.style.strokeDasharray = CONFIG.circumference
elements.progressRing.style.strokeDashoffset = 0

// 格式化时间
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 更新显示
function updateDisplay() {
  elements.timeDisplay.textContent = formatTime(state.timeLeft)
  elements.pomodoroCount.textContent = state.pomodoroCount

  // 更新圆环进度
  const totalTime = state.isWorkTime ? CONFIG.workTime : (state.pomodoroCount % 4 === 0 ? CONFIG.longBreak : CONFIG.shortBreak)
  const progress = state.timeLeft / totalTime
  const offset = CONFIG.circumference * (1 - progress)
  elements.progressRing.style.strokeDashoffset = offset
}

// 播放提示音
function playAlarm() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
  oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.5)
}

// 更新状态样式
function updateStatusStyle() {
  elements.container.classList.remove('rest', 'long-rest')

  if (!state.isWorkTime) {
    if (state.pomodoroCount % 4 === 0) {
      elements.container.classList.add('long-rest')
      elements.statusDisplay.textContent = '长休息'
    } else {
      elements.container.classList.add('rest')
      elements.statusDisplay.textContent = '短休息'
    }
  } else {
    elements.statusDisplay.textContent = '工作中'
  }
}

// 计时完成
function timerComplete() {
  state.isRunning = false
  elements.startBtn.textContent = '开始'
  playAlarm()

  if (state.isWorkTime) {
    state.pomodoroCount++
    state.isWorkTime = false

    if (state.pomodoroCount % 4 === 0) {
      state.timeLeft = CONFIG.longBreak
    } else {
      state.timeLeft = CONFIG.shortBreak
    }
  } else {
    state.isWorkTime = true
    state.timeLeft = CONFIG.workTime
  }

  updateStatusStyle()
  updateDisplay()
}

// 倒计时
function countdown() {
  if (state.timeLeft > 0 && state.isRunning) {
    state.timeLeft--
    updateDisplay()
    state.timerId = setTimeout(countdown, 1000)
  } else if (state.timeLeft <= 0) {
    timerComplete()
  }
}

// 开始/暂停
function toggleTimer() {
  if (state.isRunning) {
    state.isRunning = false
    elements.startBtn.textContent = '继续'
    if (state.timerId) {
      clearTimeout(state.timerId)
    }
  } else {
    state.isRunning = true
    elements.startBtn.textContent = '暂停'
    countdown()
  }
}

// 重置
function resetTimer() {
  state.isRunning = false
  if (state.timerId) {
    clearTimeout(state.timerId)
  }
  state.timeLeft = CONFIG.workTime
  state.isWorkTime = true
  elements.startBtn.textContent = '开始'
  updateStatusStyle()
  updateDisplay()
}

// 跳过
function skipTimer() {
  if (state.timerId) {
    clearTimeout(state.timerId)
  }
  timerComplete()
}

// 事件绑定
elements.startBtn.addEventListener('click', toggleTimer)
elements.resetBtn.addEventListener('click', resetTimer)
elements.skipBtn.addEventListener('click', skipTimer)
elements.closeBtn.addEventListener('click', () => window.close())

// 初始显示
updateDisplay()
