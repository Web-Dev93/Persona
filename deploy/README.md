# Wdrożenie Persony na własnym serwerze

Persona to aplikacja Node.js — jeden proces serwuje API **i** zbudowany frontend.
Nie zadziała na hostingu współdzielonym pod PHP; potrzebny jest VPS z dostępem SSH.

Instrukcja zakłada Ubuntu 22.04/24.04 lub Debiana 12. Na innych dystrybucjach
zmieniają się tylko nazwy pakietów.

| Element | Ścieżka |
| --- | --- |
| Kod | `/var/www/persona` |
| Dane (baza, wgrane pliki) | `/var/lib/persona` |
| Sekrety | `/etc/persona/persona.env` |
| Usługa | `persona.service` |
| Port aplikacji | `3001`, tylko lokalnie — na świat wychodzi nginx |

---

## 1. Pakiety

```bash
sudo apt update
sudo apt install -y curl git nginx postgresql
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v          # ma pokazać v22 lub nowszy
which node       # zapamiętaj tę ścieżkę — potrzebna w kroku 5
```

## 2. Użytkownik i katalogi

Aplikacja nie ma powodu działać na roocie.

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin persona
sudo mkdir -p /var/www/persona /var/lib/persona/uploads /etc/persona
sudo chown -R persona:persona /var/www/persona /var/lib/persona
```

## 3. Baza danych

```bash
sudo -u postgres createuser persona --pwprompt      # zapisz hasło
sudo -u postgres createdb persona --owner=persona
```

Tabele tworzą się same przy pierwszym starcie — nie ma osobnej migracji.

Możesz też pominąć PostgreSQL i zostawić `DATABASE_URL` puste: aplikacja użyje
wtedy wbudowanej bazy w `PGLITE_DATA_DIR`. Dla małego ruchu to wystarcza, ale na
serwerze PostgreSQL jest rozsądniejszy.

## 4. Kod

```bash
sudo -u persona git clone https://github.com/Web-Dev93/Persona.git /var/www/persona
cd /var/www/persona
sudo -u persona npm install
sudo -u persona npm run build
```

## 5. Konfiguracja

```bash
sudo cp deploy/persona.env.example /etc/persona/persona.env
sudo nano /etc/persona/persona.env          # wpisz hasło do bazy i OPENROUTER_API_KEY
sudo chown root:persona /etc/persona/persona.env
sudo chmod 640 /etc/persona/persona.env
```

`OPENROUTER_API_KEY` jest **wymagany** — bez niego doradca nie odpowie.

```bash
sudo cp deploy/persona.service /etc/systemd/system/
sudo nano /etc/systemd/system/persona.service   # ExecStart: wstaw ścieżkę z `which node`
sudo systemctl daemon-reload
sudo systemctl enable --now persona
sudo systemctl status persona
curl http://127.0.0.1:3001/api/healthz          # {"status":"ok"}
```

Gdy usługa nie wstaje: `sudo journalctl -u persona -n 50 --no-pager`.

## 6. nginx i certyfikat

```bash
sudo cp deploy/nginx-persona.conf /etc/nginx/sites-available/persona
sudo nano /etc/nginx/sites-available/persona    # podmień epersona.pl na swoją domenę
sudo ln -s /etc/nginx/sites-available/persona /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

Certyfikat wystawiaj **dopiero po** przepięciu DNS na IP serwera — Let's Encrypt
sprawdza domenę, więc wcześniej się nie uda:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d epersona.pl -d www.epersona.pl
sudo nginx -t && sudo systemctl reload nginx
```

Odnawianie certyfikatu certbot ustawia sam.

## 7. DNS

W panelu domeny: rekord `A` dla `@` na IP serwera, `CNAME` dla `www` na domenę
główną. Jeśli domena ma ustawione przekierowanie albo jest przypisana do starej
strony — najpierw usuń to przypisanie, inaczej przekierowanie wygra mimo
poprawnego DNS-u.

## 8. Aktualizacje

```bash
sudo -u persona /var/www/persona/deploy/deploy.sh
```

Skrypt pobiera `main`, buduje, restartuje usługę i sprawdza `/api/healthz`.
Jeśli aplikacja nie odpowie w 30 sekund, kończy się błędem i mówi, gdzie szukać.

Żeby `sudo systemctl restart persona` działało bez hasła:

```bash
echo 'persona ALL=(root) NOPASSWD: /bin/systemctl restart persona' | \
  sudo tee /etc/sudoers.d/persona
```

---

## Zanim wystawisz to publicznie

Panel `/admin` i wszystkie `/api/admin/*` **nie mają uwierzytelniania**. Każdy,
kto zna adres, odczyta dane kontaktowe leadów i podmieni adres webhooka. Na
Replicie dało się z tym żyć, na własnej domenie to realny problem — również
wobec RODO, bo w grę wchodzą dane osobowe klientów.

Najprostsza doraźna zasłona, do czasu zrobienia logowania w aplikacji:

```nginx
location ~ ^/(admin|api/admin) {
    auth_basic "Panel";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://persona_app;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header Connection "";
}
```

```bash
sudo apt install -y apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd twoj-login
```

## Kopie zapasowe

Wszystko, co trzeba archiwizować, leży w dwóch miejscach:

```bash
sudo -u postgres pg_dump persona | gzip > persona-$(date +%F).sql.gz
sudo tar czf persona-uploads-$(date +%F).tar.gz -C /var/lib/persona uploads
```
