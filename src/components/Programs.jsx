import ProgramCard from './ProgramCard';
import { programs } from '../data/programs';

const Programs = () => {
  return (
    <section className="programs">
      <div className="container">
        <div className="programs__grid">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
          <button 
            className="btn btn--primary programs__scroll-top-btn" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Наверх ↑
          </button>
        </div>
      </div>
    </section>
  );
};

export default Programs;





