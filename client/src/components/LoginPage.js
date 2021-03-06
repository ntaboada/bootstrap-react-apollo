import React from "react";
import { Redirect, Link } from "react-router-dom";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import LoadingPage from "./LoadingPage";
import ErrorPage from "./ErrorPage";
import Layout from "./Layout";

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      user {
        nodeId
        id
        username
        name
      }
    }
  }
`;

export default class LoginPage extends React.Component {
  static QueryFragment = gql`
    fragment LoginPage_QueryFragment on Query {
      currentUser {
        nodeId
      }
    }
  `;

  state = {
    username: "",
    password: "",
    loggingIn: false,
  };

  handleUsernameChange = e => {
    this.setState({ username: e.target.value, error: null });
  };

  handlePasswordChange = e => {
    this.setState({ password: e.target.value, error: null });
  };

  handleSubmitWith = login => async e => {
    e.preventDefault();
    const { username, password } = this.state;
    this.setState({ loggingIn: true });
    try {
      const { data } = await login({ variables: { username, password } });
      if (data.login && data.login.user) {
        this.setState({ loggingIn: false, loggedInAs: data.login.user });
      } else {
        throw new Error("Login failed");
      }
    } catch (e) {
      this.setState({
        loggingIn: false,
        error: "Login failed",
      });
    }
  };

  getNext() {
    return "/";
  }

  render() {
    const { data, loading, error } = this.props;
    if (loading) return <LoadingPage />;
    if (error) {
      return (
        <ErrorPage>
          We failed talking to the server. Please reload the page.
        </ErrorPage>
      );
    }
    if (data.currentUser || this.state.loggedInAs) {
      return <Redirect to={this.getNext()} />;
    }
    return (
      <Layout>
        <h1>Log in</h1>
        <button onClick={() => (window.location = "/auth/github")}>
          Login with GitHub
        </button>
        <h3>Log in with email</h3>
        <Mutation mutation={LOGIN}>
          {login => (
            <form onSubmit={this.handleSubmitWith(login)}>
              <table>
                <tbody>
                  <tr>
                    <th>Username / email:</th>
                    <td>
                      <input
                        type="text"
                        value={this.state.username}
                        onChange={this.handleUsernameChange}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Password:</th>
                    <td>
                      <input
                        type="password"
                        value={this.state.password}
                        onChange={this.handlePasswordChange}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              {this.state.error ? <p>{this.state.error}</p> : null}
              <button
                type="submit"
                disabled={
                  !this.state.username ||
                  !this.state.password ||
                  this.state.loggingIn
                }
              >
                Log in
              </button>
              <Link to="/register">Don't have an account? Create one</Link>
            </form>
          )}
        </Mutation>
      </Layout>
    );
  }
}
