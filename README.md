# Mini-jeu Tagada

Petit jeu en HTML + Canvas vanilla (aucune dépendance) pour l'atelier 1 à Bully, le 21 mai 2026.

## Lancement

Double-cliquer sur `index.html` ou ouvrir dans Chrome / Firefox / Safari.

Aucune installation. Tout est local — fonctionne sans Internet.

## Mécanique

Grille **6×6**. Tagada doit :
1. Collecter les **3 étoiles** (ordre libre)
2. Arriver sur le **pot de peinture**
3. **Sans repasser deux fois sur la même case** (les cases déjà parcourues s'affichent en rose pâle pendant l'exécution).
4. En **le moins de coups possible** (l'objectif est affiché à côté du compteur)

Si Tagada se cogne dans un nuage, sort de la grille, **ou repasse sur une case déjà visitée** → **bug**, le programme s'arrête.

## Contrôles

On construit d'abord le programme (suite d'instructions) puis on clique sur **Exécuter** pour le voir tourner d'un coup. Chaque clic / touche ajoute une ligne à droite, l'animation ne démarre qu'à l'exécution.

| Touche | Action |
|---|---|
| ↑ ou Z/W | ajouter HAUT au programme |
| ↓ ou S/X | ajouter BAS au programme |
| ← ou Q/A | ajouter GAUCHE au programme |
| → ou D | ajouter DROITE au programme |
| Espace | EXÉCUTER le programme |
| R | RECOMMENCER (vide le programme et remet Tagada au départ) |
| 1 à 5 | changer de plateau |
| F | plein écran |

Clic sur une ligne du programme → la supprime (utile pour corriger).

## Plateaux

5 plateaux **iso-difficiles** (chemin optimal ~10 pas, 4-5 obstacles, 3 étoiles). Ils correspondent exactement aux **5 plateaux papier A3** distribués aux 5 équipes (cf. `../imprimables/`). Si on modifie ici, modifier les impressions en cohérence.

| # | Tagada | Départ | Pot | Optimal | Objectif coups |
|---|---|---|---|---|---|
| 1 | rose | haut-gauche | bas-droite | 22 | moins de 26 |
| 2 | bleue | haut-droite | bas-gauche | 20 | moins de 24 |
| 3 | jaune | bas-gauche | haut-droite | 20 | moins de 24 |
| 4 | verte | bas-droite | haut-gauche | 20 | moins de 24 |
| 5 | violette | milieu-gauche | milieu-droite | 18 | moins de 22 |

L'objectif coups est recalculé automatiquement (DFS avec contrainte « pas de revisite », voir `computeOptimalSteps` dans `game.js`) à partir du chemin optimal + 4 coups de marge.

## Présentation du code (5-10 min en fin d'atelier)

Ouvrir `mini-jeu-tagada/` dans VS Code et montrer trois endroits à la classe :

1. **`levels.js`** — *« Les 5 plateaux, c'est juste du texte. On dit où est Tagada, où est le pot, où sont les étoiles et les nuages. »*
2. **`game.js` → fonction `applyInstruction`** (ligne ~512) — *« Quand vous cliquez sur une flèche, c'est cette fonction qui décide ce qui se passe. Elle dit : la nouvelle case est-elle libre ? S'il y a un nuage, c'est un bug. »*
3. **`game.js` → fonction `animateTo`** (ligne ~480) — *« Pour que Tagada glisse doucement plutôt que de sauter de case en case, on recalcule sa position 60 fois par seconde. C'est ça l'animation. »*

But : pas un cours de JS, juste rendre concret que **le jeu, c'est du texte qu'on écrit**.

## Modifier un plateau

Tout est dans `levels.js`. Format :

```js
{
  name: 'Plateau N — Titre',
  start: { col: 0, row: 0, dir: 1 },  // dir : 0=haut, 1=droite, 2=bas, 3=gauche
  pot:   { col: 5, row: 5 },
  obstacles: [{ col: 1, row: 1 }, ...],
  stars:     [{ col: 5, row: 0 }, { col: 0, row: 5 }, { col: 3, row: 3 }],
  color: '#ff8db3', colorDeep: '#c46285', colorName: 'rose', colorMasc: 'rose',
}
```

Coordonnées en cases (0 à 5), `(0,0)` en haut à gauche.

## Plan de repli

- Une **capture vidéo** d'une partie complète (~2 min) doit être préparée d'avance et stockée sur clé USB.
- À défaut, la **variante tableau + magnets** (cf. `../01-atelier-jeudi-aprem.md`) permet de tenir l'atelier sans écran.
