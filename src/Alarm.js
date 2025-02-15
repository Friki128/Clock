import { notify } from "./app.js";
let sound = document.getElementById("alarmSound")
let notified = false
export default class Alarm extends HTMLElement {
  
  #intervalCallback;
  #intervalId = 0;

  constructor() {
    super();
    this.addEventListener("click", this);
    this.duration = 60 * 1000;
    this.#intervalCallback = () => {
      this.alarms.forEach((alarm) => {
        const { value } = alarm.querySelector("input");
        const date =
          new Date(value).getTime() ||
          new Date(`${new Date().toLocaleDateString()} ${value}`).getTime();
        if (date) {
          const delta = Date.now() - date;
          if (delta > 0 && delta < new Date(this.duration)) {
            alarm.setAttribute("ringing", "");
            sound.play()
            if(notified == false){
            notify("Alarm", "Your alarm for is ringing!!")
            notified = true  
          }
            return;
          }
        }
        sound.pause()
        sound.currentTime=0
        notified = false
        alarm.removeAttribute("ringing");
        
      });
    };
  }

  get alarms() {
    return [...this.querySelector(".items").children];
  }

  get duration() {
    return Number(this.getAttribute("duration"));
  }

  set duration(value) {
    this.setAttribute("duration", value);
  }

  add() {
    const alarm = this.querySelector("template").content.cloneNode(true);
    this.querySelector(".items").appendChild(alarm);
  }

  connectedCallback() {
    if (!this.#intervalId) {
      this.#intervalId = setInterval(this.#intervalCallback, 1000);
    }
  }

  delete(alarm) {
    this.querySelector(".items").removeChild(alarm);
  }

  disconnectedCallback() {
    clearInterval(this.#intervalId);
  }

  handleEvent(event) {
    Notification.requestPermission()
    const { target } = event;
    const { classList } = event.target;
    if (classList.contains("add")) {
      this.add();
    } else if (classList.contains("delete")) {
      this.delete(this.alarms.find((alarm) => alarm.contains(target)));
    } else if (classList.contains("pause")) {
      this.pause(this.alarms.find((alarm) => alarm.contains(target)));
      classList.add("start")
      classList.remove("pause")
      target.innerHTML = "<i class=\"fa-solid fa-play\"></i>"
      sound.pause()
      sound.currentTime = 0
    } else if (classList.contains("start")) {
      classList.add("pause")
      classList.remove("start")
      target.innerHTML = "<i class=\"fa-solid fa-stop\"></i>"
      this.start(this.alarms.find((alarm) => alarm.contains(target)));
    }
  }

  pause(alarm) {
    if (this.alarms.includes(alarm)) {
      alarm.setAttribute("paused", "");
      alarm.removeAttribute("ringing")
    }
  }

  start(alarm) {
    if (this.alarms.includes(alarm)) {
      alarm.removeAttribute("paused");
    }
  }
}
