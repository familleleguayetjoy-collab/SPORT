# Déficit Tracker

Application Android (installable en .apk) pour suivre un objectif de perte de poids sous forme de **déficit calorique cumulé**.

Objectif par défaut : perdre **5,5 kg**, soit **42 350 kcal** de déficit à accumuler (1 kg ≈ 7700 kcal).

## Fonctionnalités

- **Notification quotidienne à 21h30** (heure réglable) qui demande si tu as été en déficit et te fait saisir le montant.
- Notification **100% locale sur le téléphone** : pas de compte, pas de serveur, pas de Firebase. Elle s'affiche même si l'appli est fermée.
- Si un soir est oublié, l'appli détecte le(s) jour(s) manqué(s) au prochain lancement et te fait défiler chaque jour à renseigner.
- Tableau de bord avec anneau de progression, kg perdus, streak (jours de suite en déficit), historique récent.
- Graphiques (progression cumulée + détail quotidien) pour se motiver.
- Toutes les données restent uniquement sur le téléphone (aucune connexion réseau utilisée par l'appli).

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
4. Au premier lancement : renseigne ton objectif (kg) et l'heure du rappel, puis accepte la **permission de notifications** quand elle est demandée.
5. Pour une fiabilité maximale du rappel (que le téléphone ne "tue" pas la notification) : va dans **Paramètres > Batterie > Déficit Tracker** et désactive l'optimisation de batterie / autorise l'activité en arrière-plan.

C'est une application 100% locale : il n'y a pas de compte à créer, rien à configurer côté serveur.

## Développement

```bash
cd app
npm install
npm run dev        # aperçu web sur http://localhost:5173
```

Après une modification :

```bash
npm run build       # build web
npx cap sync android # copie les assets vers le projet Android
```

Puis pousse sur la branche : GitHub Actions rebuild l'APK automatiquement. (Il n'y a pas de SDK Android dans cet environnement de développement, donc le build Android se fait uniquement via CI ou sur ta propre machine avec Android Studio.)

### Build APK en local (si tu as Android Studio)

```bash
cd app
npm run build
npx cap open android   # ouvre Android Studio, ou:
cd android && ./gradlew assembleDebug
```

L'APK est généré dans `app/android/app/build/outputs/apk/debug/app-debug.apk`.

## Stack technique

- React + TypeScript + Vite pour l'interface.
- [Capacitor](https://capacitorjs.com/) pour l'emballage Android natif.
- `@capacitor/local-notifications` pour le rappel quotidien programmé sur l'appareil (aucun serveur).
- `@capacitor/preferences` pour le stockage local des données.
- Recharts pour les graphiques.
