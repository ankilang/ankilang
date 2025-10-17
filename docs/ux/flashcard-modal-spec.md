# Modale de création de flashcards — Spécification UX (V2)

Objectif
- Clarifier et accélérer la création de cartes (Basic / Cloze) avec un flux en 3 étapes et un aperçu "style Anki".
- Réduire les erreurs par validation immédiate et messages concis.
- Permettre l’enrichissement (images, audio, tags) sans bloquer la saisie.

Principes
- Progressive disclosure: afficher d’abord l’essentiel, proposer l’optionnel ensuite.
- Feedback en temps réel: aperçu, états de chargement, confirmations discrètes.
- Résilient offline: création possible sans services externes.

Parcours (3 étapes)
1) Type & intention
   - Choix du type: Basic / Cloze (cartes illustrées + exemple).
   - Champ intention (optionnel) pour guider tags/recherche images.
   - Indicateur de langue cible (depuis le thème) + tips contextuels.

2) Rédaction
   - Basic: Recto (FR), Verso (langue cible), bouton Traduire (si Recto rempli).
   - Cloze: Zone de texte avec aide {{c1::réponse::indice}} et prévisualisation live.
   - À droite: PreviewCard (recto/verso ou rendu Cloze) avec style proche Anki.

3) Enrichir & prévisualiser
   - Images (Pexels): recherche debouncée, grille, bouton Optimiser & Ajouter (upload Appwrite).
   - Audio (TTS): Générer et écouter; Occitan → Votz, sinon ElevenLabs via Appwrite.
   - Tags: chips + suggestions issues du thème/intention.
   - PreviewCard complet (image, icône audio si présent).

Layout
- Header collant: titre, langue cible, indicateur "Brouillon enregistré".
- Corps scrollable par section; Footer collant: Annuler, Précédent, Suivant, Enregistrer.
- Palette alignée sur `themeColors` du thème.

Accessibilité & clavier
- Focus-trap dans la modale, Esc pour fermer, retour focus sur le bouton d’origine.
- Raccourcis: Cmd/Ctrl+Enter (Enregistrer), Shift+Enter (Suivant), Esc (Fermer).
- Labels et descriptions ARIA sur les contrôles dynamiques.

Validation
- Basic: recto + verso requis.
- Cloze: `clozeTextTarget` doit contenir au moins un motif `{{cN::...}}`.
- État des CTA réactif, messages d’erreur concis sous les champs.

États réseau
- Traduction/Images/TTS: affichage des états (loading, erreur) sans bloquer la saisie.
- Offline: désactivation élégante de ces boutons + info claire.

Autosave
- Sauvegarde du brouillon local toutes 3 s et à la fermeture.
- Clé de stockage: `draft:new-card:${userId}:${themeId}`.

Livrables UI
- Composants: StepperHeader, StepType, StepContent, StepEnhance, PreviewCard, FooterActions.
- Conteneur: NewCardModalV2 (non branché tant que le flag n’est pas activé).

