---
layout: ../layouts/AboutLayout.astro
title: "Projects"
---

## 🏗️ Infrastructure / CloudLab

Un ecosistema di servizi Docker pensato per girare su una VPS personale — ogni pezzo fa la sua parte.

### cloudlab-ingress

NGINX Proxy Manager deployed via Docker Compose. Acts as the entry point for all CloudLab services, handling reverse proxying and SSL termination with a clean web UI.

`docker` `nginx` `docker-compose`

### cloudlab-monitoring

Monitoring stack wired up to Grafana. Keeps an eye on the health and performance of the CloudLab infrastructure.

`grafana` `docker` `monitoring`

### cloudlab-status

Status page for the CloudLab ecosystem. A quick at-a-glance view of what's running and what's not.

`docker` `status`

### cloudlab-time

NTP server based on dockurr/chrony, deployed via Docker Compose. Keeps time in sync across the whole CloudLab.

`docker` `ntp` `chrony`

---

## 🛠️ Tools

### localbackup

Shell script powered by Restic for encrypted incremental backups to an external disk. Supports retention policies and email notifications. Built to be run on a schedule and forgotten about.

`shell` `restic` `backup`

### super-duper-enigma

Personal dev toolkit: useful commands, notes, and ready-to-use Docker Compose files for spinning up MySQL, Redis, MongoDB and more locally in seconds.

`docker` `docker-compose` `mysql` `redis` `mongodb`

---

## 🎮 Fun

### learning-kana

An interactive Hiragana and Katakana chart built to help learn Japanese kana. Because sometimes side projects are just about learning something completely different.

`japanese` `html` `interactive`
