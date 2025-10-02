import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import AuthPanel from './components/AuthPanel'
import Landing from './pages/Landing'
import './App.scss'
function App() {
  return (
    <div className='page'>
      <Routes>
        <Route path='/' element={<Landing />} />
        
      </Routes>
    </div>
  )
}


export default App
