import Header from '../components/Header';
import Hero from '../components/Hero';
import Programs from '../components/Programs';
import Footer from '../components/Footer';

const HomePage = ({ onOpenAuth }) => {
  return (
    <>
      <Header onOpenAuth={onOpenAuth} />
      <main className="main">
        <Hero />
        <Programs />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;

