[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/BhMy8Rjk)

# 💰 Economy Simulator

> Een geavanceerd idle game gebouwd met moderne web technologieën

![Economy Simulator Hero](screenshots/heroImage.png)

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2016.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-Production%20Ready-success.svg)]()

## 📋 Inhoudsopgave

- [Overzicht](#overzicht)
- [Functies](#functies)
- [Technische Stack](#technische-stack)
- [Installatie](#installatie)
- [Configuratie](#configuratie)
- [Gebruik](#gebruik)
- [API Documentatie](#api-documentatie)
- [Game Mechanica](#game-mechanica)
- [Architectuur](#architectuur)
- [Ontwikkeling](#ontwikkeling)
- [Licentie](#licentie)

## 🎯 Overzicht

**Economy Simulator** is een moderne browser-gebaseerde idle game waarin spelers hun economische imperium bouwen door resources te verzamelen, werknemers aan te nemen en hun productie te upgraden. Het spel combineert strategische planning met automatisatie voor een meeslepende gaming ervaring.

## 🎮 Live Demo

![Gameplay Demo](screenshots/preview.gif)

## 🖼️ Screenshots

### Login & Onboarding

![Login Interface](screenshots/login.png)
_Eenvoudige login - voer gewoon je naam in om te beginnen_

### Login Message 1

![Game Dashboard](screenshots/loginNew.png)
_Login welkom bericht_

### Login Message 2

![Game Dashboard](screenshots/loginBack.png)
_Login welkom terug bericht_

### Game Dashboard

![Game Dashboard](screenshots/game.png)
_Hoofdinterface met resource tracking en automatisatie status_

### Database

![Resource Collection](screenshots/database.png)
_Zo ziet de database er uit_

### 🎮 Kernconcepten

- **Progressief Upgrade Systeem**: Van eenvoudige steen naar kostbare platina
- **Exponentiële Economie**: Kosten stijgen strategisch voor langdurige gameplay
- **Automatisatie**: Idle game mechanica met real-time updates
- **Visuele Feedback**: Dynamische achtergronden en animaties

## ✨ Functies

### 🎪 Gameplay Features

- **🏗️ Resource Management**: Verzamel en verkoop 5 verschillende resource types
- **👷 Personeelsbeheer**: Huur workers (verzamelaars) en sellers (verkopers)
- **⏸️ Controle Systemen**: Pauzeer/hervat werknemers individueel
- **🚀 Upgrade Systeem**: Unlock nieuwe resources met exponentieel stijgende waarden
- **📊 Statistieken**: Gedetailleerde tooltips en voortgang tracking

### 🎨 Interface & UX

- **🌍 Dynamische Achtergronden**: Verschillende visuele thema's per resource niveau
- **✨ Animaties**: Smooth overgangen en visuele feedback
- **📱 Responsive Design**: Volledig geoptimaliseerd voor desktop en mobiel
- **⌨️ Keyboard Shortcuts**: Snelle toegang tot alle acties
- **🎉 Visual Celebrations**: Upgrade festiviteiten en achievement feedback

### 🔧 Technische Features

- **⚡ Real-time Updates**: Live synchronisatie tussen client en server
- **💾 Persistent Data**: MongoDB opslag met automatische backup
- **🔒 Sessiebeheer**: Speler authenticatie
- **🌐 Cross-browser**: Ondersteuning voor alle moderne browsers

## 🛠️ Technische Stack

### Frontend

```javascript
- Vanilla JavaScript (ES6+)
- HTML5 & CSS3
- CSS Grid & Flexbox
- CSS Animations & Transitions
- SessionStorage API
```

### Backend

- Node.js (v16+)
- Express.js Framework
- MongoDB met Mongoose ODM
- RESTful API Architecture
- Environment Variables (.env)

### Development Tools

- ESLint voor code kwaliteit
- Prettier voor code formatting
- dotenv voor omgeving configuratie
- CORS voor cross-origin requests

````markdown
## 🚀 Installatie

### Vereisten

Zorg ervoor dat de volgende software is geïnstalleerd:

- **Node.js** v16.0.0 of hoger
- **npm** v7.0.0 of hoger
- **MongoDB** (lokaal of cloud)
- **Git** voor versie controle

### 📦 Quick Start

1. **Clone de repository**
   ```bash
   git clone https://github.com/EHB-MCT/remedial-assignment-achilleernould-ehb.git
   cd economy-simulator
   ```
````

2. **Backend installatie**

   ```bash
   cd backend
   npm install
   ```

3. **Omgeving configuratie**

   ```bash
   cp .env.example .env
   # Bewerk .env met jouw MongoDB URI
   ```

4. **Start de applicatie**

   ```bash
   # Backend server
   cd backend
   npm start

   # Frontend (in nieuwe terminal)
   cd frontend
   # Open index.html in browser of gebruik live server
   ```

5. **Toegang tot de applicatie**
   - Frontend: `http://localhost:5500` (of jouw development server)
   - Backend API: `http://localhost:3000`

## ⚙️ Configuratie

### Environment Variables

Maak een `.env` bestand in de `backend/` directory:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/economy-simulator
DB_NAME=economy-simulator

# Server
PORT=3000
NODE_ENV=production

# Security (optioneel)
JWT_SECRET=jouw-super-geheime-sleutel
SESSION_SECRET=nog-een-geheime-sleutel
```

### MongoDB Setup

#### Lokale MongoDB

```bash
# Start MongoDB service
sudo systemctl start mongod

# Connect to MongoDB
mongo
use economy-simulator
```

#### MongoDB Atlas (Cloud)

1. Maak een account op [MongoDB Atlas](https://cloud.mongodb.com)
2. Creëer een nieuwe cluster
3. Voeg jouw IP adres toe aan de whitelist
4. Kopieer de connection string naar `.env`

## 💡 Gebruik

### Spelersregistratie & Login

1. **Nieuwe Speler**: Voer gewoon een username in - account wordt automatisch aangemaakt
2. **Bestaande Speler**: Gebruik dezelfde username om in te loggen

### Basis Gameplay

#### 🏗️ Resource Verzameling

- **Handmatige verzameling**: Klik "Verzamel Resources" of druk 'C'
- **Automatische verzameling**: Huur workers voor continue resource productie

#### 💰 Resource Verkoop

- **Handmatige verkoop**: Klik "Verkoop Alles" of druk 'V'
- **Automatische verkoop**: Huur sellers voor continue resource verkoop

#### 👷 Personeelsbeheer

- **Workers aannemen**: Klik "Huur Worker" of druk 'W' (Kosten: €200 × 1.5^aantal_workers)
- **Sellers aannemen**: Klik "Huur Seller" of druk 'S' (Kosten: €200 × 1.5^aantal_sellers)
- **Pauzeren/Hervatten**: Klik pause knoppen of druk 'P'

### Keyboard Shortcuts

| Toets | Actie              |
| ----- | ------------------ |
| `C`   | Verzamel Resources |
| `V`   | Verkoop Resources  |
| `W`   | Huur Worker        |
| `S`   | Huur Seller        |
| `P`   | Pauzeer Workers    |
| `U`   | Upgrade Resource   |

## 📚 API Documentatie

### Base URL

```
http://localhost:3000/api
```

### Endpoints

#### Spelers

**Speler aanmaken**

```http
POST /player
Content-Type: application/json

{
  "username": "SpelerNaam"
}
```

**Alle spelers ophalen**

```http
GET /players
```

#### Game Acties

**Resources verzamelen**

```http
PATCH /player/:id/collect
```

**Resources verkopen**

```http
PATCH /player/:id/sell
```

**Werknemer aannemen**

```http
POST /player/:id/hire
Content-Type: application/json

{
  "type": "collector" | "seller"
}
```

#### Automatisatie

**Auto-tick uitvoeren**

```http
POST /player/:id/auto-tick
```

**Workers pauzeren/hervatten**

```http
PATCH /player/:id/toggle-workers
```

**Sellers pauzeren/hervatten**

```http
PATCH /player/:id/toggle-sellers
```

#### Upgrades

**Resource upgraden**

```http
POST /player/:id/upgrade-resource
```

**Resource info ophalen**

```http
GET /player/:id/resource-info
```

### Response Format

```json
{
  "_id": "player_id",
  "username": "SpelerNaam",
  "money": 5000,
  "resources": 100,
  "workers": 3,
  "sellers": 2,
  "resourceLevel": 2,
  "resourceValue": 10,
  "workersPaused": false,
  "sellersPaused": false,
  "totalResourcesCollected": 500,
  "totalMoneySaved": 2000,
  "totalUpgrades": 1
}
```

## 🎲 Game Mechanica

### Resource Types & Progressie

| Niveau | Resource | Emoji | Waarde/Stuk | Upgrade Kosten |
| ------ | -------- | ----- | ----------- | -------------- |
| 1      | Steen    | 🪨    | €1          | €10.000        |
| 2      | IJzer    | ⛏️    | €10         | €100.000       |
| 3      | Goud     | 🏆    | €100        | €1.000.000     |
| 4      | Diamant  | 💎    | €1.000      | €10.000.000    |
| 5      | Platina  | ⭐    | €10.000     | -              |

### Werknemers Kosten Formule

Kosten van werknemers stijgen exponentieel:

```
Kosten = €200 × 1.5^(aantal_huidige_werknemers)

Voorbeelden:
- 1e worker: €200
- 2e worker: €300
- 3e worker: €450
- 4e worker: €675
- 5e worker: €1.012
```

### Upgrade Mechanica

Bij elke resource upgrade:

- ✅ **Resource waarde verhoogt exponentieel**
- ⚠️ **Alle workers en sellers worden ontslagen**
- 🎨 **Achtergrond thema verandert**
- 🎉 **Visuele celebratie**

### Auto-tick Systeem

Elke 2 seconden:

1. Workers verzamelen resources (als niet gepauzeerd)
2. Sellers verkopen resources (als niet gepauzeerd)
3. UI wordt bijgewerkt met animaties
4. Progress bar toont volgende tick

## 🏗️ Architectuur

### Project Structuur

```
economy-simulator/
├── frontend/                 # Client-side applicatie
│   ├── index.html           # Login/registratie pagina
│   ├── pages/
│   │   └── game.html        # Hoofdspel interface
│   └── js/
│       ├── login.js         # Authenticatie logica
│       ├── api.js           # Connecties met de api
│       └── game.js          # Spellogica & UI updates
│
├── backend/                 # Server-side applicatie
│   ├── models/              # Database schemas
│   │   ├── player.js        # Speler model
│   │   └── worker.js        # Worker model (toekomstig)
│   ├── controllers/         # Business logica
│   │   └── playerController.js
│   ├── routes/              # API endpoints
│   │   └── playerRoute.js
│   ├── app.js              # Express server setup
│   ├── package.json        # Dependencies
│   └── .env               # Omgeving variabelen
│
├── docs/                   # Documentatie
├── README.md               # Project documentatie
└── screenshots             # Afbeeldingen voor de readme
```

### Database Schema

**Player Model:**

- `username`: String (Unieke speler identificatie)
- `money`: Number (Huidige geld balans)
- `resources`: Number (Aantal resources in bezit)
- `workers`: Number (Aantal aangenomen workers)
- `sellers`: Number (Aantal aangenomen sellers)
- `workersPaused`: Boolean (Workers pause status)
- `sellersPaused`: Boolean (Sellers pause status)
- `resourceLevel`: Number (Huidig resource niveau 1-5)
- `resourceValue`: Number (Waarde per resource)
- `totalResourcesCollected`: Number (Statistieken)
- `totalMoneySaved`: Number (Statistieken)
- `totalUpgrades`: Number (Statistieken)
- `createdAt`: Date (Account aanmaak datum)
- `updatedAt`: Date (Laatste activiteit)

## 👨‍💻 Ontwikkeling

### Development Setup

```bash
# Development dependencies installeren
cd backend
npm install --dev

# Code kwaliteit tools
npm run lint          # ESLint controle
npm run format        # Prettier formatting
npm run test          # Unit tests (indien aanwezig)
```

### Code Standards

- **ES6+ JavaScript** voor moderne functionaliteit
- **Consistent naming**: camelCase voor variabelen, PascalCase voor constructors
- **Nederlandse commentaren** voor documentatie
- **Functional programming** waar mogelijk
- **Error handling** op alle async operaties

### Debugging

**Backend debugging:**

```javascript
console.log("Debug info:", variableName);
```

**Frontend debugging:**

```javascript
// Open browser console (F12)
console.log("Frontend debug:", data);
```

**MongoDB debugging:**
Gebruik MongoDB Compass voor database inspectie

### Performance Optimalisatie

- **Database indexing** op veel gebruikte velden
- **Client-side caching** van speler data
- **Efficient DOM updates** met batch operations
- **CSS animations** in plaats van JavaScript
- **Lazy loading** voor grote datasets

## 🤝 Contributing

### Contribution Guidelines

1. **Fork** de repository
2. **Creëer** een feature branch (`git checkout -b feature/nieuwe-functie`)
3. **Commit** je changes (`git commit -am 'Voeg nieuwe functie toe'`)
4. **Push** naar de branch (`git push origin feature/nieuwe-functie`)
5. **Creëer** een Pull Request

### Code Review Process

- Alle changes moeten code review ondergaan
- Tests moeten slagen voordat merge
- Documentatie moet bijgewerkt worden
- Performance impact moet geëvalueerd worden

## 📝 Changelog

### v1.0.0 (2024-12-20)

- ✨ Initial release
- 🎮 Basis idle game mechanica
- 💰 5-niveau resource upgrade systeem
- 👷 Worker/seller management
- 🎨 Dynamische achtergronden
- 📱 Responsive design
- ⌨️ Keyboard shortcuts
- 📊 Statistieken tracking

## 📄 Licentie

Dit project is gelicenseerd onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.

---

<div align="center">

**Gemaakt door Achille Ernould**

</div>
