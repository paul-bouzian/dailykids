<div align="center">
  <img src="public/dailykids-banner.png" alt="DailyKids" width="180" />

  # DailyKids

  **Routines et tâches quotidiennes pour les enfants, gérées en famille.**

  Une PWA installable, joyeuse et 100 % offline, pensée pour la tablette familiale.

  <p>
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
    <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
    <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwind-css&logoColor=white" />
    <img alt="PWA" src="https://img.shields.io/badge/PWA-installable-5A0FC8" />
    <img alt="License" src="https://img.shields.io/badge/license-MIT-green" />
  </p>
</div>

---

## ✨ L'idée

Beaucoup d'apps mobiles permettent aux parents de gérer les routines de leurs enfants sous forme de petites cartes à cocher. **DailyKids** reprend cette idée, mais en **PWA** : une seule URL, installable sur n'importe quelle tablette (iOS ou Android), aucune dépendance à un store, et toutes les données restent en local sur l'appareil.

Conçu pour une famille, **mono-tablette**, **offline-first**, **kid-friendly** : grosses zones tactiles, couleurs vives, animations spring, confettis et étoiles à chaque tâche validée.

## 🎯 Fonctionnalités

### 🦊 Onglet Tâches — pour les enfants
- Une colonne par enfant, scroll horizontal fluide même avec 5 enfants ou plus
- Chaque enfant a sa **mascotte** (emoji animal) et sa **couleur**
- Bascule **automatique** journée ☀️ / soir 🌙 selon un seuil horaire configurable (les enfants ne peuvent pas la changer)
- Tap sur une tâche → check vert, barré, glissement vers le bas, **confettis**, **vibration** tablette, **son**, +1 ⭐
- Tâches assignables matin, soir, ou les deux

### 🗓️ Onglet Calendrier — pour la famille
- Vue mois complète, lundi → dimanche, jours hors-mois grisés
- Swipe gauche / droite pour naviguer entre les mois (≤ 3 mois en DOM, jamais de lag)
- Création d'événement avec emoji, label, date, **récurrence hebdo / mensuelle**, et **enfants concernés** (multi-sélection)
- La pastille d'événement prend la couleur de l'enfant concerné (gris si général)
- Tap sur un jour → modal détail avec liste des événements et suppression rapide

### 🛡️ Onglet Parents — pour l'admin
Verrouillé par un **code PIN à 4 chiffres** (par défaut `0000`), avec **auto-lock** dès qu'on quitte l'onglet.

- Gestion des enfants (ajout, modif, suppression, **drag-to-reorder**)
- Gestion des tâches (assignation à plusieurs enfants, journée/soir/les deux)
- Récompenses configurables (objectifs en étoiles)
- Statistiques par enfant : étoiles totales, complétions sur 7 et 30 jours, mini graphique journalier
- Paramètres : code PIN, seuil journée/soir, nombre d'étoiles par tâche, **export / import JSON** complet de la base

## 🛠️ Stack

| Domaine | Choix |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) |
| Langage | **TypeScript 5** |
| UI | **Tailwind CSS v4** + composants maison |
| Animations | **motion (framer-motion v12)** + canvas-confetti |
| Police | **Fredoka** (Google Fonts), ronde et lisible |
| Icônes | **lucide-react** + emojis Unicode |
| Stockage | **IndexedDB via Dexie.js** — offline-first, zéro backend |
| PWA | manifest natif Next.js + service worker custom (offline + cache) |
| Hébergement | Vercel (free tier) |

## 🚀 Démarrage rapide

```bash
git clone https://github.com/paul-bouzian/dailykids.git
cd dailykids
npm install
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000).

### Sur tablette

1. Déployer (Vercel, etc.) ou exposer le serveur dev sur le réseau local
2. Ouvrir l'URL dans Chrome (Android) ou Safari (iOS)
3. Menu navigateur → **« Ajouter à l'écran d'accueil »** / **« Installer l'app »**
4. L'icône apparaît, l'app s'ouvre en plein écran sans barre d'URL

### Build de production

```bash
npm run build
npm run start
```

## 🎨 Régénérer les icônes PWA

Les icônes (192, 512, maskable, apple-touch-icon) sont générées depuis `public/dailykids-banner.png` :

```bash
node scripts/generate-icons.mjs
```

## 🗄️ Architecture des données

Tout est stocké en **IndexedDB** sur l'appareil. Aucune donnée ne quitte la tablette.

```
children        → enfants (nom, mascotte, couleur, ordre, étoiles)
tasks           → tâches (label, emoji, périodes, enfants assignés)
completions     → historique des validations (par enfant, par jour, par période)
events          → événements calendrier (date, récurrence, enfants concernés)
rewards         → récompenses configurables
settings        → PIN, seuil jour/nuit, étoiles par tâche
```

Le reset quotidien des tâches s'effectue automatiquement à minuit (et au chargement si la date a changé).

## 📁 Structure

```
src/
├── app/
│   ├── layout.tsx           # Shell global
│   ├── manifest.ts          # Manifest PWA
│   ├── tasks/page.tsx       # Onglet tâches (default)
│   ├── calendar/page.tsx    # Onglet calendrier
│   └── parents/page.tsx     # Onglet parents
├── components/
│   ├── shell/               # Bottom tabs, AppShell, service worker
│   ├── tasks/               # Board, colonnes, cartes, animations
│   ├── calendar/            # Grille mois, modales événement
│   ├── parents/             # PIN lock, CRUD, stats, paramètres
│   └── ui/BottomSheet.tsx   # Drawer animé réutilisable
└── lib/
    ├── db.ts                # Schéma Dexie + seed
    ├── reset-scheduler.ts   # Reset auto à minuit
    ├── confetti.ts          # Confettis + son + vibration
    ├── day-night.ts         # Bascule auto journée/soir
    └── recurrence.ts        # Expansion des événements récurrents
```

## 🔒 Vie privée

- **Aucun backend, aucune analytics, aucun tracker.**
- Toutes les données restent dans le navigateur de l'appareil (IndexedDB).
- Sauvegarde manuelle via **export JSON** dans les paramètres parents.
- Code source ouvert, auditable.

## 📄 Licence

MIT — voir [LICENSE](LICENSE).

---

<div align="center">
  Fait avec 🐻 pour les routines familiales sereines.
</div>
