import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProgramCard from '../ProgramCard';

const mockProgram = {
  id: 1,
  title: 'Йога',
  image: '/images/programs/yoga.jpg',
  bgColor: '#FFC700',
  duration: '25 дней',
  timePerDay: '20-50 мин/день',
  difficulty: 'Сложность',
};

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

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
    
    const imageContainer = document.querySelector('.program-card__image');
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
    
    const card = container.querySelector('.program-card');
    fireEvent.click(card);
    
    expect(window.location.pathname).toBe('/course/1');
  });

  it('навигация при клике на кнопку добавления', () => {
    renderWithRouter(<ProgramCard program={mockProgram} />);
    
    const addButton = screen.getByRole('button', { name: /добавить в избранное/i });
    fireEvent.click(addButton);
    
    expect(window.location.pathname).toBe('/course/1');
  });
});


