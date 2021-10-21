import { init, request } from '../helpers';
import { createUser, mockUser, mockUserAuthSign } from '../helpers/database';

beforeAll(async () => {
  await init();
});

describe('Querie user(address)', () => {
  it('Should return null if there are no users for a given address', async () => {
    const address = 'AddressNonExist';
    const resp = await request
      .post('/')
      .send({
        query: `{ user(address:"${address}"){ id, name} }`,
      })
      .set('chain-id', String(mockUser.chainId))
      .set('auth-signature', mockUserAuthSign)
      .expect(200);

    expect(resp.body).toEqual({
      data: {
        user: null,
      },
    });
  });

  it('Should return stored user', async () => {
    await createUser();

    const resp = await request
      .post('/')
      .send({
        query: `{ user(address:"${mockUser.address}"){ id, name, username, twitter, chainId, address } }`,
      })
      .set('chain-id', String(mockUser.chainId))
      .set('auth-signature', mockUserAuthSign)
      .expect(200);

    expect(resp.body).toEqual(
      {
        data: {
          user: {
            id: '1337:0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            name: 'fakeName',
            username: 'fakeUsername',
            twitter: '@fakeTwitter',
            chainId: 1337,
            address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          },
        },
      });
  });
});
