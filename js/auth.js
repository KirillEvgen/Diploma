// API Base URL
// Согласно документации: https://github.com/GlebkaF/webdev-hw-api/tree/main/pages/api/fitness
// В Next.js структура pages/api/fitness/auth/register.ts доступна по /api/fitness/auth/register
const API_BASE_URL = 'https://webdev-hw-api.vercel.app/api/fitness';

// Message texts from design
const ERROR_MESSAGES = {
    loginIncorrect: 'Пароль введен неверно, попробуйте еще раз.',
    emailExists: 'Данная почта уже используется. Попробуйте войти.',
    generic: 'Произошла ошибка. Попробуйте еще раз.'
};

// Modal elements
const authModal = document.getElementById('authModal');
const openAuthModalBtn = document.getElementById('openAuthModal');
const closeAuthModalBtn = document.getElementById('closeAuthModal');

// Form elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const switchToRegisterBtn = document.getElementById('switchToRegister');
const switchToLoginBtn = document.getElementById('switchToLogin');

// Error elements
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

// Open modal
openAuthModalBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (authModal) {
        authModal.classList.add('auth-modal--visible');
        document.body.style.overflow = 'hidden';
        // Show login form by default
        if (loginForm) loginForm.style.display = 'flex';
        if (registerForm) registerForm.style.display = 'none';
        clearErrors();
    }
});

// Close modal
closeAuthModalBtn?.addEventListener('click', () => {
    authModal?.classList.remove('auth-modal--visible');
    document.body.style.overflow = '';
    clearErrors();
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal?.classList.contains('auth-modal--visible')) {
        authModal.classList.remove('auth-modal--visible');
        document.body.style.overflow = '';
        clearErrors();
    }
});

// Switch between forms
switchToRegisterBtn?.addEventListener('click', () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'flex';
    clearErrors();
});

switchToLoginBtn?.addEventListener('click', () => {
    registerForm.style.display = 'none';
    loginForm.style.display = 'flex';
    clearErrors();
});

// Clear errors
function clearErrors() {
    if (loginError) {
        loginError.textContent = '';
        loginError.classList.remove('auth-form__error--visible');
    }
    if (registerError) {
        registerError.textContent = '';
        registerError.classList.remove('auth-form__error--visible');
    }
    
    // Remove error classes from inputs
    document.querySelectorAll('.auth-form__input--error').forEach(input => {
        input.classList.remove('auth-form__input--error');
    });
}

// Show error
function showError(errorElement, message, inputElement = null) {
    if (!errorElement) return;
    
    errorElement.textContent = message;
    errorElement.classList.add('auth-form__error--visible');
    
    if (inputElement) {
        inputElement.classList.add('auth-form__input--error');
        // Scroll to error field
        inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Login form submission
loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    
    const email = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const emailInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    
    // Валидация email
    if (!email || !email.includes('@')) {
        showError(loginError, 'Введите корректное электронное письмо', emailInput);
        return;
    }
    
    try {
        // Используем полный путь согласно документации API
        const url = 'https://webdev-hw-api.vercel.app/api/fitness/auth/login';
        console.log('Logging in to:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        console.log('Login response status:', response.status, response.statusText);
        
        let data = null;
        
        // Пытаемся прочитать ответ как JSON или текст
        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const text = await response.text();
                if (text) {
                    data = JSON.parse(text);
                }
            } else {
                const text = await response.text();
                console.error('Login response (non-JSON):', text);
                if (text) {
                    try {
                        data = JSON.parse(text);
                    } catch (e) {
                        // Если не JSON, создаем объект с сообщением
                        data = { message: text || ERROR_MESSAGES.generic };
                    }
                }
            }
        } catch (parseError) {
            console.error('Failed to parse response:', parseError);
            data = { message: ERROR_MESSAGES.generic };
        }
        
        if (response.ok) {
            // Сохраняем токен
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            localStorage.setItem('email', email);
            
            // Закрываем модальное окно
            authModal?.classList.remove('auth-modal--visible');
            document.body.style.overflow = '';
            
            // Обновляем кнопку в хедере
            updateHeaderButton();
            
            // Перезагружаем страницу для обновления состояния
            window.location.reload();
        } else {
            // Показываем ошибку
            let errorMessage = ERROR_MESSAGES.loginIncorrect;
            
            if (data && data.message) {
                errorMessage = data.message;
            } else if (data && data.error) {
                errorMessage = data.error;
            }
            
            showError(loginError, errorMessage, passwordInput);
            // Заполняем поле email введенным значением
            if (email) {
                emailInput.value = email;
            }
        }
    } catch (error) {
        console.error('Login request failed:', error);
        showError(loginError, ERROR_MESSAGES.generic, passwordInput);
    }
});

