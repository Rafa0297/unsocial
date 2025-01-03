import 'dotenv/config'

import * as chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
const { expect } = chai
import db, { User, Post, Comment } from "dat"
import { errors } from 'com'

const { NotFoundError, OwnershipError, SystemError, ValidationError } = errors
import removeComment from "./removeComment.js"


describe('removeComment', () => {
  before(() => db.connect(process.env.MONGO_URL_TEST))

  beforeEach(() => Promise.all([User.deleteMany(), Post.deleteMany()]))

  it('succeeds for existing user', () => {
    const user = new User({ name: 'Coco Loco', email: 'coco@loco.com', username: 'cocoloco', password: '123123123' })
    const comment = new Comment({ author: user.id, text: 'hello comment' })
    const post = new Post({ author: user.id, image: 'https://www.image.com', text: 'hello world', comments: [comment] })

    return Promise.all([user.save(), post.save()])
      .then(([user, post]) =>
        removeComment(user.id, post.id, post.comments[0].id)
          .then(() => Post.findOne())
          .then(post => {
            expect(post).to.exist
            expect(post.comments).to.have.lengthOf(0)
          })
      )
  })

  it('fails on non-existing user', () =>
    expect(
      removeComment('012345678901234567890123', '012345678901234567890123', '012345678901234567890123')
    ).to.be.rejectedWith(NotFoundError, /^user not found$/)
  )

  it('fails on non-existing Post', () => {
    const user = new User({ name: 'Coco Loco', email: 'coco@loco.com', username: 'cocoloco', password: '123123123' })

    return expect(Promise.all([user.save()])
      .then(([user]) =>
        removeComment(user.id, '012345678901234567890123', '012345678901234567890123')
      )).to.be.rejectedWith(NotFoundError, /^post not found$/)
  })

  it('fails on non-existing comment', () => {
    const user = new User({ name: 'Coco Loco', email: 'coco@loco.com', username: 'cocoloco', password: '123123123' })
    const post = new Post({ author: user.id, image: 'https://www.image.com', text: 'hello world' })

    return expect(Promise.all([user.save(), post.save()])
      .then(([user, post]) =>
        removeComment(user.id, post.id, '012345678901234567890123')
      )).to.be.rejectedWith(NotFoundError, /^comment not found$/)
  })

  it('fails on not-own comment', () => {
    const user = new User({ name: 'Coco Loco', email: 'coco@loco.com', username: 'cocoloco', password: '123123123' })
    const user2 = new User({ name: 'Coco Liso', email: 'coco@liso.com', username: 'cocoliso', password: '123123123' })
    const comment = new Comment({ author: user.id, text: 'hello comment' })
    const post = new Post({ author: user.id, image: 'https://www.image.com', text: 'hello world', comments: [comment] })

    return expect(Promise.all([user.save(), user2.save(), post.save()])
      .then(([user, user2, post]) =>
        removeComment(user2.id, post.id, post.comments[0].id)
      )).to.be.rejectedWith(OwnershipError, /^user is not author of comment$/)
  })

  after(() => db.disconnect())
})
