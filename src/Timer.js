import { notify } from "./app.js";
let sound = document.getElementById("timerSound")
let start = document.getElementById("start")
export default class Timer extends HTMLElement {
  #intervalCallback;
  #intervalId = 0;

  constructor() {
    super();
    this.addEventListener("click", this);
    this.#intervalCallback = () => {
      const time = this.querySelector("time");
      const inputs = this.querySelectorAll("input");
      const intervals = Array.from(inputs, ({ value }) =>
        new Date(`1970-01-01T${value}Z`).getTime(),
      );
      const total = intervals.reduce((a, b) => a + b, 0);
      let ms;
      let remaining = new Date(new Date() - new Date(this.startTime)).getTime();
      if (remaining < total || this.loop) {
        remaining %= total;
        let i = 0;
        while (i < intervals.length && remaining > intervals[i]) {
          remaining -= intervals[i];
          i += 1;
        }
        sound.pause()
        sound.currentTime = 0
        ms = intervals[i] - remaining;
        inputs.forEach((input, j) => {
          input.classList.toggle("current-interval", i === j);
        });
      } else {
        clearInterval(this.#intervalId);
        sound.play()
        notify("Timer", "The timer is up")
        start.innerHTML = "<i class=\"fa-solid fa-play\"></i>"
        start.classList.remove("pause");
        start.classList.add("start")
      this.pause();
        this.#intervalId = 0;
        ms = 0;
        inputs.forEach((input) => {
          input.classList.remove("current-interval");
        });
      }

      time.dateTime = `PT${ms / 1000}S`;
      time.textContent = new Date(ms).toISOString().slice(11, 22);
    };
  }

  static get observedAttributes() {
    return ["paused", "start-time"];
  }

  get loop() {
    return this.hasAttribute("loop");
  }

  set loop(value) {
    this.toggleAttribute("loop", Boolean(value));
  }

  get paused() {
    return this.hasAttribute("paused");
  }

  set paused(value) {
    this.toggleAttribute("paused", Boolean(value));
  }

  get startTime() {
    return this.getAttribute("start-time");
  }

  set startTime(value) {
    this.setAttribute("start-time", value);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }

    if (
      (name === "paused" && newValue != null) ||
      (name === "start-time" && !newValue)
    ) {
      clearInterval(this.#intervalId);
      this.#intervalId = 0;
    } else if (name === "start-time" && newValue && !this.#intervalId) {
      this.#intervalId = setInterval(this.#intervalCallback, 10);
    }
  }

  disconnectedCallback() {
    clearInterval(this.#intervalId);
  }

  handleEvent(event) {
    Notification.requestPermission()
    const { classList } = event.target;
    if (classList.contains("loop")) {
      classList.add("no-loop")
      classList.remove("loop")
      event.target.innerHTML = "<i class=\"fa-solid fa-arrow-right\"></i>"
      this.loop = true;
    } else if (classList.contains("no-loop")) {
      classList.add("loop")
      classList.remove("no-loop")
      event.target.innerHTML = "<i class=\"fa-solid fa-repeat\"></i>"
      this.loop = false;
    } else if (classList.contains("pause")) {
      classList.add("start")
      classList.remove("pause")
      event.target.innerHTML = "<i class=\"fa-solid fa-play\"></i>"
      this.pause();
    } else if (classList.contains("restart")) {
      audio.removeAttribute("autoplay")
      this.restart();
    } else if (classList.contains("start")) {
      classList.add("pause")
      classList.remove("start")
      event.target.innerHTML = "<i class=\"fa-solid fa-stop\"></i>"
      this.start();
    }
  }

  pause() {
    this.paused = true;
  }

  restart() {
    const time = this.querySelector("time");
    time.dateTime = "PT0S";
    time.textContent = "00:00:00.00";
    this.paused = false;
    this.startTime = "";
  }

  start() {
    const time = this.querySelector("time");
    time.dateTime = time.dateTime || "PT0S";
    this.paused = false;
    if (this.startTime) {
      const inputs = this.querySelectorAll("input");
      const currentInput = this.querySelector(".current-interval");
      const intervals = Array.from(inputs, ({ value }) =>
        new Date(`1970-01-01T${value}Z`).getTime(),
      );
      const cumulativeTime = intervals
        .slice(0, [...inputs].indexOf(currentInput) + 1)
        .reduce((a, b) => a + b, 0);
      const ms = time.dateTime.match(/(\d+(:?\.\d+)?)S$/)[1] * 1000;
      this.startTime = new Date(new Date() - cumulativeTime + ms).toISOString();
    } else {
      this.startTime = new Date().toISOString();
    }
  }
}
