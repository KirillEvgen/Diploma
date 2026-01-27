import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';

global.fetch = vi.fn();

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('инициализируется с null пользователем', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('загружает пользователя из localStorage при инициализации', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('email', 'test@example.com');
    
    const { result } = renderHook(() => useAuth());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.user).toEqual({
      email: 'test@example.com',
      token: 'test-token',
    });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('выполняет успешный вход', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: {
        get: vi.fn(() => 'application/json'),
      },
      text: async () => JSON.stringify({ token: 'new-token' }),
    };
    
    global.fetch.mockResolvedValueOnce(mockResponse);
    
    const { result } = renderHook(() => useAuth());
    
    let loginResult;
    await act(async () => {
      loginResult = await result.current.login('test@example.com', 'password123');
    });
    
    expect(loginResult.success).toBe(true);
    expect(localStorage.getItem('token')).toBe('new-token');
    expect(localStorage.getItem('email')).toBe('test@example.com');
    expect(result.current.user).toEqual({
      email: 'test@example.com',
      token: 'new-token',
    });
  });

  it('обрабатывает ошибку входа с неверным паролем', async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      headers: {
        get: vi.fn(() => 'application/json'),
      },
      text: async () => JSON.stringify({ message: 'Пароль введен неверно' }),
    };
    
    global.fetch.mockResolvedValueOnce(mockResponse);
    
    const { result } = renderHook(() => useAuth());
    
    let loginResult;
    await act(async () => {
      loginResult = await result.current.login('test@example.com', 'wrong-password');
    });
    
    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toBe('Пароль введен неверно');
    expect(result.current.user).toBeNull();
  });

  it('выполняет успешную регистрацию', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: {
        get: vi.fn(() => 'application/json'),
      },
      text: async () => JSON.stringify({}),
    };
    
    global.fetch.mockResolvedValueOnce(mockResponse);
    
    const { result } = renderHook(() => useAuth());
    
    let registerResult;
    await act(async () => {
      registerResult = await result.current.register('new@example.com', 'password123');
    });
    
    expect(registerResult.success).toBe(true);
  });

  it('обрабатывает ошибку регистрации', async () => {
    const mockResponse = {
      ok: false,
      status: 400,
      headers: {
        get: vi.fn(() => 'application/json'),
      },
      text: async () => JSON.stringify({ message: 'Данная почта уже используется' }),
    };
    
    global.fetch.mockResolvedValueOnce(mockResponse);
    
    const { result } = renderHook(() => useAuth());
    
    let registerResult;
    await act(async () => {
      registerResult = await result.current.register('existing@example.com', 'password123');
    });
    
    expect(registerResult.success).toBe(false);
    expect(registerResult.error).toBe('Данная почта уже используется');
  });

  it('выполняет выход из системы', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('email', 'test@example.com');
    
    const { result } = renderHook(() => useAuth());
    
    act(() => {
      result.current.logout();
    });
    
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('email')).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('обрабатывает сетевую ошибку при входе', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    
    const { result } = renderHook(() => useAuth());
    
    let loginResult;
    await act(async () => {
      loginResult = await result.current.login('test@example.com', 'password123');
    });
    
    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toBe('Ошибка сети. Проверьте подключение к интернету');
  });

  it('обрабатывает ошибку парсинга ответа при входе', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: {
        get: vi.fn(() => 'application/json'),
      },
      text: async () => '{ invalid json }',
    };
    
    global.fetch.mockResolvedValueOnce(mockResponse);
    
    const { result } = renderHook(() => useAuth());
    
    let loginResult;
    await act(async () => {
      loginResult = await result.current.login('test@example.com', 'password123');
    });
    
    expect(loginResult.success).toBe(false);
    expect(loginResult.error).toBeDefined();
  });

  it('обрабатывает пустой ответ при входе', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: {
        get: vi.fn(() => 'application/json'),
      },
      text: async () => '',
    };
    
    global.fetch.mockResolvedValueOnce(mockResponse);
    
    const { result } = renderHook(() => useAuth());
    
    let loginResult;
    await act(async () => {
      loginResult = await result.current.login('test@example.com', 'password123');
    });
    
    expect(loginResult.success).toBe(false);
  });
});


