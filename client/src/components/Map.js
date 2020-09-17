import React, { useState, useEffect, useContext } from "react";
import ReactMapGL, { NavigationControl, Marker, Popup } from 'react-map-gl'
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from "@material-ui/icons/DeleteTwoTone";
import differenceInMinutes from 'date-fns/difference_in_minutes'
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery'
import { Subscription } from 'react-apollo'

import { useClient } from '../client'
import { GET_NOTES_QUERY } from '../graphql/queries'
import { DELETE_NOTE_MUTATION } from '../graphql/mutations'
import { NOTE_ADDED_SUBSCRIPTION, NOTE_DELETED_SUBSCRIPTION, NOTE_UPDATED_SUBSCRIPTION } from '../graphql/subscriptions'
import NoteIcon from "./NoteIcon";
import Blog from './Blog'
import Context from '../context'
import { CREATE_DRAFT, UPDATE_DRAFT_LOCATTION, GET_NOTES, SET_NOTE, DELETE_NOTE, CREATE_NOTE, CREATE_COMMENT } from '../actionTypes'

const INITIAL_VIEWPORT = {
  latitude: 59.930782038741164,
  longitude: 30.314549033680798,
  zoom: 12
}

const Map = ({ classes }) => {
  const client = useClient()
  const mobileSize = useMediaQuery('(max-width: 650px)')
  const { state, dispatch } = useContext(Context)
  useEffect(() => {
    getNotes()
  }, [])
  const [viewport, setVewport] = useState(INITIAL_VIEWPORT)
  const [userPosition, setUserposition] = useState(null)
  useEffect(() => {
    getUserPosition()
  }, [])

  const [popup, setPopup] = useState(null)
  // remove popup if note itself is deleted by the author of the note
  useEffect(() => {
    const noteExists = popup && state.notes.findIndex(note => note._id === popup._id) > -1
    if (!noteExists) {
      setPopup(null)
    }
  }, [state.notes.length])


  const getUserPosition = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords
        setVewport({ ...viewport, latitude, longitude })
        setUserposition({ latitude, longitude })
      })
    }
  }
  const getNotes = async () => {
    const { getNotes } = await client.request(GET_NOTES_QUERY)
    dispatch({ type: GET_NOTES, payload: getNotes })
  }

  const handleMapClick = ({ lngLat, leftButton }) => {
    if (!leftButton) return
    if (!state.draft) {
      dispatch({ type: CREATE_DRAFT })
    }
    const [longitude, latitude] = lngLat

    dispatch({
      type: UPDATE_DRAFT_LOCATTION,
      payload: { longitude, latitude }
    })
  }

  const highlightNewNote = note => {
    const isNewNote = differenceInMinutes(Date.now(), Number(note.createdAt)) < 60
    return isNewNote ? "limegreen" : "darkblue"
  }

  const handleSelectNote = note => {
    setPopup(note)
    dispatch({ type: SET_NOTE, payload: note })
  }

  const isAuthUser = () => state.currentUser._id === popup.author._id

  const handleDeleteNote = async note => {
    const variables = { noteId: note._id }
    await client.request(DELETE_NOTE_MUTATION, variables)
    setPopup(null)
  }

  return (
    <div className={mobileSize ? classes.rootMobile : classes.root}>
      <ReactMapGL
        width="100vw"
        height="calc(100vh - 64px)"
        mapStyle="mapbox://styles/mapbox/streets-v9"
        mapboxApiAccessToken="pk.eyJ1IjoiamV0YnVsIiwiYSI6ImNrZWN2c2JoaTA2MGkydm1saDB2ODlmYW0ifQ.knRcy17lYb3Niz_gmb6lew"
        onClick={handleMapClick}
        scrollZoom={!mobileSize}
        onViewportChange={newViewport => setVewport(newViewport)}
        {...viewport}
      >
        <div className={classes.navigationControl}>
          <NavigationControl
            onViewportChange={newViewport => setVewport(newViewport)}
          />
        </div>
        {/* user's current position */}
        {userPosition && (
          <Marker
            latitude={userPosition.latitude}
            longitude={userPosition.longitude}
            offsetLeft={-15}
            offsetTop={-30}
          >
            <NoteIcon size={40} color="red" />
          </Marker>
        )}
        {/* draft note */}
        {state.draft && (
          <Marker
            latitude={state.draft.latitude}
            longitude={state.draft.longitude}
            offsetLeft={-15}
            offsetTop={-30}
          >
            <NoteIcon size={40} color="hotpink" />
          </Marker>
        )}
        {/* Created notes */}
        {state.notes.map(note => (
          <Marker
            key={note._id}
            latitude={note.latitude}
            longitude={note.longitude}
            offsetLeft={-15}
            offsetTop={-30}
          >
            <NoteIcon
              onClick={() => handleSelectNote(note)}
              size={40}
              color={highlightNewNote(note)}
            />
          </Marker>
        ))}

        {/* Popup for created notes */}
        {popup && (
          <Popup
            anchor="top"
            latitude={popup.latitude}
            longitude={popup.longitude}
            closeOnClick={false}
            onClose={() => setPopup(null)}
          >
            <img
              className={classes.popupImage}
              src={popup.image}
              alt={popup.title}
            />
            <div className={classes.popupTab}>
              <Typography>
                {popup.latitude.toFixed(6)}, {popup.longitude.toFixed(6)}
              </Typography>
              {isAuthUser && (
                <Button onClick={() => handleDeleteNote(popup)}>
                  <DeleteIcon className={classes.deleteIcon} />
                </Button>
              )}
            </div>
          </Popup>
        )}
      </ReactMapGL>
      {/* Subscription for creating, deleting and updating notes */}
      <Subscription
        subscription={NOTE_ADDED_SUBSCRIPTION}
        onSubscriptionData={({ subscriptionData }) => {
          const { noteAdded } = subscriptionData.data
          dispatch({ type: CREATE_NOTE, payload: noteAdded })
        }}
      />
      <Subscription
        subscription={NOTE_DELETED_SUBSCRIPTION}
        onSubscriptionData={({ subscriptionData }) => {
          const { noteDeleted } = subscriptionData.data
          dispatch({ type: DELETE_NOTE, payload: noteDeleted })
        }}
      />
      <Subscription
        subscription={NOTE_UPDATED_SUBSCRIPTION}
        onSubscriptionData={({ subscriptionData }) => {
          const { noteUpdated } = subscriptionData.data
          dispatch({ type: CREATE_COMMENT, payload: noteUpdated })
        }}
      />

      {/* Blog area fror note content */}
      <Blog />
    </div>
  )
};

const styles = {
  root: {
    display: "flex"
  },
  rootMobile: {
    display: "flex",
    flexDirection: "column-reverse"
  },
  navigationControl: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: "1em"
  },
  deleteIcon: {
    color: "red"
  },
  popupImage: {
    padding: "0.4em",
    height: 200,
    width: 200,
    objectFit: "cover"
  },
  popupTab: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column"
  }
};

export default withStyles(styles)(Map);
