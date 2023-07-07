import { useState, useRef } from "react";
import "./App.css";

const BreakSession = ({
  uniqueId,
  label,
  timeAmount,
  changeTime
}) => {
  return (
    <div id={uniqueId + "-label"} className='components'>
      <h3>{label}</h3>
      <p id={uniqueId + "-length"}>{timeAmount / 60}</p>
      <button
        onClick={() => {
          changeTime(60, uniqueId);
        }}
        className="buttons"
        id={uniqueId + "-increment"}
      >
        +
      </button>
      <button
        onClick={() => {
          changeTime(-60, uniqueId);
        }}
        className="buttons"
        id={uniqueId + "-decrement"}
      >
        -
      </button>
    </div>
  );
};

const App = () => {
  const audioRef = useRef(null);
  const [displayTime, setDisplayTime] = useState(25 * 60);
  const [breakAmount, setBreakAmount] = useState(5 * 60);
  const [sessionAmount, setSessionAmount] = useState(25 * 60);
  const [timerOn, setTimerOn] = useState(false);
  const [onBreak, setOnBreak] = useState(false);

  const playBreakSound = () => {
    audioRef.current.play();
  };

  const stopBreakSound = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes < 10 ? "0" + minutes : minutes}:${
      seconds < 10 ? "0" + seconds : seconds
    }`;
  };

  const changeTime = (amount, type) => {
    if (type == "break") {
      if ((breakAmount <= 60 && amount < 0) || breakAmount >= 60 * 60) {
        return;
      }
      setBreakAmount((prev) => prev + amount);
    } else {
      if ((sessionAmount <= 60 && amount < 0) || sessionAmount >= 60 * 60) {
        return;
      }
      setSessionAmount((prev) => prev + amount);
      if (!timerOn) {
        setDisplayTime(sessionAmount + amount);
      }
    }
  };

  const handleReset = () => {
    setSessionAmount(25 * 60);
    setBreakAmount(5 * 60);
    setDisplayTime(25 * 60);
    setOnBreak(false);
    if (timerOn) {
      clearInterval(localStorage.getItem("interval-id"));
      setTimerOn(!timerOn);
    }
  };

  const handleTimeChange = () => {
    let second = 1000;
    let date = new Date().getTime();
    let nextDate = new Date().getTime() + second;
    let onBreakVar = onBreak;
    if (!timerOn) {
      let interval = setInterval(() => {
        date = new Date().getTime();
        if (date > nextDate) {
          setDisplayTime((prev) => {
            if (prev <= 1) {
              playBreakSound();
            }
            if (prev <= 0 && !onBreakVar) {
              onBreakVar = true;
              setOnBreak(true);
              return breakAmount;
            } else if (prev <= 0 && onBreakVar) {
              onBreakVar = false;
              setOnBreak(false);
              return sessionAmount;
            }
            return prev - 1;
          });
          nextDate += second;
        }
      }, 30);
      localStorage.clear();
      localStorage.setItem("interval-id", interval);
    }
    if (timerOn) {
      clearInterval(localStorage.getItem("interval-id"));
    }
    setTimerOn(!timerOn);
  };

  return (
    <div className="container">
      <h1 id="header">Pomodoro Clock</h1>
      <div className="controls">
        <BreakSession
          uniqueId="break"
          label="Break"
          timeAmount={breakAmount}
          changeTime={changeTime}
          formatTime={formatTime}
        />
        <BreakSession
          uniqueId="session"
          label="Session"
          timeAmount={sessionAmount}
          changeTime={changeTime}
          formatTime={formatTime}
        />
      </div>
      <div className="components">
        <h3 id="timer-label">{onBreak ? "Break Countdown" : "Session Countdown"}</h3>
        <p id="time-left">{formatTime(displayTime)}</p>
        <div className='playReset'>
        <button className="buttons" id="start_stop" onClick={handleTimeChange}>
          ⏯️
        </button>
        <button
          className="buttons"
          id="reset"
          onClick={() => {
            handleReset();
            stopBreakSound();
          }}
        >
          🔄
        </button>
        </div>
        <audio
          ref={audioRef}
          id="beep"
          src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
        ></audio>
      </div>
    </div>
  );
};

export default App;

