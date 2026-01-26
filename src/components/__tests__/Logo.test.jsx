import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Logo from '../Logo';

describe('Logo', () => {
  it('рендерит логотип с текстом SkyFitnessPro', () => {
    render(
      <BrowserRouter>
        <Logo />
      </BrowserRouter>
    );
    
    expect(screen.getByText('SkyFitnessPro')).toBeInTheDocument();
  });

  it('рендерит ссылку на главную страницу', () => {
    render(
      <BrowserRouter>
        <Logo />
      </BrowserRouter>
    );
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('применяет переданный className', () => {
    render(
      <BrowserRouter>
        <Logo className="custom-class" />
      </BrowserRouter>
    );
    
    const link = screen.getByRole('link');
    expect(link).toHaveClass('logo', 'custom-class');
  });

  it('рендерит SVG иконку', () => {
    render(
      <BrowserRouter>
        <Logo />
      </BrowserRouter>
    );
    
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });
});

