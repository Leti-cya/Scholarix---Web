import { BrowserRouter, Routes, Route } from 'react-router-dom'

import About from './pages/About'
import viteLogo from './pages/Contact'
import heroImg from './pages/Home'
import './App.css'
import Home from './pages/Home'
import Home from './pages/ErrorFound'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path = "/about" element = {<About />} />
        <Route path = "/contact" element = {<Contact />} />
        <Route path = "/" element = {<Home />} />
        <Route path = "/" element = {<ErrorFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App