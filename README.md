# Schule Apps

Zentrale Laufzeitkonfiguration fuer Velox, Privatraum und den Remote-Browser. Die Apps bleiben getrennte Prozesse; Docker Compose startet und ueberwacht sie gemeinsam. Caddy bleibt der hostweite HTTPS-Reverse-Proxy.

Die Startseite liegt unter `https://webgbt.duckdns.org/apps`. Sie verlinkt auf die bestehenden App-Adressen, die unveraendert bleiben, und auf den Remote-Browser unter `https://browseer.duckdns.org`. Den passenden Caddy-Block zeigt `gateway/Caddyfile.snippet`; er ersetzt nur den bisherigen `webgbt.duckdns.org`-Block und liefert die Seite unter `/apps` aus.

Vor dem Aktivieren des Browser-Site-Blocks muss `browseer.duckdns.org` per DuckDNS auf den Server zeigen. Danach auf dem Server interaktiv `caddy hash-password` ausfuehren, den Hash in den kommentierten Block eintragen und den Block aktivieren. Der Browser bleibt hinter Caddys Basic Auth und wird nur intern auf `127.0.0.1:3000` weitergeleitet.

## Persistente Daten

- Privatraum verwendet das bereits vorhandene externe Docker-Volume `privatraum_app_data` am Containerpfad `/data`.
- Velox verwendet weiterhin `/opt/velox/data` und `/opt/velox/.env` auf dem Server. Der Container laeuft mit der bestehenden UID/GID `996:986`.
- Chromium speichert Profil und Einstellungen im konfigurierten Verzeichnis `BROWSER_CONFIG_DIR`.
- Keine Datenbanken, Browserprofile, Tokens oder `.env`-Dateien gehoeren in GitHub.

## Voraussetzungen auf Ubuntu

Die Verzeichnisse `/root/privatraum` und `/opt/velox` muessen vor dem gemeinsamen Start vorhanden sein. Die Compose-Datei erwartet die bereits verwendete Privatraum-Konfiguration unter `/root/privatraum/.env` sowie Velox' Environment-Datei unter `/opt/velox/.env`.

Nach einem kontrollierten Wechsel von Velox von systemd zu Compose startet der gemeinsame Stack mit:

```bash
docker compose --env-file /root/privatraum/.env up -d --build
docker compose --env-file /root/privatraum/.env ps
```

Alle Container verwenden `restart: unless-stopped` und starten nach einem Docker-Neustart erneut. Ports sind nur an Loopback gebunden; Caddy bleibt der oeffentliche Einstiegspunkt.

## Kontrollierter Serverwechsel

Die folgenden Schritte erst ausfuehren, wenn dieses Repository auf dem Server liegt und der Checkout geprueft wurde. Sie stoppen kurz Privatraum und Velox. Caddy und die anderen Apps bleiben unangetastet.

1. Ein zugriffsgeschuetztes Backup-Verzeichnis anlegen und beide Datenbestände konsistent sichern:

   ```bash
   sudo install -d -m 700 /root/backups/apps
   sudo systemctl stop velox
   cd /root/privatraum
   docker compose -f docker-compose.yml -f compose.external-caddy.yml stop app
   sudo tar -C /opt/velox/data -czf /root/backups/apps/velox-data-$(date +%F-%H%M%S).tar.gz .
   sudo tar -C /var/lib/docker/volumes/privatraum_app_data/_data -czf /root/backups/apps/privatraum-data-$(date +%F-%H%M%S).tar.gz .
   ```

2. Erst wenn beide Archive vorhanden sind, Velox systemd deaktivieren und Compose aus dem gemeinsamen Checkout starten:

   ```bash
   sudo systemctl disable velox
   cd /opt/schule-apps
   docker compose --env-file /root/privatraum/.env up -d --build
   docker compose --env-file /root/privatraum/.env ps
   ```

   Die Compose-Datei bindet dieselbe Velox-Datenbank und dasselbe Privatraum-Volume ein. Sie kopiert, initialisiert oder loescht diese Daten nicht. Der Browser startet erstmals in diesem Stack und speichert sein Profil im ignorierten Konfigurationsordner.

3. Wenn der neue Stack nicht gesund startet, ihn ohne Volume-Loeschung stoppen, dann die bisherigen Dienste wieder starten:

   ```bash
   cd /opt/schule-apps
   docker compose --env-file /root/privatraum/.env down
   cd /root/privatraum
   docker compose -f docker-compose.yml -f compose.external-caddy.yml start app
   sudo systemctl enable --now velox
   ```

   Niemals `docker compose down -v` fuer diesen Stack verwenden. Die Privatraum-Daten liegen im externen Volume `privatraum_app_data`.

## GitHub

Dieses Verzeichnis ist fuer ein gemeinsames Repository gedacht. Nur Quellcode und Deploy-Konfiguration committen. Vor einem ersten Push muessen die Git-Ignore-Regeln und die vorgemerkten Dateien geprueft werden. Der Privatraum-Container verwendet weiterhin das vorhandene externe Volume, auch wenn sich Compose-Projektname oder Checkout-Pfad aendern.

Nach dem Anlegen des gemeinsamen GitHub-Repositories wird es auf dem Server einmalig nach `/opt/schule-apps` geklont. Fuer Quellcode-Updates danach:

```bash
cd /opt/schule-apps
git pull --ff-only
docker compose --env-file /root/privatraum/.env up -d --build
docker compose --env-file /root/privatraum/.env ps
```

Vor Datenbankmigrationen zuerst ein Backup nach dem Verfahren oben anlegen. Niemals `docker compose down -v` verwenden.
