import ApiKeyModal from './components/ApiKeyModal/ApiKeyModal';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

function App() {
  return (
      <ErrorBoundary>
        <ApiKeyModal />
      </ErrorBoundary>
  );
}

export default App;