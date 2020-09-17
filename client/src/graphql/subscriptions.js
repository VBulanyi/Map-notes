import gql from 'graphql-tag'

export const NOTE_ADDED_SUBSCRIPTION = gql`
    subscription {
        noteAdded {
            _id
            title
            content
            image
            latitude
            longitude
            createdAt
            author {
              _id
              name
              email
              picture
            }
            comments {
              text
              createdAt
              author {
                name
                picture
              }
            }
        }
    }
`

export const NOTE_DELETED_SUBSCRIPTION = gql`
    subscription {
        noteDeleted {
            _id
        }
    }
`

export const NOTE_UPDATED_SUBSCRIPTION = gql`
    subscription {
        noteUpdated {
            _id
            createdAt
            title
            image
            content
            latitude
            longitude
            author {
                _id
                name
                email
                picture
            }
            comments {
                text
                createdAt
                author {
                    name
                    picture
                }
            }
        }
    }
`