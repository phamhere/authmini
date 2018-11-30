import React, { Component } from "react";
import { withRouter, Route } from "react-router-dom";

import Signin from "./components/Signin";
import Users from "./components/Users";
import "./App.css";

class App extends Component {
  logout = e => {
    localStorage.removeItem("jwt");
    this.props.history.push("/signin");
  };
  render() {
    return (
      <div className="App">
        <h2>React App</h2>
        <div>
          <button onClick={this.logout}>LogOut</button>
        </div>
        <Route path="/signin" component={Signin} />
        <Route path="/users" component={Users} />
      </div>
    );
  }
}

export default withRouter(App);
