import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { UserContext } from './context/UserContext.tsx';
import ThemeProvider from './theme';
import { useState } from "react";
import SnackbarProvider from './components/snackbar';
import { MotionLazyContainer } from './components/animate';
import Page404 from './pages/Page404';

function App() {
  const [page, setPage] = useState(null);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  return (
    <MotionLazyContainer>
      <ThemeProvider>
        <BrowserRouter>
          <SnackbarProvider>
            <UserContext.Provider value={{ page, setPage, user, setUser, session, setSession }}>
              <Routes>
                <Route path='*' element={<Page404 />} />
              </Routes>
              {page && page !== "404" && <div className="footer">Built with ❤️ in California</div>}
            </UserContext.Provider>
          </SnackbarProvider>
        </BrowserRouter>
      </ThemeProvider >
    </MotionLazyContainer>
  );
}

export default App;