// Валидация пароля
function validatePassword(password) {
    const errors = [];
    
    if (password.length < 6) {
        errors.push('Пароль должен содержать не менее 6 символов');
    }
    
    // Проверка на спецсимволы (не менее 2)
    const specialChars = password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g);
    if (!specialChars || specialChars.length < 2) {
        errors.push('Пароль должен содержать не менее 2 спецсимволов');
    }
    
    // Проверка на заглавную букву
    if (!/[A-ZА-Я]/.test(password)) {
        errors.push('Пароль должен содержать как минимум одну заглавную букву');
    }
    
    return errors;
}

// Register form submission
registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    const emailInput = document.getElementById('registerEmail');
    const passwordInput = document.getElementById('registerPassword');
    const passwordConfirmInput = document.getElementById('registerPasswordConfirm');
    
    // Проверка совпадения паролей
    if (password !== passwordConfirm) {
        showError(registerError, 'Пароли не совпадают.', passwordConfirmInput);
        return;
    }
    
    try {
        // Используем правильный endpoint для регистрации (согласованный со структурой логина)
        const url = 'https://webdev-hw-api.vercel.app/api/fitness/users';
        console.log('Registering to:', url);
        console.log('Request body:', { email, password: '***' });
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        console.log('Register response status:', response.status, response.statusText);
        
        // Читаем ответ один раз и сохраняем
        let responseText = '';
        let data = null;
        
        try {
            responseText = await response.text();
            if (responseText) {
                try {
                    data = JSON.parse(responseText);
                } catch (e) {
                    // Если не JSON, создаем объект с сообщением
                    data = { message: responseText || ERROR_MESSAGES.generic };
                }
            }
        } catch (parseError) {
            console.error('Failed to parse response:', parseError);
            data = { message: ERROR_MESSAGES.generic };
        }
        
        // Если получили 405 или 404, значит URL или метод неправильный
        if (response.status === 405 || response.status === 404) {
            console.error(`${response.status} Error response body:`, responseText);
            console.error('Response headers:', Object.fromEntries(response.headers.entries()));
            
            let errorMsg = `Ошибка ${response.status}: Сервер не может обработать запрос. `;
            if (response.status === 405) {
                errorMsg += 'Метод не разрешен. ';
            } else if (response.status === 404) {
                errorMsg += 'Эндпоинт не найден. ';
            }
            errorMsg += `Проверьте правильность URL эндпоинта API или обратитесь к документации.`;
            
            showError(registerError, errorMsg, emailInput);
            return;
        }
        
        if (response.ok) {
            // При успешной регистрации нужно войти, чтобы получить токен
            // Показываем сообщение об успехе и переключаемся на форму входа
            alert('Регистрация прошла успешно! Теперь войдите в систему.');
            registerForm.style.display = 'none';
            loginForm.style.display = 'flex';
            // Заполняем поле email в форме входа
            document.getElementById('loginUsername').value = email;
        } else {
            // Показываем ошибку
            let errorMessage = ERROR_MESSAGES.generic;
            
            if (data && data.message) {
                errorMessage = data.message;
            } else if (data && data.error) {
                errorMessage = data.error;
            }
            
            // Определяем, к какому полю относится ошибка
            let targetInput = emailInput;
            if (errorMessage.includes('пароль') || errorMessage.includes('Пароль')) {
                targetInput = passwordInput;
            } else if (errorMessage.includes('почта') || errorMessage.includes('почтой') || errorMessage.includes('email')) {
                targetInput = emailInput;
            }
            
            showError(registerError, errorMessage, targetInput);
        }
    } catch (error) {
        console.error('Registration request failed:', error);
        showError(registerError, ERROR_MESSAGES.generic, emailInput);
    }
});

// Update header button based on auth status
function updateHeaderButton() {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const headerBtn = document.getElementById('openAuthModal');
    
    if (token && headerBtn) {
        headerBtn.textContent = email || 'Профиль';
        headerBtn.onclick = () => {
            // Logout
            localStorage.removeItem('token');
            localStorage.removeItem('email');
            window.location.reload();
        };
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Ensure modal is hidden on load
    if (authModal) {
        authModal.classList.remove('auth-modal--visible');
    }
    updateHeaderButton();
});
