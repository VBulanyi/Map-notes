import React, { useContext } from "react";
import { withStyles } from "@material-ui/core/styles";
import { Paper } from "@material-ui/core";
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery'

import Context from '../context'
import NoContent from './Note/NoContent'
import CreateNote from './Note/CreateNote'
import NoteContent from './Note/NoteContent'

const Blog = ({ classes }) => {
  const { state } = useContext(Context)
  const { draft, currentNote } = state
  const mobileSize = useMediaQuery('(max-width: 650px)')

  let BlogContent

  if (!draft && !currentNote) {
    BlogContent = NoContent
  } else if (draft && !currentNote) {
    BlogContent = CreateNote
  } else if (!draft && currentNote) {
    BlogContent = NoteContent
  }


  return (
    <Paper className={mobileSize ? classes.rootMobile : classes.root}>
      <BlogContent />
    </Paper>
  );
};

const styles = {
  root: {
    minWidth: 350,
    maxWidth: 400,
    maxHeight: "calc(100vh - 64px)",
    overflowY: "scroll",
    display: "flex",
    justifyContent: "center"
  },
  rootMobile: {
    maxWidth: "100%",
    maxHeight: 300,
    overflowX: "hidden",
    overflowY: "scroll"
  }
};

export default withStyles(styles)(Blog);
