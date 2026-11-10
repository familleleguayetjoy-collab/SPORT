# La Course du Poids

Application Android (installable en .apk) pour suivre une perte de poids sous forme de **course à pied gamifiée**.

Objectif par défaut : passer de **72,25 kg à 70,0 kg** entre le 10/11/2026 et le 18/12/2026 (39 jours), soit un déficit cible de **444 kcal/jour**. Tout est modifiable dans les réglages.

## Fonctionnalités

- Saisie quotidienne en quelques secondes : type de journée (Cabinet / Cabinet + muscu / Cabinet + course / Libre), bonus d'activité cumulables, répartition des repas (Midi / 16h / Soir ou journée entière), pesée optionnelle.
- **Notification quotidienne à 21h30** (heure réglable), 100% locale sur le téléphone — aucun compte, aucun serveur.
- Jour validé en déficit → confettis et message positif. Objectif raté → message bienveillant avec 2-3 solutions de rattrapage classées de la plus rapide à la plus longue.
- Calendrier tapable pour rattraper un jour oublié.
- Écran Progrès : comparatif Plan / Théorique / Réel, course à pied animée à 3 coureurs (toi, ton fantôme théorique, le lièvre du plan) sur un semi-marathon de 21,1 km, niveaux à chaque palier de 250 g, graphique d'évolution, badges.
- Toutes les données restent uniquement sur le téléphone (`localStorage`), aucune connexion réseau utilisée par l'appli.

## Récupérer le fichier .apk

Ce dépôt build automatiquement l'APK via GitHub Actions à chaque push sur `app/`.

1. Va dans l'onglet **Actions** du dépôt GitHub.
2. Ouvre le run le plus récent du workflow **Build Android APK**.
3. En bas de la page du run, section **Artifacts**, télécharge `deficit-tracker-debug-apk` (fichier .zip).
4. Dézippe : tu obtiens `app-debug.apk`.

## Installer sur ton téléphone Android

1. Transfère `app-debug.apk` sur ton téléphone (Drive, mail, câble USB...).
2. Ouvre le fichier depuis ton téléphone. Android va demander d'autoriser l'installation depuis cette source (**Paramètres > Autoriser l'installation d'applications inconnues** pour l'appli utilisée, ex. Fichiers/Drive/Chrome) — accepte.
3. Installe. Lance l'appli.
4. Accepte la **permission de notifications** quand elle est demandée (pour le rappel de 21h30).
5. Pour une fiabilité maximale du rappel (que le téléphone ne "tue" pas la notification) : va dans **Paramètres > Batterie > La Course du Poids** et désactive l'optimisation de batterie / autorise l'activité en arrière-plan.

C'est une application 100% locale : il n'y a pas de compte à créer, rien à configurer côté serveur.

## Développement

L'appli est un unique fichier statique `app/www/index.html` (HTML/CSS/JS vanilla, aucune dépendance de build). Pour prévisualiser dans un navigateur :

```bash
cd app
npm install
npm run dev   # sert www/ sur http://localhost:3000
```

Après une modification, édite directement `app/www/index.html`, puis :

```bash
npx cap sync android   # copie www/ vers le projet Android
```

Puis pousse sur la branche : GitHub Actions rebuild l'APK automatiquement. (Il n'y a pas de SDK Android dans cet environnement de développement, donc le build Android se fait uniquement via CI ou sur ta propre machine avec Android Studio.)

### Build APK en local (si tu as Android Studio)

```bash
cd app
npx cap open android   # ouvre Android Studio, ou:
cd android && ./gradlew assembleDebug
```

L'APK est généré dans `app/android/app/build/outputs/apk/debug/app-debug.apk`.

## Stack technique

- HTML/CSS/JS vanilla (`app/www/index.html`) — aucun framework, aucun bundler.
- [Capacitor](https://capacitorjs.com/) pour l'emballage Android natif.
- `@capacitor/local-notifications` pour le rappel quotidien programmé sur l'appareil (aucun serveur), via les plugins globaux `window.Capacitor.Plugins` exposés nativement — pas besoin d'import JS.
- `localStorage` pour le stockage local des données.
