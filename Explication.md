# CommunityHub — Documentation Technique

## Présentation du projet

CommunityHub est une plateforme communautaire permettant à des membres premium de créer des événements, proposer leurs compétences, échanger des messages privés et développer leur réseau professionnel.

---

## Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| React | 18 | Framework UI |
| Vite | 5 | Bundler et serveur de développement |
| Redux Toolkit | 2 | Gestion d'état global |
| React Router DOM | 6 | Routing côté client |
| React Bootstrap | 2 | Composants UI |
| React Hook Form | 7 | Gestion des formulaires |
| Yup | 1 | Validation des schémas de formulaires |
| @hookform/resolvers | 3 | Relation entre React Hook Form et Yup |

---

## Architecture du projet

```
src/
├── app/
│   └── store.js              # Configuration du store Redux
├── features/                 # Slices Redux par domaine métier
│   ├── auth/                 # Authentification
│   ├── contacts/             # Gestion des contacts
│   ├── events/               # Événements et catégories
│   ├── messages/             # Messagerie privée
│   ├── payments/             # Paiements premium
│   ├── skills/               # Compétences
│   ├── theme/                # Thème clair/sombre
│   └── users/                # Liste des utilisateurs
├── pages/                    # Pages de l'application
├── components/               # Composants réutilisables
│   ├── events/               # EventCard, EventDetail
│   ├── skills/               # SkillCard
│   └── layout/               # Navbar, ProtectedRoute
├── api/
│   └── apiClient.js          # Client HTTP centralisé
└── router/
    └── Router.jsx            # Configuration des routes
```

---

## Choix techniques

### React

React a été choisi pour sa popularité en entreprise, son écosystème mature et sa compatibilité avec les outils modernes (Vite, Redux Toolkit). L'approche par composants permet de découper l'interface en unités réutilisables et maintenables — par exemple, `EventCard` est utilisé à la fois sur `EventsPage` et dans le Dashboard, `SkillCard` sur `SkillsPage` et la `HomePage`.

### Vite

Vite remplace Create React App pour ses performances de build et son serveur de développement ultra-rapide grâce au Hot Module Replacement (HMR). Il supporte nativement les variables d'environnement via `.env` avec le préfixe `VITE_`.

### Redux Toolkit

Redux Toolkit a été retenu pour la gestion d'état global pour plusieurs raisons :

**Pourquoi un état global ?**
Plusieurs composants distants dans l'arborescence ont besoin des mêmes données : l'utilisateur connecté (`user`) est consommé dans la Navbar, le Dashboard, les pages Events, la page Détail. Sans état global, il faudrait passer ces données en props à travers plusieurs niveaux, ce qui rend le code difficile à maintenir.

**Pourquoi Redux Toolkit plutôt que Context API ?**
Context API est adapté aux états simples et peu fréquemment mis à jour (thème, langue). Redux Toolkit est préférable dès que l'application gère plusieurs domaines métier avec des appels API asynchrones. Redux Toolkit intègre nativement `createAsyncThunk` pour les appels API et Immer pour les mutations d'état immutables.

**Structure des slices**
Chaque domaine métier a son propre slice avec un `initialState` cohérent :
```js
const initialState = {
    list: [],      // données principales
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
}
```
Le statut permet d'afficher des spinners pendant le chargement et des messages d'erreur en cas d'échec, sans état local supplémentaire.

**Pattern thunk + refetch**
Après une action transformante (ajout, acceptation), on redéclenche le `fetch` correspondant plutôt que de manipuler le state manuellement. Exemple : après `acceptContact`, on dispatch `fetchContacts()`. L'API est la source de vérité - le front ne fait que refléter son état.

### React Router DOM v6

React Router v6 permet de définir des routes imbriquées avec un layout partagé (`MainLayout` contenant la Navbar). Les routes protégées sont gérées via un composant `ProtectedRoute` qui vérifie la présence d'un token en localStorage et redirige vers `/login` si absent.

