
const API_BASE_URL = 'https://webdev-hw-api.vercel.app/api/fitness';

const ERROR_MESSAGES = {
    loginIncorrect: 'Пароль введен неверно, попробуйте еще раз.',
    emailExists: 'Данная почта уже используется. Попробуйте войти.',
    generic: 'Произошла ошибка. Попробуйте еще раз.'
};

const authModal = document.getElementById('authModal');
const openAuthModalBtn = document.getElementById('openAuthModal');
const closeAuthModalBtn = document.getElementById('closeAuthModal');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const switchToRegisterBtn = document.getElementById('switchToRegister');
const switchToLoginBtn = document.getElementById('switchToLogin');

const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

openAuthModalBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (authModal) {
        authModal.classList.add('auth-modal--visible');
        document.body.style.overflow = 'hidden';
        if (loginForm) loginForm.style.display = 'flex';
        if (registerForm) registerForm.style.display = 'none';
        clearErrors();
    }
});

closeAuthModalBtn?.addEventListener('click', () => {
    authModal?.classList.remove('auth-modal--visible');
    document.body.style.overflow = '';
    clearErrors();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal?.classList.contains('auth-modal--visible')) {
        authModal.classList.remove('auth-modal--visible');
        document.body.style.overflow = '';
        clearErrors();
    }
});

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

function clearErrors() {
    if (loginError) {
        loginError.textContent = '';
        loginError.classList.remove('auth-form__error--visible');
    }
    if (registerError) {
        registerError.textContent = '';
        registerError.classList.remove('auth-form__error--visible');
    }
    
    document.querySelectorAll('.auth-form__input--error').forEach(input => {
        input.classList.remove('auth-form__input--error');
    });
}

function showError(errorElement, message, inputElement = null) {
    if (!errorElement) return;
    
    errorElement.textContent = message;
    errorElement.classList.add('auth-form__error--visible');
    
    if (inputElement) {
        inputElement.classList.add('auth-form__input--error');
        inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    
    const email = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const emailInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    
    if (!email || !email.includes('@')) {
        showError(loginError, 'Введите корректное электронное письмо', emailInput);
        return;
    }
    
    try {
        const url = `${API_BASE_URL}/auth/login`;
        console.log('Logging in to:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': ''
                },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        console.log('Login response status:', response.status, response.statusText);
        
        let data = null;
        
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
                        data = { message: text || ERROR_MESSAGES.generic };
                    }
                }
            }
        } catch (parseError) {
            console.error('Failed to parse response:', parseError);
            data = { message: ERROR_MESSAGES.generic };
        }
        
        if (response.ok) {
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            localStorage.setItem('email', email);
            
            authModal?.classList.remove('auth-modal--visible');
            document.body.style.overflow = '';
            
            updateHeaderButton();
            
            window.location.reload();
        } else {
            let errorMessage = ERROR_MESSAGES.loginIncorrect;
            
            if (data && data.message) {
                errorMessage = data.message;
            } else if (data && data.error) {
                errorMessage = data.error;
            }
            
            showError(loginError, errorMessage, passwordInput);
            if (email) {
                emailInput.value = email;
            }
        }
    } catch (error) {
        console.error('Login request failed:', error);
        showError(loginError, ERROR_MESSAGES.generic, passwordInput);
    }
});

function validatePassword(password) {
    const errors = [];
    
    if (password.length < 6) {
        errors.push('Пароль должен содержать не менее 6 символов');
    }
    
    const specialChars = password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g);
    if (!specialChars || specialChars.length < 2) {
        errors.push('Пароль должен содержать не менее 2 спецсимволов');
    }
    
    if (!/[A-ZА-Я]/.test(password)) {
        errors.push('Пароль должен содержать как минимум одну заглавную букву');
    }
    
    return errors;
}

registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    const emailInput = document.getElementById('registerEmail');
    const passwordInput = document.getElementById('registerPassword');
    const passwordConfirmInput = document.getElementById('registerPasswordConfirm');
    
    if (password !== passwordConfirm) {
        showError(registerError, 'Пароли не совпадают.', passwordConfirmInput);
        return;
    }
    
    try {
        const url = 'https://webdev-hw-api.vercel.app/api/users';
        console.log('Registering to:', url);
        console.log('Request body:', { email, password: '***' });
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        console.log('Register response status:', response.status, response.statusText);
        
        let responseText = '';
        let data = null;
        
        try {
            responseText = await response.text();
            if (responseText) {
                    try {
                        data = JSON.parse(responseText);
                    } catch (e) {
                        data = { message: responseText || ERROR_MESSAGES.generic };
                }
            }
        } catch (parseError) {
            console.error('Failed to parse response:', parseError);
            data = { message: ERROR_MESSAGES.generic };
        }
        
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
            alert('Регистрация прошла успешно! Теперь войдите в систему.');
            registerForm.style.display = 'none';
            loginForm.style.display = 'flex';
            document.getElementById('loginUsername').value = email;
        } else {
            let errorMessage = ERROR_MESSAGES.generic;
            
            if (data && data.message) {
                errorMessage = data.message;
            } else if (data && data.error) {
                errorMessage = data.error;
            }
            
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

function updateHeaderButton() {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');
    const headerBtn = document.getElementById('openAuthModal');
    
    if (token && headerBtn) {
        headerBtn.textContent = email || 'Профиль';
        headerBtn.onclick = () => {
            localStorage.removeItem('token');
            localStorage.removeItem('email');
            window.location.reload();
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (authModal) {
        authModal.classList.remove('auth-modal--visible');
    }
    updateHeaderButton();
});
