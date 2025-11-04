import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeSubject = new BehaviorSubject<boolean>(this.loadThemePreference());
  public darkMode$ = this.darkModeSubject.asObservable();

  constructor() {
    this.applyTheme(this.darkModeSubject.value);
  }

  private loadThemePreference(): boolean {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  }

  private saveThemePreference(isDark: boolean): void {
    localStorage.setItem('darkMode', JSON.stringify(isDark));
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  toggleDarkMode(): void {
    const newValue = !this.darkModeSubject.value;
    this.darkModeSubject.next(newValue);
    this.saveThemePreference(newValue);
    this.applyTheme(newValue);
  }

  isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }
}
