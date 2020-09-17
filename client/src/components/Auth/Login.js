import React, { useContext } from "react";
import { GoogleLogin } from 'react-google-login';
import { GraphQLClient } from 'graphql-request'
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

import Context from '../../context'
import { LOGIN_USER, IS_LOGGED_IN } from '../../actionTypes'
import { ME_QUERY } from '../../graphql/queries'
import { BASE_URL } from '../../client'

const Login = ({ classes }) => {

  const { dispatch } = useContext(Context)

  const onSuccess = async googleUser => {
    try {
      const idToken = googleUser.getAuthResponse().id_token
      const client = new GraphQLClient(BASE_URL, {
        headers: { authorization: idToken }
      })
      const { me } = await client.request(ME_QUERY)
      dispatch({ type: LOGIN_USER, payload: me })
      dispatch({ type: IS_LOGGED_IN, payload: googleUser.isSignedIn() })
    } catch (err) {
      onFailure(err)
    }

  }

  const onFailure = err => {
    console.error("Error logging in", err)
    dispatch({ type: IS_LOGGED_IN, payload: false })

  }

  return (
    <div className={classes.root}>
      <Typography
        component="h1"
        variant="h3"
        gutterBottom
        noWrap
        style={{ color: "rgb(66, 133, 244)" }}
      >
        Welcome
      </Typography>
      <GoogleLogin
        clientId="93758250225-vm8gphk5tb49bhebhn3h8s62egt6ge3p.apps.googleusercontent.com"
        onSuccess={onSuccess}
        onFailure={onFailure}
        isSignedIn={true}
        theme="dark"
        buttonText="Login with Google"
      />
    </div>
  )
};

const styles = {
  root: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center"
  }
};

export default withStyles(styles)(Login);
