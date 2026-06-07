import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App xatolik:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        style: { padding: '20px', textAlign: 'center', marginTop: '40px' }
      },
        React.createElement('h2', null, '⚠️ Xatolik yuz berdi'),
        React.createElement('p', { style: { color: '#999', marginTop: '10px' } },
          'Iltimos, ilovani qayta oching.'),
        React.createElement('p', { style: { color: '#ccc', fontSize: '12px', marginTop: '10px' } },
          String(this.state.error))
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)