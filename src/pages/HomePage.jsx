import Header from '../components/Header';
import Hero from '../components/Hero';
import Programs from '../components/Programs';

const HomePage = ({ onOpenAuth }) => {
  return (
    <>
      <Header onOpenAuth={onOpenAuth} />
      <main className="main">
        <Hero />
        <Programs />
      </main>
    </>
  );
};

export default HomePage;





