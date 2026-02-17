import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './Layout'
import Home from './Pages/Home'
import Page1 from './Pages/Page1'
import Page2 from './Pages/Page2'
import './App.css'



function App() {

  return (
    <Router>
      <Routes>
        <Route element={<Layout/>}>
        <Route path='/' element={<Home/>}/>
        <Route path='/page1' element={<Page1/>}/>
        <Route path='/page2' element={<Page2/>}/>    
        </Route>
      </Routes>
    </Router>
  )
}

export default App
