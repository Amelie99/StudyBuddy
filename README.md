# StudyBuddy HS Landshut

## Inhaltsverzeichnis
1. [Erste Schritte & Installation](#erste-schritte--installation)
2. [Projektübersicht](#projektübersicht)
3. [Kernfunktionen](#kernfunktionen)
4. [Technologie-Stack](#technologie-stack)
5. [Authentifizierung & Sicherheit](#authentifizierung--sicherheit)
6. [Datenmodell](#datenmodell)
7. [User Stories & Features](#nutzung-der-app)
8. [Aktueller Status & Bekannte Probleme](#aktueller-status--bekannte-probleme)

---
## Erste Schritte & Installation
Die Anwendung wird über Firebase App Hosting bereitgestellt und ist unter der folgenden URL erreichbar: https://studio--studybuddy-haw-4vdjx.us-central1.hosted.app/dashboard

Für Entwicklungszwecke kann das Projekt auch lokal ausgeführt werden:
1. **Repository klonen:** `git clone https://github.com/Amelie99/StudyBuddy.git`
2. **Abhängigkeiten installieren:** `npm install`
3. **Firebase-Konfiguration:** Eine funktionierende Firebase-Konfiguration ist bereits im Projekt enthalten.
4. **Lokalen Entwicklungsserver starten:** `npm run dev`
Die Anwendung ist dann unter `http://localhost:3000` erreichbar.

## Projektübersicht
StudyBuddy ist eine für die Hochschule Landshut entwickelte Webanwendung, die Studierenden hilft, passende Lernpartner und -gruppen zu finden. Die App löst das gängige Problem, dass Studierende oft Schwierigkeiten haben, Kommilitonen mit ähnlichen Lernzielen, Fachbereichen oder Verfügbarkeiten zu finden. Durch ein detailliertes Profilsystem und eine Matching-Funktion (zukünftig intelligenter Matching-Algorithmus) erleichtert StudyBuddy die Organisation des gemeinsamen Lernens und fördert so den akademischen Erfolg und die soziale Vernetzung innerhalb der Hochschule.

## Kernfunktionen
- **Benutzerauthentifizierung:** Sichere Registrierung und Anmeldung ausschließlich mit E-Mail-Adressen der HS Landshut (`@stud.haw-landshut.de`).
- **Profil-Erstellung:** Nutzer können ein detailliertes Profil mit Informationen zu Studiengang, Semester, Lerninteressen, bevorzugtem Lernstil, aktuellen Kursen und ihrer wöchentlichen Verfügbarkeit erstellen.
- **Partner-Matching:** Eine Übersicht zeigt potenziell passende Lernpartner basierend auf den Profilinformationen an.
- **Chat-System:** Ein integrierter Echtzeit-Chat ermöglicht es den Nutzern, direkt miteinander zu kommunizieren, um Lerntreffen zu vereinbaren oder fachliche Fragen zu klären.
- **Gruppen-Funktion:** Nutzer können Lerngruppen erstellen, ihnen beitreten und sich innerhalb der Gruppe austauschen.
- **Kalender-Integration:** Die Möglichkeit, Lernsitzungen zu planen, die in einem persönlichen Kalender innerhalb der App angezeigt werden (Grundfunktion implementiert).

## Technologie-Stack
- **Frontend:** Next.js (React Framework) - Ermöglicht serverseitiges Rendern (SSR) und statische Seitengenerierung (SSG) für eine performante und SEO-freundliche Anwendung.
- **Styling:** Tailwind CSS mit `shadcn/ui` für wiederverwendbare Komponenten - Ein Utility-First-CSS-Framework, das schnelles und konsistentes Styling ermöglicht.
- **Sprache:** TypeScript - Erhöht die Code-Qualität und Entwickler-Produktivität durch statische Typisierung.
- **Backend & Authentifizierung:** Firebase (Authentication, Firestore Database, Storage) - Eine umfassende Backend-as-a-Service (BaaS)-Plattform, die eine schnelle Entwicklung von Echtzeit-Anwendungen ermöglicht.
- **Formular-Management:** `react-hook-form` mit `zod` zur Validierung - Eine performante und flexible Lösung für die Formular-Handhabung und -Validierung.
- **Deployment:** Firebase App Hosting - Ermöglicht ein schnelles und einfaches Deployment von Webanwendungen.

## Authentifizierung & Sicherheit
- **Firebase Authentication:** Der gesamte Authentifizierungsprozess wird über Firebase abgewickelt. Bei der Registrierung wird serverseitig überprüft, ob die E-Mail-Adresse mit `@stud.haw-landshut.de` endet.
- **Protected Routes:** Der `AuthGuard`-Mechanismus, implementiert in `/src/components/layout/AuthGuard.tsx`, schützt alle Seiten innerhalb des `(app)`-Verzeichnisses. Nicht authentifizierte Nutzer werden automatisch zur Anmeldeseite weitergeleitet.
- **Firestore-Sicherheitsregeln:** Für eine Produktionsumgebung würden hier detaillierte Firestore-Regeln implementiert, um sicherzustellen, dass Benutzer nur auf ihre eigenen Daten zugreifen und diese bearbeiten können. Bspw. `allow read, write: if request.auth.uid == userId;`.

## Datenmodell
Die Anwendung nutzt Firestore als NoSQL-Datenbank. Die Haupt-Collections sind:
- **users:** Speichert die Profildaten der Benutzer. Die Dokumenten-ID entspricht der Firebase `uid`. Enthält Informationen wie Name, Studiengang, Semester, Lerninteressen, etc.
- **chats:** Speichert Metadaten zu jeder Konversation (Teilnehmer, letzte Nachricht). Die Dokumenten-ID wird aus den UIDs der beiden Teilnehmer generiert, um Duplikate zu vermeiden.
    - **messages:** Eine Sub-Collection innerhalb jedes `chats`-Dokuments, die alle Nachrichten dieser Konversation enthält.
- **groups:** Speichert Informationen über die erstellten Lerngruppen, inklusive Mitglieder und Gruppen-Metadaten.

## User Stories & Features
1. **Registrierung:** Ein neuer Benutzer registriert sich mit seiner Hochschul-E-Mail.
2. **Profilerstellung:** Nach der ersten Anmeldung wird der Benutzer aufgefordert, sein Profil zu vervollständigen, um die bestmöglichen Partnervorschläge zu erhalten.
4. **Dashboard:** Das Dashboard dient als zentrale Anlaufstelle und zeigt den Profilfortschritt, sowie anstehende Lernsitzungen und Lernpartner an.
6. **Buddies finden:** Über die Suche kann der Benutzer aktiv nach anderen Studierenden suchen und deren Profile einsehen.
7. **Chats:** Über das Profil eines anderen Benutzers kann ein Chat gestartet werden, um ein erstes Kennenlernen zu ermöglichen. Im Chat können sich die Lernpartner austauschen, Lernmaterialien teilen und Termine für Lernsitzungen vereinbaren.
8. **Kalender:** Im Kalender werden Termine für Lernsitzungen angezeigt und können neue Termine erstellt werden.

## Aktueller Status & Bekannte Probleme (Work in Progress)
Diese Anwendung wurde im Rahmen eines Moduls an der Hochschule Landshut entwickelt und ist als **Minimum Viable Product (MVP)** zu verstehen. Der Fokus lag auf der Implementierung der Kernarchitektur und der grundlegenden Funktionen. Einige Features sind daher noch nicht vollständig ausgereift oder befinden sich in einem frühen Entwicklungsstadium.
- **Partner-Matching:** Das Matching von Lernpartnern ist aktuell noch nicht intelligent. Die "Buddies finden"-Seite zeigt derzeit eine Liste aller anderen registrierten Benutzer an, anstatt eine gefilterte oder sortierte Auswahl basierend auf Übereinstimmungen im Profil zu präsentieren. Eine KI-gestützte Logik ist für eine zukünftige Version geplant.
- **Benutzer-Profilbilder:** Die Funktionalität zum Hochladen und Anzeigen von Profilbildern per URL ist implementiert, kann aber unter Umständen noch fehlerhaft sein (Buggy).
