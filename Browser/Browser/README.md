# Remote Chromium

Chromium läuft in einem Docker-Container auf dem Ubuntu-Server. Caddy stellt die Oberfläche unter einer eigenen DuckDNS-Subdomain mit HTTPS und Passwortschutz bereit.

## Docker starten

1. Kopiere `docker-compose.yml` und `.env.example` auf den Ubuntu-Server in einen eigenen Ordner.
2. Benenne `.env.example` dort in `.env` um. Prüfe die Benutzer- und Gruppen-IDs mit `id BENUTZER` und passe `PUID` und `PGID` in `.env` an.
3. Starte den Dienst im Projektordner:

   ```sh
   docker compose pull
   docker compose up -d
   ```

Der Container lauscht nur auf `127.0.0.1:3000` (HTTP für Caddy) und `127.0.0.1:3001` (direkter HTTPS-Test). Beide Ports sind auf dem Host gebunden und werden nicht direkt im Internet veröffentlicht. Chromium-Einstellungen bleiben im Ordner `config/` erhalten.

## Lokal unter Windows testen

Installiere und starte Docker Desktop mit Linux-Containern. Öffne PowerShell im Projektordner, kopiere `.env.example` nach `.env` (unter Windows kannst du die Standardwerte zunächst lassen) und starte:

```powershell
Copy-Item .env.example .env
docker compose pull
docker compose up -d
```

Rufe dann `https://localhost:3001` auf und bestätige beim ersten Besuch die Warnung für das selbstsignierte Zertifikat. Der Testport ist ebenfalls nur an deinen eigenen Rechner gebunden. Zum Beenden:

```powershell
docker compose down
```

Die Browserdaten bleiben im lokalen Ordner `config/` erhalten. Docker Desktop verwendet unter Windows üblicherweise WSL 2; die aktuellen Voraussetzungen stehen in der [Docker-Dokumentation](https://docs.docker.com/desktop/setup/install/windows-install/).

## Caddy einrichten (Caddy läuft direkt auf dem Ubuntu-Host)

Lege in DuckDNS eine eigene Subdomain an, zum Beispiel `browser-deinname.duckdns.org`. Ergänze den bestehenden Caddyfile um diesen Site-Block und ersetze Domain und Benutzernamen:

```caddyfile
browser-deinname.duckdns.org {
    basic_auth {
        dein-benutzer $2a$14$HIER_DEN_VON_CADDY_ERZEUGTEN_HASH_EINSETZEN
    }
    reverse_proxy 127.0.0.1:3000
}
```

Erzeuge den Passwort-Hash interaktiv auf dem Server, damit das Klartextpasswort nicht in der Shell-History landet:

```sh
caddy hash-password
```

Füge den ausgegebenen Hash anstelle des Platzhalters ein. Prüfe danach die Konfiguration und lade Caddy neu:

```sh
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Caddy übernimmt TLS und WebSocket-Verbindungen für die Browseroberfläche. Verwende eine lange, nur hierfür genutzte Passphrase. Leite im Router weiterhin nur die bereits für Caddy nötigen Ports 80 und 443 weiter; leite Port 3000 nicht weiter.

## Falls Caddy selbst in Docker läuft

Diese Compose-Datei nimmt an, dass Caddy direkt auf dem Host läuft. Ein Caddy-Container kann `127.0.0.1:3000` des Hosts nicht als sein eigenes `localhost` erreichen. In diesem Fall müssen Chromium und Caddy in dasselbe Docker-Netzwerk aufgenommen werden; der Upstream im Caddyfile lautet dann `remote-chromium:3000`. Ermittle erst den Namen des bestehenden Caddy-Netzwerks, bevor du die Compose-Datei anpasst.