**Routes publiques vs protégées**
- Routes publiques : `/`, `/login`, `/register`, `/contact`, `/events`, `/events/:id`, `/skills`
- Routes protégées : `/dashboard`, `/events/create`

La page de détail d'un événement est volontairement publique - tout le monde peut voir un événement. Les actions à l'intérieur (s'inscrire, laisser un message) sont conditionnées côté composant selon le statut de l'utilisateur.

### React Hook Form + Yup

React Hook Form gère les formulaires sans re-render à chaque frappe (mode "uncontrolled"), ce qui améliore les performances. Yup fournit les schémas de validation déclaratifs et lisibles.

**Validation conditionnelle avec `.when()`**
Le formulaire de création d'événement utilise la validation conditionnelle Yup pour le champ `price` — il n'est requis que si `price_type === "payant"` :
```js
price: yup.number().when("price_type", {
    is: "payant",
    then: (schema) => schema.positive().required(),
    otherwise: (schema) => schema.nullable().optional(),
})
```

**Validation croisée avec `.test()`**
La date de fin ne peut pas être antérieure à la date de début — validée avec `.test()` qui accède aux autres champs via `this.parent`.

### Client HTTP centralisé (apiClient.js)

Tous les appels API passent par `apiRequest()`, une fonction centralisée qui :
- Injecte automatiquement le header `X-Project-Key` depuis les variables d'environnement
- Injecte le token d'authentification depuis localStorage si présent
- Lève une erreur si la réponse HTTP n'est pas OK
- Retourne directement le JSON parsé

Cette centralisation évite la duplication de code dans chaque thunk et facilite les évolutions (ajout d'un intercepteur, changement de base URL).

### React Bootstrap

React Bootstrap a été choisi pour sa compatibilité native avec React (pas de jQuery), son système de grille responsive (`Row`/`Col`) et ses composants prêts à l'emploi (Modal, Tab, Badge, Alert). Il intègre le thème Bootstrap 5 avec support du mode sombre via `data-bs-theme`.

---

## Sécurité et gestion des accès

**Authentification par token**
L'API retourne un token JWT à la connexion, stocké en localStorage. Ce token est envoyé dans le header `X-Auth-Token` à chaque requête. À la déconnexion, le token et les données utilisateur sont supprimés du localStorage et du state Redux.

**Protection des routes**
Le composant `ProtectedRoute` vérifie la présence du token Redux avant de rendre les routes enfants. Si absent, l'utilisateur est redirigé vers `/login`.

**Accès premium côté front**
Les fonctionnalités premium (création d'événement, ajout de compétence, inscription aux événements) sont conditionnées par `user.is_premium` côté composant. La vraie protection reste côté API — le front ne fait qu'adapter l'interface.

**Accès admin**
L'onglet Administration du Dashboard n'est rendu que si `user.user_status_id === 3`. Même principe — la sécurité réelle est assurée par l'API.

---

## Patterns réutilisables

**Composants "card" découplés**
`EventCard` et `SkillCard` reçoivent leurs données en props et n'ont aucune dépendance Redux — ils sont purement présentationnels. Cela permet de les utiliser dans plusieurs contextes (listing public, dashboard, homepage) sans duplication.

**Feedback utilisateur par entité**
Pour les actions asynchrones en liste (ex : ajouter un contact depuis la Communauté), un state local `{ [userId]: 'sending' | 'sent' | 'error' }` gère l'état de chaque bouton indépendamment, sans bloquer les autres.

**Debounce sur la recherche**
Le filtre texte des événements utilise un debounce de 400ms (`setTimeout` + `clearTimeout` dans un `useEffect`) pour éviter une requête API à chaque frappe.

---

## Variables d'environnement

```env
VITE_API_URL=https://qyklv804.webmo.me/communityhub_api
VITE_PROJECT_KEY=XXXXX
```

La clé projet est obligatoire sur tous les endpoints API via le header `X-Project-Key`. Elle permet à l'API de distinguer les projets de différents apprenants sur le même serveur.

---


