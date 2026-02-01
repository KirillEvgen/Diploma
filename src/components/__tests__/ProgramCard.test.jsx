import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProgramCard from '../ProgramCard';
import * as coursesApi from '../../api/coursesApi';

vi.mock('../../api/coursesApi');
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
  }),
}));

const mockProgram = {
  id: 1,
  title: 'Йога',
  image: '/images/programs/yoga.jpg',
  bgColor: '#FFC700',
  duration: '25 дней',
  timePerDay: '20-50 мин/день',
  difficulty: 'Сложность',
};

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  global.alert = vi.fn();
});

describe('ProgramCard', () => {
  it('рендерит информацию о программе', () => {
    renderWithRouter(<ProgramCard program={mockProgram} />);
    
    expect(screen.getByText('Йога')).toBeInTheDocument();
    expect(screen.getByText('25 дней')).toBeInTheDocument();
    expect(screen.getByText('20-50 мин/день')).toBeInTheDocument();
    expect(screen.getByText('Сложность')).toBeInTheDocument();
  });

  it('рендерит изображение программы', () => {
    renderWithRouter(<ProgramCard program={mockProgram} />);
    
    const image = screen.getByAltText('Йога');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/programs/yoga.jpg');
  });

  it('применяет цвет фона из программы', () => {
    renderWithRouter(<ProgramCard program={mockProgram} />);
    
    const imageContainer = document.querySelector('[class*="image"]');
    expect(imageContainer).toHaveStyle({ backgroundColor: '#FFC700' });
  });

  it('рендерит кнопку добавления', () => {
    renderWithRouter(<ProgramCard program={mockProgram} />);
    
    const addButton = screen.getByRole('button', { name: /добавить в избранное/i });
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveTextContent('+');
  });

  it('навигация при клике на карточку', () => {
    const { container } = renderWithRouter(<ProgramCard program={mockProgram} />);
    
    const card = container.querySelector('article');
    fireEvent.click(card);
    
    expect(mockNavigate).toHaveBeenCalledWith('/course/1');
  });

  it('добавляет курс при клике на кнопку добавления', async () => {
    coursesApi.findCourseByTitle.mockResolvedValue({
      success: true,
      data: { _id: 'course-123' },
    });
    coursesApi.addUserCourse.mockResolvedValue({
      success: true,
    });
    
    renderWithRouter(<ProgramCard program={mockProgram} />);
    
    const addButton = screen.getByRole('button', { name: /добавить в избранное/i });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(coursesApi.findCourseByTitle).toHaveBeenCalledWith('Йога');
      expect(coursesApi.addUserCourse).toHaveBeenCalledWith('course-123');
    });
    
    expect(global.alert).toHaveBeenCalledWith('Курс успешно добавлен!');
    const savedCourses = JSON.parse(localStorage.getItem('userCourses') || '[]');
    expect(savedCourses).toContain('course-123');
  });

  it('обрабатывает ошибку при поиске курса', async () => {
    coursesApi.findCourseByTitle.mockResolvedValue({
      success: false,
      error: 'Курс не найден',
    });
    
    renderWithRouter(<ProgramCard program={mockProgram} />);
    
    const addButton = screen.getByRole('button', { name: /добавить в избранное/i });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(coursesApi.findCourseByTitle).toHaveBeenCalledWith('Йога');
    });
    
    expect(global.alert).toHaveBeenCalledWith(
      expect.stringContaining('Курс не найден')
    );
    expect(coursesApi.addUserCourse).not.toHaveBeenCalled();
  });

  it('обрабатывает ошибку при добавлении курса', async () => {
    coursesApi.findCourseByTitle.mockResolvedValue({
      success: true,
      data: { _id: 'course-123' },
    });
    coursesApi.addUserCourse.mockResolvedValue({
      success: false,
      error: 'Ошибка сервера',
    });
    
    renderWithRouter(<ProgramCard program={mockProgram} />);
    
    const addButton = screen.getByRole('button', { name: /добавить в избранное/i });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(coursesApi.addUserCourse).toHaveBeenCalledWith('course-123');
    });
    
    expect(global.alert).toHaveBeenCalledWith('Ошибка сервера');
  });

  it('обрабатывает дубликат курса', async () => {
    coursesApi.findCourseByTitle.mockResolvedValue({
      success: true,
      data: { _id: 'course-123' },
    });
    coursesApi.addUserCourse.mockResolvedValue({
      success: false,
      isDuplicate: true,
    });
    
    renderWithRouter(<ProgramCard program={mockProgram} />);
    
    const addButton = screen.getByRole('button', { name: /добавить в избранное/i });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(coursesApi.addUserCourse).toHaveBeenCalledWith('course-123');
    });
    
    expect(global.alert).toHaveBeenCalledWith('Курс уже был добавлен!');
  });
});


