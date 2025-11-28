import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import DivinationPanel from './components/DivinationPanel';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Header />
        <main className="main-content">
          <DivinationPanel />
        </main>
        <footer className="footer">
          <p>© 2024 易经卜卦 | 传承千年智慧，洞察人生玄机</p>
          <p className="footer-note">
            本应用仅供娱乐和文化学习参考，不构成任何决策建议
          </p>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
