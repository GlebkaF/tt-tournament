// Утилиты админ-авторизации для записи/правки результатов.
// Пароль хранится в localStorage и отправляется как Basic Auth (username "admin").
// Проверяется на сервере в /api/match против BASIC_AUTH_USERNAME/PASSWORD.

export const PASSWORD_LS_KEY = "auth_password";
const USERNAME = "admin";

export function getStoredPassword(): string | null {
  return localStorage.getItem(PASSWORD_LS_KEY);
}

export function savePassword(password: string): void {
  localStorage.setItem(PASSWORD_LS_KEY, password);
}

export function clearPassword(): void {
  localStorage.removeItem(PASSWORD_LS_KEY);
}

// Спрашивает пароль у пользователя, возвращает его или "" если ввод некорректен/отменён.
export function promptPassword(): string {
  const password = prompt("Введите пароль для авторизации:") ?? "";
  return password.match(/^[a-zA-Z0-9]+$/) ? password : "";
}

// Возвращает пароль из localStorage, либо запрашивает у пользователя.
// null — если пароля нет и пользователь его не ввёл.
export function ensurePassword(): string | null {
  return getStoredPassword() || promptPassword() || null;
}

export function authHeader(password: string): string {
  return `Basic ${btoa(`${USERNAME}:${password}`)}`;
}
