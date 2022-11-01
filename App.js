import React from 'react'
import ChatRoom from './component/ChatRoom'
import Card from './component/Card'
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom"

const App = () => {
  return (
    <ChatRoom/>
   //<>
   //<BrowserRouter>
   /*<div className="container my-3">
    <Routes>
    
    <Route exact path="/" element={<ChatRoom/>}>
        </Route>
        <Route exact path="/Card" element={<Card/>}>
        </Route>
  </Routes>*/
 //  </div>
  // </BrowserRouter>
   //</>
  )
}

export default App;