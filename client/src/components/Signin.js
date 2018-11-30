import React, { Component } from "react";
import axios from "axios";

export default class Signin extends Component {
  state = {
    username: "",
    password: ""
  };
  signIn = e => {
    e.preventDefault();
    axios
      .post("http://localhost:3300/api/login", this.state)
      .then(res => {
        localStorage.setItem("jwt", res.data.token);
        this.setState({ username: "", password: "" });
        this.props.history.push("/users");
      })
      .catch(err => console.log(err));
  };
  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  render() {
    return (
      <form onSubmit={this.signIn}>
        <div>
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={this.state.username}
            onChange={this.handleChange}
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="text"
            name="password"
            value={this.state.password}
            onChange={this.handleChange}
          />
        </div>
        <div>
          <button type="submit">SignIn</button>
        </div>
      </form>
    );
  }
}
