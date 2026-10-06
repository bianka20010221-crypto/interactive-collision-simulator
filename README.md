# Interactive Collision Scenario Simulator

Paramétervezérelt, böngészőben futó 2D/3D szemléltető szimulátor járműmozgások, fékezési forgatókönyvek és első karosszéria-érintkezés vizsgálatához.

> **Fontos:** oktatási és szemléltetési célú modell, nem igazságügyi szakértői bizonyíték.

## Fő funkciók

- állítható sebesség, kiindulási távolság, reakcióidő és lassulás;
- több járműprofil tömeg- és méretadatokkal;
- Bézier-pályák és időalapú mozgás;
- forgatott téglalapok ütközésvizsgálata SAT-algoritmussal;
- bináris kereséssel finomított első érintkezési idő;
- fékezési és kormányzási ellenpéldák;
- közös szimulációs állapot a felülnézeti és 3D nézethez;
- headless smoke test a fontos geometriai invariánsokra.

## Használat

Nyisd meg az `index.html` fájlt egy modern böngészőben. Nincs build lépés és nincs külső függőség.

## Teszt

```bash
node test/smoke-test.js
```

A teszt ellenőrzi többek között, hogy a sebesség és távolság vezérlők ténylegesen módosítják a pályát, az első érintkezés geometriailag helyes, a nézetváltás nem változtatja meg a számítást, és fékezéssel elkerülhető forgatókönyv is létrejön.

## Technológia

HTML · CSS · JavaScript · Canvas 2D · paraméteres geometria · SAT collision detection

