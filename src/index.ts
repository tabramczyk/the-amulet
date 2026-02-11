import { initApp } from './ui/app';

export function bootstrap(): void {
  const app = document.getElementById('app');
  if (!app) throw new Error('App root element not found');
  initApp(app);
}

document.addEventListener('DOMContentLoaded', bootstrap);
