import { describe, test, expect, beforeEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";

/*
Outils de test : 
import { describe, test, expect } from 'vitest';

describe : Permet de regrouper plusieurs tests
test : définit un test unitaire. Alias possible : it
expect : permet de vérifier le résultat attendu
beforeEach : exécute du code avant chaque test

Autres outils disponibles :
afterEach : exécute du code après chaque test
beforeAll : exécute du code une seule fois avant les tests
afterAll : exécute du code une seule fois après les tests
...

Résultats :
toBe : comparaison stricte
toEqual : compare deux objets ou tableaux
toBeNull : la valeur doit être null
toBeTrusthy : la valeur doit être true
toBeFalsy : la valeur doit être false
toContain : doit contenir une valeur dans un tableau ou dans une chaine
...

Les outils React Testing library :
render : Afficher un component
screen : Permet de rechercher des éléments 
userEvent : Simule un comportement utilisateur
                await user.click(button)
...
*/

function renderWithStore(authState) {
  const store = configureStore({
    reducer: {
      auth: () => authState,
    },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<h1>Dashboard</h1>} />
          </Route>
          <Route path="/login" element={<h1>Page login</h1>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe("Test ProtectedRoute", () => {
  beforeEach(() => {
    cleanup();
  });

  test("Affiche la page Dashboard si user est connecté", () => {
    const userConnect = {
        user: { id: 1, username: 'Jordan'},
        token: 'fake-token',
    };

    renderWithStore(userConnect);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
