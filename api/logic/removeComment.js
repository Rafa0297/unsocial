import { User, Post } from 'dat'
import { validate, errors } from "com"
const { SystemError, NotFoundError, OwnershipError } = errors

export default (userId, postId, commentId) => {
  validate.id(userId, 'userId')
  validate.id(postId, 'postId')
  validate.id(commentId, 'commentId')

  return Promise.all([
    User.findById(userId),
    Post.findById(postId)
  ])
    .catch(error => { new SystemError(error.message) })
    .then(([user, post]) => {
      if (!user) throw new NotFoundError('user not found')
      if (!post) throw new NotFoundError('post not found')

      const comment = post.comments.id(commentId)

      if (!comment) throw new NotFoundError('comment not found')

      if (!comment.author.equals(userId)) throw new OwnershipError('user is not author of comment')

      comment.deleteOne({ _id: commentId })

      return post.save()
        .catch(error => { new SystemError(error.message) })
    })
    .then(_ => { })
}