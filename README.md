# eReissuvihko - Alakoulun digitaalinen järjestelmä

eReissuvihko on alakoulun digitaalinen järjestelmä lukujärjestysten ja poissaolojen hallintaan sekä kodin ja koulun yhteydenpitoon.

## Ominaisuudet

### Oppilaat
- Lukujärjestyksen katsominen
- Viestien lukeminen ja lähettäminen opettajille

### Opettajat
- Kaikkien lukujärjestysten katsominen
- Oman lukujärjestyksen lisääminen ja muokkaaminen
- Poissaolojen seuraaminen ja merkitseminen
- Viestien lukeminen ja lähettäminen

### Huoltajat
- Lapsen lukujärjestyksen katsominen
- Lapsen poissaolojen seuraaminen ja kuitata
- Viestien lukeminen ja lähettäminen opettajille

## Teknologiat

- **Backend**: Node.js, Express.js
- **Template Engine**: EJS with layouts
- **Database**: MariaDB
- **Frontend**: HTML5, CSS3, JavaScript
- **Authentication**: Email-based (no passwords during development)

## Asennus

### 1. Tietokanta

#### Asenna MariaDB/MySQL
- **Windows**: Lataa ja asenna MariaDB tai MySQL
- **Linux**: `sudo apt-get install mariadb-server`
- **macOS**: `brew install mariadb`

#### Luo tietokanta ja käyttäjä
1. Avaa MySQL komentorivi tai MySQL Workbench
2. Kirjaudu sisään root-käyttäjänä
3. Suorita: `database/setup_database_user.sql`
4. Suorita: `database/create_database.sql`
5. Suorita: `database/sample_data.sql`

**Komentorivillä:**
```bash
mysql -u root -p < database/setup_database_user.sql
mysql -u ereissuvihko_user -p < database/create_database.sql
mysql -u ereissuvihko_user -p < database/sample_data.sql
```

**Huomio:** Tietokantaskriptit on suunniteltu kehitystä varten ja ne voidaan ajaa uudelleen turvallisesti:
- `create_database.sql` pudottaa olemassa olevat taulut ennen uusien luomista
- `sample_data.sql` tyhjentää olemassa olevan datan ennen uusien tietojen lisäämistä

**Yksityiskohtaiset ohjeet:** Katso `database/SETUP_WINDOWS.md`

### 2. Node.js sovellus

```bash
# Kloonaa repositorio
git clone <repository-url>
cd bc-reissuvihko

# Asenna riippuvuudet
npm install

# Kopioi ympäristömuuttujat
cp env.example .env

# Muokkaa .env tiedostoa
nano .env
```

Muokkaa `.env` tiedostoa:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=ereissuvihko_user
DB_PASSWORD=SecureAppPassword2025!
DB_NAME=ereissuvihko
SESSION_SECRET=your_very_secure_session_secret_here_change_this_in_production
PORT=3000
NODE_ENV=development
```

### 3. Käynnistä sovellus

```bash
# Kehitystilassa (nodemon)
npm run dev

# Tuotantotilassa
npm start
```

Sovellus on saatavilla osoitteessa: http://localhost:3000

## Testikäyttäjät

### Opettaja
- **Email**: anna.virtanen@koulu.fi
- **Nimi**: Anna Virtanen
- **Luokka**: 1A

### Oppilas
- **Email**: ella.virtanen@oppilas.koulu.fi
- **Nimi**: Ella Virtanen
- **Luokka**: 1A

### Huoltaja
- **Email**: marja.virtanen@example.com
- **Nimi**: Marja Virtanen
- **Lapsi**: Ella Virtanen

## Tietokantarakente

### Päätaulut
- `student` - Oppilaat
- `teacher` - Opettajat
- `parent` - Huoltajat
- `class` - Luokat
- `lesson` - Oppitunnit
- `absence` - Poissaolot
- `message` - Viestit
- `user` - Käyttäjät (autentikointi)

### Yhteydet
- Oppilaat kuuluvat luokkiin
- Luokilla on luokanopettaja
- Huoltajat liitetään oppilaisiin
- Poissaolot liitetään oppitunteihin ja oppilaisiin
- Viestit lähetetään käyttäjiltä käyttäjille

## Kehitys

### Projektirakenne
```
bc-reissuvihko/
├── database/           # Tietokantaskriptit
├── public/            # Staattiset tiedostot
│   ├── css/          # Tyylitiedostot
│   └── js/           # JavaScript tiedostot
├── routes/           # Reitit
├── views/            # EJS näkymät
├── server.js         # Pääsovellus
└── package.json      # Riippuvuudet
```

### Lisääminen ominaisuuksia

1. **Uusi reitti**: Luo tiedosto `routes/` kansioon
2. **Uusi näkymä**: Luo tiedosto `views/` kansioon
3. **Uusi tyyli**: Lisää `public/css/style.css` tiedostoon
4. **Uusi JavaScript**: Lisää `public/js/main.js` tiedostoon

### Tietokantamuutokset

1. Muokkaa `database/create_database.sql`
2. Päivitä `database/sample_data.sql` tarvittaessa
3. Suorita muutokset tietokannassa

**Kehitystä varten:**
```bash
# Päivitä tietokantarakente
mysql -u ereissuvihko_user -p < database/create_database.sql

# Päivitä testidata
mysql -u ereissuvihko_user -p < database/sample_data.sql

# Tai molemmat kerralla
mysql -u ereissuvihko_user -p < database/create_database.sql && mysql -u ereissuvihko_user -p < database/sample_data.sql
```

**Huomio:** Skriptit voidaan ajaa uudelleen turvallisesti - ne tyhjentävät olemassa olevat tiedot automaattisesti.

## Tulevaisuuden ominaisuudet

- Salasanojen käyttöönotto
- Liitetiedostojen lähettäminen viesteissä
- Push-notifikaatiot
- Mobiilisovellus
- Raporttien generointi
- Kalenteri-integraatio

## Ongelmatilanteet

### Tietokantayhteys
```bash
# Tarkista MariaDB tila
sudo systemctl status mariadb

# Käynnistä uudelleen
sudo systemctl restart mariadb
```

### Portti varattu
```bash
# Tarkista portin käyttö
sudo netstat -tlnp | grep :3000

# Muuta portti .env tiedostossa
PORT=3001
```

### Riippuvuuksien ongelmat
```bash
# Poista node_modules ja asenna uudelleen
rm -rf node_modules package-lock.json
npm install
```

## Lisenssi

MIT License

## Yhteystiedot

Kehittäjä: [Nimi]
Email: [email]
