import { describe, it, expect } from 'vitest';
import { programs, getProgramById } from '../programs';

describe('programs data', () => {
  it('содержит массив программ', () => {
    expect(Array.isArray(programs)).toBe(true);
    expect(programs.length).toBeGreaterThan(0);
  });

  it('каждая программа имеет все необходимые поля', () => {
    programs.forEach(program => {
      expect(program).toHaveProperty('id');
      expect(program).toHaveProperty('title');
      expect(program).toHaveProperty('image');
      expect(program).toHaveProperty('detailImage');
      expect(program).toHaveProperty('bgColor');
      expect(program).toHaveProperty('duration');
      expect(program).toHaveProperty('timePerDay');
      expect(program).toHaveProperty('difficulty');
      expect(program).toHaveProperty('suitableFor');
      expect(program).toHaveProperty('directions');
      expect(program).toHaveProperty('benefits');
    });
  });

  it('getProgramById возвращает правильную программу', () => {
    const program = getProgramById(1);
    expect(program).toBeDefined();
    expect(program.id).toBe(1);
    expect(program.title).toBe('Йога');
  });

  it('getProgramById возвращает undefined для несуществующего id', () => {
    const program = getProgramById(999);
    expect(program).toBeUndefined();
  });

  it('getProgramById корректно обрабатывает строковые id', () => {
    const program = getProgramById('1');
    expect(program).toBeDefined();
    expect(program.id).toBe(1);
  });

  it('программы имеют уникальные id', () => {
    const ids = programs.map(p => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});


