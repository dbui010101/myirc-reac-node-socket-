import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import "./index.css";
import Home from "./Home/Home";
import ChatRoom from "./ChatRoom/ChatRoom";
import io from "socket.io-client";
const socket= io("http://localhost:4000");
function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Home socket={socket}/>
        </Route>
        <Route exact path="/:ChatRoom/:roomId" >
          <ChatRoom socket={socket}/>
        </Route>
        {/* <Route exact path="/:Rooms/:roomId" >
          <Rooms socket={socket}/>
        </Route> */}
      </Switch>
    </Router>
  );
}

export default App;
