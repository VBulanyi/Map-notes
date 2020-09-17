export const CREATE_NOTE_MUTATION = `
    mutation($title: String!, $image: String!, $content: String!, $latitude: Float!, $longitude: Float!) {
        createNote(input: {
            title: $title,
            image: $image,
            content: $content,
            latitude: $latitude,
            longitude: $longitude
        }) {
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
        }
    }
`

export const DELETE_NOTE_MUTATION = `
    mutation($noteId: ID!) {
        deleteNote(noteId: $noteId) {
            _id
        }
    }
`

export const CREATE_COMMENT_MUTATIOM = `
    mutation($noteId: ID!, $text: String!) {
        createComment(noteId: $noteId, text: $text) {
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