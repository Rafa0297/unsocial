import 'dotenv/config'

import * as chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiAsPromised)
const { expect } = chai

import db, { User } from "dat";
import { errors } from 'com'

const { NotFoundError } = errors

import getUserName from "./getUserName.js";

describe('getUserName', () => {
  before(() => db.connect(process.env.MONGO_URL_TEST))

  beforeEach(() => User.deleteMany())

  it('succeeds on existing user', () =>
    User.create({
      name: 'Coco Loco',
      email: 'coco@loco.com',
      username: 'cocoloco',
      password: '123123123'
    })
      .then(user => getUserName(user.id, user.id))
      .then(name => expect(name).to.equal('Coco Loco'))
  )

  it('fails on non-existing user', () =>
    expect(
      getUserName('012345678901234567890123', '012345678901234567890123')
    ).to.be.rejectedWith(NotFoundError, 'user not found')
  )

  it('fails on non-existing target-user', () =>
    expect(
      User.create({ name: 'Coco Loco', email: 'coco@loco.com', username: 'cocoloco', password: '123123123' })
        .then(user => getUserName(user.id, '012345678901234567890123'))
    ).to.be.rejectedWith(NotFoundError, 'target user not found')
  )

  after(() => db.disconnect())

})

// db.connect('mongodb://127.0.0.1:27017/unsocial-test')
//   .then(() => {
//     try {
//       return getUserName('67352702c7fb739a4ddf586a', '67352702c7fb739a4ddf586a')
//         .then(console.log)
//         .catch(console.error)
//     } catch (error) {
//       console.error(error)
//     }
//   })
//   .catch(console.error)
//   .finally(() => db.disconnect())