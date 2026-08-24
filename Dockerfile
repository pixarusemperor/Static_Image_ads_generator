# This Dockerfile pulls the pre-built image from GitHub Actions.
# The actual build happens on GH Actions → ghcr.io/pixarusemperor/static_image_ads_generator:latest
# This avoids ENOSPC on the VPS during npm ci.
FROM ghcr.io/pixarusemperor/static_image_ads_generator:latest
