# Static Image Ads Generator

A system that analyzes existing static ads to reverse-engineer their styles, layouts, and layers, and programmatically generates multiple variants of these ads with HTML/CSS templates.

## Core Terminology

**Ad Layout**:
The hierarchical composition of HTML/CSS element layers (backgrounds, shape overlays, images, text blocks, and badges) and their styling rules.
_Avoid_: Template, wireframe

**Ad Variant**:
A generated instance of an ad layout created by swapping dynamic assets such as copywriting, background images, product mockups, or price badges.
_Avoid_: Ad version, copy

**Image Analyzer**:
The AI sub-system that uses Gemini to inspect sample ads, classify them into predefined templates, and extract variable assets.
_Avoid_: Vision engine, ad parser

**Programmatic Assembler**:
The backend module that compiles, crops, resizes, and renders HTML/CSS layouts into a final SVG/PNG image using Satori.
_Avoid_: Image generator, rendering pipeline, canvas engine

**Subject Extraction**:
The process of isolating the main person, product, or subject from an uploaded image (utilizing AI background removal) to create a transparent PNG asset layer.
_Avoid_: BG removal, auto-cropping

**Assembly API**:
The headless HTTP integration endpoint (`POST /api/assemble`) that allows external agents or automation platforms (e.g. Make, Zapier) to programmatically trigger the Programmatic Assembler with structured layout parameters.
_Avoid_: Render endpoint, generate API



**HTML/CSS Editor**:
The interactive web interface where users can manually adjust, drag, and resize HTML element layers, preview designs, and chat with the AI to make live modifications.
_Avoid_: Canvas editor, design workspace, edit screen

**AI Chat Assistant**:
The conversational sidebar inside the HTML/CSS Editor that allows human users to request design modifications in natural language, which are executed via direct layout JSON state updates.
_Avoid_: Chat bot, designer agent


## Layout Categories

**Direct-Response Niche Product Ad**:
An ad layout designed for performance marketing, featuring bold banners, cropped subjects, overlapping product mockups, and price badges.
_Avoid_: Product flyer, sales poster

**Publisher Content Card**:
An ad layout styled to resemble native social publisher posts, featuring full-bleed background images, top-corner logos, bottom gradients, and highlighted typography.
_Avoid_: News card, clickbait post

**Native Social Ad**:
An ad layout that mimics organic social media posts or news tickers, utilizing elements like screenshot frames, eye censors, and hand-drawn callouts.
_Avoid_: Meme ad, screenshot post

**Recruitment Flyer**:
A structured layout for local recruitment campaigns, containing a header banner, a centered stock image with a country flag badge, and footer salary breakdowns.
_Avoid_: Job flyer, call center poster

**Typographic Flyer**:
A clean, text-only ad layout with a solid color background, center-aligned text, and directional pointer graphics.
_Avoid_: Simple flyer, green ad
