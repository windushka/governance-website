import { preload } from './actions';
import { HomeViewPure } from './views';

const Home = async () => {
  preload();
  return <HomeViewPure />
};

export default Home;
