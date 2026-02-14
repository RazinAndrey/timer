import { Component, computed, signal } from '@angular/core';
import { FormField, form, submit } from '@angular/forms/signals';
import { RoundProgressComponent } from 'angular-svg-round-progressbar';
import { interval, Subscription, takeWhile } from 'rxjs';

interface Timer {
  hours: number;
  minutes: number;
  seconds: number;
}

@Component({
  selector: 'app-root',
  imports: [FormField, RoundProgressComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  timerModel = signal<Timer>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  timerForm = form(this.timerModel);

  currentValue = signal<number>(0); // сколько прошло
  totalSeconds = signal<number>(0); // сколько всего
  isRunning = signal<boolean>(false);

  private sub: Subscription | null = null;

  private audio = new Audio('./assets/notification.mp3');

  private runTimer() {
    this.isRunning.set(true);

    this.sub?.unsubscribe();

    this.sub = interval(1000)
      .pipe(takeWhile(() => this.currentValue() < this.totalSeconds()))
      .subscribe(() => {
        this.currentValue.update((v) => v + 1);

        if (this.currentValue() >= this.totalSeconds()) {
          this.audio.play();
          this.isRunning.set(false);
        }
      });
  }

  startTimer(event: Event) {
    event.preventDefault();

    submit(this.timerForm, async () => {
      const { hours, minutes, seconds } = this.timerModel();
      const total = hours * 3600 + minutes * 60 + seconds;

      this.currentValue.set(0);
      this.totalSeconds.set(total);

      this.runTimer();
    });
  }

  stopTimer() {
    this.isRunning.set(false);
    this.sub?.unsubscribe();
    this.sub = null;

    this.currentValue.set(0);
    this.totalSeconds.set(0);
  }

  pauseTimer() {
    this.isRunning.set(false);
    this.sub?.unsubscribe();
    this.sub = null;
  }

  resume() {
    this.runTimer();
  }

  formatTime(seconds: number): string {
    if (seconds < 0) seconds = 0;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  maskInput(field: keyof Timer, event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    let num = parseInt(value) || 0;

    switch (field) {
      case 'hours':
        if (num > 23) num = 23;
        break;
      case 'minutes':
      case 'seconds':
        if (num > 59) num = 59;
        break;
    }

    this.timerModel.update((timer) => ({ ...timer, [field]: num }));

    input.value = num.toString();
  }
}
