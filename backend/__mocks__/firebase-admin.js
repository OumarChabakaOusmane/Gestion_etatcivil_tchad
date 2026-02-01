// Mock Firebase Admin avec Persistance en Mémoire chainable et Logs
let store = {};

const createQueryWithResults = (results, col) => {
    const query = {
        get: jest.fn(() => {
            // console.log(`[Mock DB] GET on ${col} returns ${results.length} docs`);
            return Promise.resolve({
                empty: results.length === 0,
                docs: results.map(d => ({
                    id: d.id,
                    data: () => d
                })),
                forEach: (cb) => results.forEach(d => cb({ id: d.id, data: () => d })),
                size: results.length
            });
        }),
        limit: jest.fn(() => query),
        orderBy: jest.fn(() => query),
        where: jest.fn((field, op, val) => {
            // console.log(`[Mock DB] WHERE on ${col}: ${field} ${op} ${val}`);
            const filtered = results.filter(d => {
                if (op === '==') return d[field] === val;
                if (op === '!=') return d[field] !== val;
                return true;
            });
            return createQueryWithResults(filtered, col);
        })
    };
    return query;
};

const mockFirestore = {
    settings: jest.fn(),
    collection: jest.fn((col) => {
        const colApi = {
            _col: col,
            where: (field, op, val) => {
                const allDocs = Object.values(store[col] || {});
                const filtered = allDocs.filter(d => {
                    if (op === '==') return d[field] === val;
                    return true;
                });
                return createQueryWithResults(filtered, col);
            },
            add: jest.fn((data) => {
                const id = 'id_' + Math.random().toString(36).substr(2, 9);
                if (!store[col]) store[col] = {};
                const docData = { ...data, id };
                store[col][id] = docData;
                // console.log(`[Mock DB] ADD to ${col} with ID ${id}`);
                return Promise.resolve({ id });
            }),
            doc: jest.fn((id) => ({
                get: jest.fn(() => {
                    const data = store[col] ? store[col][id] : null;
                    return Promise.resolve({
                        exists: !!data,
                        id,
                        data: () => data
                    });
                }),
                set: jest.fn((data) => {
                    if (!store[col]) store[col] = {};
                    store[col][id] = { ...data, id };
                    return Promise.resolve();
                }),
                update: jest.fn((data) => {
                    if (store[col] && store[col][id]) {
                        store[col][id] = { ...store[col][id], ...data };
                    }
                    return Promise.resolve();
                }),
                delete: jest.fn(() => {
                    if (store[col]) delete store[col][id];
                    return Promise.resolve();
                })
            })),
            get: jest.fn(() => {
                const allDocs = Object.values(store[col] || {});
                return createQueryWithResults(allDocs, col).get();
            }),
            limit: jest.fn(() => colApi),
            orderBy: jest.fn(() => colApi)
        };
        return colApi;
    })
};

const mockAuth = {
    createUser: jest.fn((data) => Promise.resolve({ uid: 'uid_' + data.email })),
    getUserByEmail: jest.fn((email) => {
        return Promise.reject({ code: 'auth/user-not-found' });
    }),
    verifyIdToken: jest.fn(() => Promise.resolve({ uid: 'mock-uid' }))
};

const mockAdmin = {
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
    firestore: jest.fn(() => mockFirestore),
    auth: jest.fn(() => mockAuth),
    apps: [],
    __resetBase: () => { store = {}; },
    __getStore: () => store
};

module.exports = mockAdmin;
