import { auth, db } from "../firebase";

// Mock Firebase modules
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({})),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({})),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
}));

describe("firebase", () => {
  it("exports auth and db", () => {
    expect(auth).toBeDefined();
    expect(db).toBeDefined();
  });
});