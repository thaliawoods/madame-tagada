# Mini-jeu Tagada

Petit jeu en HTML + Canvas vanilla (aucune dépendance) pour l'atelier 1 à Bully, le 21 mai 2026.

## Lancement

Double-cliquer sur `index.html` ou ouvrir dans Chrome / Firefox / Safari.

Aucune installation. Tout est local — fonctionne sans Internet.

## Plein écran

Une fois lancé, taper la touche **F** ou utiliser F11 du navigateur.

## Contrôles

Un seul mode. Chaque clic (souris ou clavier) sur AVANCE / GAUCHE / DROITE fait deux choses en même temps :
1. Tagada bouge tout de suite à l'écran.
2. L'instruction s'écrit dans la zone « Mon programme » à droite.

| Touche | Action |
|---|---|
| ↑ ou A | AVANCE (Tagada fait un pas dans la direction où elle regarde) |
| ← ou G | tourner GAUCHE |
| → ou D | tourner DROITE |
| R | RECOMMENCER (remet Tagada au départ et vide le programme) |
| Espace | REJOUER (rejoue le programme actuel depuis le départ) |
| F | plein écran |
| 1 à 5 | changer de plateau |

Les 5 boutons en haut à droite changent de plateau. Le bouton ROUGE « REJOUER » permet de rejouer le programme déjà écrit — utile pédagogiquement pour montrer aux enfants que **le programme tourne tout seul, dans l'ordre qu'on a écrit**.

## Plateaux

5 plateaux pré-définis correspondent exactement aux **5 plateaux papier A3** distribués aux 5 équipes (cf. `imprimables/01-plateaux-A3.pdf`). Si on modifie ici, modifier les impressions en cohérence.

1. **La ligne droite** — départ haut-gauche, pot bas-droit, aucun obstacle
2. **Un obstacle** — départ bas-gauche, pot centre, 1 mur
3. **Deux obstacles** — départ centre, pot haut-droit, 2 murs
4. **Le parcours en L** — coin à coin opposé, 1 mur central
5. **La traversée** — départ et pot alignés au centre mais détour obligé

## Conseils pour la démo

- Avant la séance, ouvrir le jeu, taper **F** pour le plein écran, et faire un essai sur le plateau 1 en mode immédiat pour vérifier le son et l'écran.
- Pendant la séance, en mode programme, agrandir le navigateur au maximum (les boutons doivent être grands).
- Si l'audio ne marche pas, le jeu reste 100 % jouable visuellement.

## Plan de repli

Si le navigateur plante ou l'écran ne marche pas le jour J :
- Une **capture vidéo** d'une partie complète (~2 min) doit être préparée d'avance et stockée sur clé USB.
- À défaut, la **variante tableau + magnets** (cf. `01-atelier-jeudi-aprem.md`) permet de tenir l'atelier sans écran.

## Si on veut modifier un plateau

Tout est dans `game.js`, en haut du fichier, dans la constante `LEVELS`. Format :

```js
{
  name: 'Plateau N — Titre',
  start: { col: 0, row: 0, dir: 1 },  // dir : 0=haut, 1=droite, 2=bas, 3=gauche
  pot:   { col: 4, row: 4 },
  obstacles: [{ col: 1, row: 2 }, ...],
  hint: 'Texte affiché en bas',
}
```

Les coordonnées sont en cases (0 à 4), `(0,0)` en haut à gauche.
