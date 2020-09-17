import React, { useState, useContext } from "react";
import axios from 'axios';
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AddAPhotoIcon from "@material-ui/icons/AddAPhotoTwoTone";
import LandscapeIcon from "@material-ui/icons/LandscapeOutlined";
import ClearIcon from "@material-ui/icons/Clear";
import SaveIcon from "@material-ui/icons/SaveTwoTone";
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery'

import Context from '../../context'
import { DELETE_DRATF } from "../../actionTypes"
import { CREATE_NOTE_MUTATION } from "../../graphql/mutations"
import { useClient } from '../../client'


const CreateNote = ({ classes }) => {
  const client = useClient()
  const { state, dispatch } = useContext(Context)
  const [title, setTitle] = useState('')
  const [image, setImage] = useState('')
  const [content, setContent] = useState('')
  const [submittig, setSubmitting] = useState(false)
  const mobileSize = useMediaQuery('(max-width: 650px)')

  const handleImageUpload = async () => {
    const data = new FormData()
    data.append('file', image)
    data.append('upload_preset', 'map_notes')
    data.append('cloud_name', 'jetbul')

    const res = await axios.post(
      'https://api.cloudinary.com/v1_1/jetbul/image/upload',
      data
    )
    return res.data.url
  }

  const handleSublit = async event => {
    event.preventDefault()
    try {
      setSubmitting(true)
      const url = await handleImageUpload()
      const { latitude, longitude } = state.draft
      const variables = { title, image: url, content, latitude, longitude }
      await client.request(CREATE_NOTE_MUTATION, variables)
      handleDeleteDraft()
    } catch (err) {
      setSubmitting(false)
      console.error('Error creating note', err)
    }
  }

  const handleDeleteDraft = () => {
    setTitle('')
    setImage('')
    setContent('')
    dispatch({ type: DELETE_DRATF })
  }


  return (
    <form className={classes.form}>
      <Typography
        className={classes.alignCenter}
        component="h2"
        variant="h4"
        color="secondary"
      >
        <LandscapeIcon className={classes.iconLarge} /> Location
      </Typography>
      <div>
        <TextField
          name="title"
          label="Title"
          placeholder="Insert note title"
          onChange={e => setTitle(e.target.value)}
        />
        <input
          accept="image/*"
          id="image"
          type="file"
          className={classes.input}
          onChange={e => setImage(e.target.files[0])}
        />
        <label htmlFor="image">
          <Button
            component="span"
            size="small"
            className={classes.button}
            style={{ color: image && "green" }}
          >
            <AddAPhotoIcon />
          </Button>
        </label>
        <div className={classes.contentField}>
          <TextField
            name="content"
            label="Content"
            multiline
            rows={mobileSize ? "3" : "6"}
            margin="normal"
            fullWidth
            variant="outlined"
            onChange={e => setContent(e.target.value)}
          />
        </div>
        <div>
          <Button
            className={classes.button}
            variant="contained"
            color={"primary"}
            onClick={handleDeleteDraft}
          >
            <ClearIcon className={classes.leftIcon} />
            Discard
          </Button>
          <Button
            type="submit"
            className={classes.button}
            variant="contained"
            color="secondary"
            disabled={!title.trim || !content.trim() || !image || submittig}
            onClick={handleSublit}
          >
            <SaveIcon className={classes.rightIcon} />
            Submit
          </Button>
        </div>
      </div>
    </form>
  );
};

const styles = theme => ({
  form: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    paddingBottom: theme.spacing.unit
  },
  contentField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: "95%"
  },
  input: {
    display: "none"
  },
  alignCenter: {
    display: "flex",
    alignItems: "center"
  },
  iconLarge: {
    fontSize: 40,
    marginRight: theme.spacing.unit
  },
  leftIcon: {
    fontSize: 20,
    marginRight: theme.spacing.unit
  },
  rightIcon: {
    fontSize: 20,
    marginLeft: theme.spacing.unit
  },
  button: {
    marginTop: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 2,
    marginRight: theme.spacing.unit,
    marginLeft: 0
  }
});

export default withStyles(styles)(CreateNote);
