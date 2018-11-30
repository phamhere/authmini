import React, { Component } from "react";
import axios from "axios";

export default class Users extends Component {
  state = {
    users: []
  };
  componentDidMount() {
    const token = localStorage.getItem("jwt");
    const reqOptions = {
      headers: {
        authorization: token
      }
    };
    axios
      .get("http://localhost:3300/api/users", reqOptions)
      .then(res => {
        this.setState({ users: res.data });
      })
      .catch(err => console.log(err));
  }
  render() {
    return (
      <div>
        <ul>
          {this.state.users.map(user => (
            <li key={user.id}>{user.username}</li>
          ))}
        </ul>
      </div>
    );
  }
}
