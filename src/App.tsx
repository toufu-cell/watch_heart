import { HeartRateDisplay } from './components/HeartRateDisplay';
import { useHeartRate } from './hooks/useHeartRate';
import './App.css';

function App() {
    const state = useHeartRate();

    return <HeartRateDisplay state={state} />;
}

export default App;
