import './App.css'
import ApiKeyModal from './components/ApiKeyModal/ApiKeyModal';
import { ThemeProvider } from 'styled-components';


const theme = {
  colors: {
    primary: '#4285f4',
    text: '#202124',
    secondaryText: '#5f6368',
    border: '#dadce0',
  },
};


function App() {
  return (
    <ThemeProvider theme={theme}>
      <ApiKeyModal />
    </ThemeProvider>
  )
}

export default App
