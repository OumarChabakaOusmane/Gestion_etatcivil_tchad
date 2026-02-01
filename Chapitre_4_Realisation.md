# Chapitre 4 : Réalisation de la Solution

## 1. Introduction
Ce chapitre est consacré à la phase de réalisation de notre application de gestion de l'état civil. Après avoir défini les besoins et conçu l'architecture dans les chapitres précédents, nous présentons ici les outils, les technologies et les interfaces finales qui constituent la solution.

## 2. Environnement de Travail

### 2.1. Environnement Matériel
Le développement a été réalisé sur une machine avec les caractéristiques suivantes :
- **Processeur :** [Détails à compléter par l'utilisateur, ex: Intel Core i7]
- **Mémoire Vive (RAM) :** [Détails à compléter, ex: 16 Go]
- **Système d'exploitation :** Windows

### 2.2. Environnement Logiciel
Les outils logiciels utilisés pour le développement et la gestion du projet incluent :
- **Visual Studio Code (VS Code) :** Éditeur de code source puissant et polyvalent, prisé pour ses fonctionnalités avancées telles que l'autocomplétion, le débogage intégré et son vaste écosystème d'extensions. Compatible avec une grande variété de langages de programmation (notamment Java, JavaScript, Node.js, Go et C++), il offre un environnement de développement moderne et hautement personnalisable. La version stable utilisée lors de la rédaction de ce rapport est la **1.108.2**, sortie le **23 janvier 2026**.
- **Git & GitHub :** Pour le contrôle de version et l'hébergement du code source.
- **Node.js :** Environnement d'exécution pour le backend et les outils de build frontend.
- **Expo Go :** Pour le test et la prévisualisation de l'application mobile sur un appareil physique.

## 3. Stack Technique (Outils de développement)

L'application repose sur une architecture moderne et scalable :

### 3.1. Frontend Web
- **React.js (v19) :** Bibliothèque JavaScript pour la création d'interfaces utilisateur dynamiques.
- **Vite :** Outil de build rapide pour le développement frontend.
- **Bootstrap 5 & Framer Motion :** Pour une interface responsive, moderne et animée.
- **Recharts :** Pour la visualisation des statistiques sous forme de graphiques élégants.

### 3.2. Application Mobile
- **React Native & Expo (SDK 54) :** Pour le développement d'une application mobile cross-platform performante.
- **React Navigation :** Pour la gestion de la navigation fluide entre les écrans.
- **Lucide React Native :** Pour une bibliothèque d'icônes cohérente.

### 3.3. Backend
- **Node.js & Express (v5) :** Framework minimaliste pour la création de l'API REST.
- **JWT (JSON Web Token) :** Pour la sécurisation des échanges et l'authentification.
- **Nodemailer :** Pour l'envoi automatique de notifications par email.

### 3.4. Services Cloud (Firebase)
**Firebase** est une plateforme de développement d'applications mobiles et web complète, hébergée par Google (Backend as a Service - BaaS). Elle repose principalement sur les services suivants :
- **Cloud Firestore :** Une base de données NoSQL orientée documents qui permet de stocker et de synchroniser les données en temps réel entre les utilisateurs de manière sécurisée et scalable. NoSQL signifie que la base de données n’utilise pas de tables relationnelles rigides comme une base de données SQL traditionnelle, offrant ainsi une flexibilité optimale.
- **Firebase Authentication :** Gestion sécurisée des comptes utilisateurs (OTP, Email/Password).
- **Cloud Storage :** Stockage sécurisé des documents justificatifs et des actes générés.

## 4. Présentation des Interfaces

*(Note : Les captures d'écran doivent être insérées dans ces sections lors de la mise en page finale du rapport.)*

### 4.1. Authentification et Inscription
Ces interfaces constituent le point d'entrée sécurisé du système. Elles reposent sur une architecture moderne permettant une gestion fluide des utilisateurs sur les plateformes Web et Mobile.

#### A. Interface de Connexion (Web & Mobile)
La page de connexion est simple et intuitive, permettant à l'utilisateur de saisir ses identifiants pour accéder au système. Elle inclut une validation des entrées et un lien pour réinitialiser le mot de passe en cas d'oubli. Le design est réactif et sécurisé, avec un **hachage des mots de passe par l'algorithme bcrypt** et une gestion des sessions utilisateurs pour une expérience fluide sur tous les appareils.

#### B. Interface d'Inscription
La page d'inscription permet à l'utilisateur de créer un compte en saisissant ses informations personnelles et en validant les champs requis. Les données sont sécurisées avec un **hachage des mots de passe par l'algorithme bcrypt** et un design réactif pour une utilisation fluide sur tous les appareils.

*(Insérer ici une capture d'écran de la page de connexion : Figure 4.1)*
*(Insérer ici une capture d'écran de la page d'inscription : Figure 4.2)*


### 4.2. Espace Citoyen (Portail Web & Mobile)
- **Tableau de bord :** Vue d'ensemble des dernières activités.
- **Formulaires de demande :** Formulaires structurés pour les actes de Naissance, Mariage et Décès.
- **Suivi en temps réel :** Une timeline interactive permettant de voir l'évolution du dossier (En attente, Validé, Rejeté).

### 4.3. Portail Administration
L'interface administrateur permet aux officiers d'état civil de :
- Consulter et filtrer les demandes entrantes.
- Valider les dossiers après vérification des pièces jointes.
- Générer automatiquement l'acte officiel au format PDF sécurisé par un QR Code.
- Suivre les statistiques globales via un tableau de bord analytique.

## 5. Sécurité et Fiabilité
- **Sécurisation des données :** Toutes les communications transitent par HTTPS.
- **Contrôle d'accès :** Utilisation de rôles (Citoyen, Opérateur, Administrateur) pour restreindre l'accès aux fonctionnalités sensibles.
- **Validation :** Contrôle rigoureux des données saisies côté client et côté serveur (express-validator).

## 6. Conclusion
Ce dernier chapitre avait pour objectif de présenter les différents outils de conception et de développement utilisés tout au long de la réalisation de ce projet de plateforme de gestion de l'état civil. Il nous a permis de passer en revue la présentation des principales interfaces graphiques de la plateforme, offrant ainsi un aperçu concret de la solution mise en place pour relever les défis de la numérisation des actes au Tchad.
