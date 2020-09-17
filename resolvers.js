const { AuthenticationError, PubSub } = require("apollo-server")
const Note = require('./models/Note')

const pubsub = new PubSub()
const NOTE_ADDED = 'NOTE_ADDED'
const NOTE_DELETED = 'NOTE_DELETED'
const NOTE_UPDATED = 'NOTE_UPDATED'

const authenticated = next => (root, args, ctx, info) => {
    if (!ctx.currentUser) {
        throw new AuthenticationError('You must be loged in')
    }
    return next(root, args, ctx, info)
}

module.exports = {
    Query: {
        me: authenticated((root, args, ctx) => ctx.currentUser),
        getNotes: async (root, args, ctx) => {
            const notes = await Note.find({}).populate('author').populate('comments.author')
            return notes
        }
    },
    Mutation: {
        createNote: authenticated(async (root, args, ctx) => {
            const newNote = await new Note({
                ...args.input,
                author: ctx.currentUser._id
            }).save()
            const noteAdded = await Note.populate(newNote, 'author')
            pubsub.publish(NOTE_ADDED, { noteAdded })
            return noteAdded
        }),
        deleteNote: authenticated(async (root, args, cxt) => {
            const noteDeleted = await Note.findByIdAndDelete({ _id: args.noteId }).exec()
            pubsub.publish(NOTE_DELETED, { noteDeleted })
            return noteDeleted
        }),
        createComment: authenticated(async (root, args, ctx) => {
            const newComment = { text: args.text, author: ctx.currentUser._id }
            const noteUpdated = await Note.findByIdAndUpdate(
                { _id: args.noteId },
                { $push: { comments: newComment } },
                { new: true }
            ).populate("author").populate("comments.author")
            pubsub.publish(NOTE_UPDATED, { noteUpdated })
            return noteUpdated
        })
    },
    Subscription: {
        noteAdded: {
            subscribe: () => pubsub.asyncIterator(NOTE_ADDED)
        },
        noteDeleted: {
            subscribe: () => pubsub.asyncIterator(NOTE_DELETED)
        },
        noteUpdated: {
            subscribe: () => pubsub.asyncIterator(NOTE_UPDATED)
        }
    }
}


