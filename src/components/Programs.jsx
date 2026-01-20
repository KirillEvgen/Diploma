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
        </div>
      </div>
    </section>
  );
};

export default Programs;

