import { describe, test, beforeEach, expect } from "vitest";
import authReducer, { logout, loginUser } from "./authSlice";

describe("authSlice", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("Connexion utilisateur", () => {
    const initialState = {
      user: null,
      token: null,
      status: "waiting",
      error: null,
    };

    const fakePayload = {
      user: { id: 1, username: "Jordan", role: "admin" },
      token: "fake-Token",
    };

    const action = {
      type: loginUser.fulfilled.type,
      payload: fakePayload,
    };
    const newState = authReducer(initialState, action);

    expect(newState.user).toEqual(fakePayload.user);
    expect(newState.status).toBe("success");
    expect(newState.token).toBe(fakePayload.token);
  });

  test("Deconnexion utilisateur", () => {
    const initialState = {
      user: { id: 1, username: "Jordan", role: "admin" },
      token: "fake-Token",
    };

    const newState = authReducer(initialState, logout())

    expect(newState.user).toBeNull();
    expect(newState.token).toBeNull();
  });

  test("Connexion refusée", () =>{
    const initialState = {
        user: null,
        token: null,
        status: "pending",
        error: null,
    };

     const action = {
      type: loginUser.rejected.type,
      payload: "Identifiants incorrects",
    };

    const newState = authReducer(initialState, action);
    expect(newState.status).toBe("error");
    expect(newState.error).toBe('Identifiants incorrects');

  })
});
