export const ME_QUERY = `
{
  me {
    _id
    name
    email
    picture
  }
}
`

export const GET_NOTES_QUERY = `
{
  getNotes {
    _id
    createdAt
    title
    content
    image
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
        _id
        name
        picture
      }
    }

  }
}
`