import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { UserContext } from './context/UserContext.tsx';
import ThemeProvider from './theme';
import { useState } from "react";
import SnackbarProvider from './components/snackbar';
import { MotionLazyContainer } from './components/animate';
import NavBar from './pages/NavBar';
import Home from './pages/Home';
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
              {page && page !== "404" && <NavBar />}
              <Routes>
                <Route path='' element={<Home />} />
                <Route path='*' element={<Page404 />} />
              </Routes>
              {page && page !== "404" && <div className="footer">Only Real Return Counts</div>}
            </UserContext.Provider>
          </SnackbarProvider>
        </BrowserRouter>
      </ThemeProvider >
    </MotionLazyContainer>
  );
}

export default App;
