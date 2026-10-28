# Reglas de etiquetado v2: etiquetas que reflejan las columnas

Tu idea es buena y resuelve el principal defecto de la v1: que el parser tuviera que traducir entre dos vocabularios. Si la etiqueta se llama igual que el campo de Mongo, la conversión es mecánica. Además, la jerarquía de Anki (`tag:tense::pt` encuentra todo lo que cuelga de `tense::pt`) te da gratis la selección de práctica que quieres.

Tengo cuatro ajustes sobre tu propuesta, explicados en la sección 2.

## 1. Principios

1. **Etiqueta = clasificación estable de la nota. Campo = contenido.** Una etiqueta sirve para filtrar y agrupar. El `infinitive`, las formas conjugadas, el IPA y las negativas son contenido y se quedan como campos de la nota en Anki. No los conviertas en etiquetas: duplicarías el dato y podrían desincronizarse, y además `gostar de` ni siquiera es una etiqueta válida.

~~2. **Solo propiedades intrínsecas.** Nada de estado de estudio (`tricky`, `difícil`), que es personal y cambia, ni de datos derivables (como "tiene formas negativas"), que se quedarían desactualizados. Eso va en una colección de progreso por usuario.~~ Voy a usar pocas etiquetas, hard o tricky para aquellos elementos que me cuestan más. En vocabulario uso "crazy-difficult" para palabras muy extrañas. Aun no queda definido como tratar de estas etiquetas.

3. **Cada namespace es una faceta independiente.** Se combinan con AND entre facetas y OR dentro de una faceta. Esto es lo que permitirá elegir práctica: "presente + irregulares + verbos en -ar".
4. **Una etiqueta, un hecho, con formato fijo.** Solo `a-z 0-9 . -`, en minúsculas, sin acentos, sin guion bajo (en las búsquedas de Anki `_` y `*` son comodines). Separador `::`, máximo 3 niveles, ningún segmento vacío.
5. **El valor de la etiqueta es el valor guardado en Mongo.** Se usa un slug sin acentos (`preterito-perfeito`) y la etiqueta bonita para mostrar vive en el código del frontend.
6. **Vocabulario cerrado.** Un valor fuera de la lista es error, no etiqueta nueva.

## 2. Mis cuatro ajustes a tu propuesta

**a) `unit-code` debe llevar el curso.** Los códigos de unidad solo son únicos dentro de un curso (`present` en `pt-conjugation`, `01a` en `pt-b2.1`). Si una nota llegara a tener dos `course-code`, no sabrías a cuál pertenece `unit-code::imperfect`. La forma `unit-code::<course-code>::<unit-code>` elimina la ambigüedad y te deja la puerta abierta a notas en varios cursos sin retaguear después. Cambiarlo más tarde implicaría tocar todas las notas, así que conviene hacerlo ahora.

**b) El valor del código de unidad debe ser exactamente el `code` de tu `courses.json`.** En el CSV actual la unidad se llama `imperfect`, no `imperfeito`. `imperfeito` es el nombre del tiempo y `imperfect` el de la unidad. No son lo mismo y el parser no tiene por qué saber que se parecen. Usa el código del JSON, aunque sea en inglés.

**c) El código de curso incluye el idioma: `pt-b2.1`, no `b2.1`.** `Course.code` es único globalmente en tu modelo, y `b2.1` chocaría entre portugués e inglés. Es el mismo patrón que ya tienes en `pt-conjugation`.

**d) El segmento de idioma va en todas las facetas cuyo valor depende del idioma.** Tu `tense::pt::presente` es el patrón correcto, y lo extiendo a `mood`, `ending`, `flag` y `family`. Así el parser siempre hace `split('::')` con la misma forma `faceta::idioma::valor`, y puedes pedir en Anki `tag:ending::pt` para todas las terminaciones del portugués. Una regla de coherencia comprueba que ese idioma coincide con el del curso.

## 3. Catálogo

| Etiqueta | Formato | Cantidad | Campo en Mongo |
|---|---|---|---|
| `course-code` | `course-code::<código>` | 1 | `courseCode` |
| `unit-code` | `unit-code::<course-code>::<unit-code>` | 1 | `unitCode` |
| `mood` | `mood::<idioma>::<modo>` | 1 | `mood` |
| `tense` | `tense::<idioma>::<tiempo>` | 1 | `tense` |
| `ending` | `ending::<idioma>::<ar\|er\|ir\|or>` | 1 | `tags` |
| `flag` | `flag::<idioma>::<valor>` | 0 o más | `tags` |
| `family` | `family::<idioma>::<verbo-base>` | 0 o 1 | `tags` |
| `topic` | `topic::<tema>` | 0 o más | `tags` |

**Valores permitidos hoy (portugués)**
- **`mood`:** `indicativo`, `imperativo`
- **`tense`:** `presente`, `imperfeito`
- **`flag`:** `irregular`, `reflexos`, `derivados`, `impessoais`
- **`family`:** infinitivo base sin acentos (`ter`, `ver`, `vir`, `por`, `fazer`, `passar`)

**Namespaces reservados (no se validan todavía, pero nadie debe usarlos para otra cosa)**
- `concept::<concepto>`: abstracción entre idiomas, sustituye a `grammar::universal`. Ejemplo: `concept::present` enlazaría `tense::pt::presente` con `tense::en::present-simple`.
- `practice::<mecánica>`: solo para restringir qué ejercicios admite una nota cuando su tipo de nota permite varios (el tipo de nota de Anki ya define el ejercicio por defecto).
- `book::<libro>::<capitulo>`: lecturas.

**Ejemplos**
```
levantar-se: course-code::pt-conjugation  unit-code::pt-conjugation::present
             mood::pt::indicativo  tense::pt::presente  ending::pt::ar  flag::pt::reflexos

provir:      course-code::pt-conjugation  unit-code::pt-conjugation::present
             mood::pt::indicativo  tense::pt::presente  ending::pt::ir
             flag::pt::derivados  flag::pt::irregular  family::pt::vir

falar (imp): course-code::pt-conjugation  unit-code::pt-conjugation::imperative
             mood::pt::imperativo  tense::pt::presente  ending::pt::ar
```

## 4. Coherencia

| Regla | Detecta |
|---|---|
| El curso dentro de `unit-code::` debe ser igual al `course-code::` de la nota | Unidad de otro curso |
| El segmento de idioma de todas las etiquetas debe coincidir con el prefijo del curso (`pt-…`) | `tense::en::` en una nota de portugués |
| La combinación unidad + mood + tense debe estar en la tabla del curso (`present` = indicativo/presente, `imperfect` = indicativo/imperfeito, `imperative` = imperativo/presente) | Unidad con tiempo equivocado |
| `ending` debe coincidir con el infinitivo sin `-se` ni preposición | Terminación errónea |
| Infinitivo con `-se` ⇔ `flag::pt::reflexos` | Reflexivo sin marcar |
| `flag::pt::derivados` exige `family::` | Derivado sin base |
| `ending::pt::or` solo con `family::pt::por` | Terminación inválida |
| Cantidad exacta por faceta (columna "Cantidad") | Nota sin etiquetar o contradictoria |
| Namespace desconocido o valor fuera de catálogo | Erratas |

## 5. Cómo se convierte en seed y en selección de práctica

**Hacia Mongo.** Las facetas de cantidad 1 (`course-code`, `unit-code`, `mood`, `tense`) se extraen a campos escalares: son los que usas en índices y en la clave única. Además, guarda el **conjunto completo de etiquetas normalizadas** en `tags` (ordenado, sin duplicados) con un índice multikey. Esto implica cambiar el comentario del modelo, donde `tags` hoy significa "etiquetas semánticas", y tratar `curriculumTags` como una vista derivada (las etiquetas `ending`, `flag`, `family`) o como un campo heredado hasta que el frontend deje de usarlo.

**Hacia la práctica.** Una selección es una consulta que funciona igual en los dos lados:

| | Anki | Mongo |
|---|---|---|
| Presente + irregulares + -ar | `tag:tense::pt::presente tag:flag::pt::irregular tag:ending::pt::ar` | `{ tags: { $all: [ … ] } }` |
| -ar **o** -er, sin reflexivos | `(tag:ending::pt::ar OR tag:ending::pt::er) -tag:flag::pt::reflexos` | `{ tags: { $in: [...], $nin: [...] } }` |
| Todo el curso | `tag:course-code::pt-conjugation` | `{ courseCode: 'pt-conjugation' }` |

Más adelante puedes guardar esas selecciones como presets (`all`, `any`, `none`) y traducirlos a cualquiera de los dos formatos.

## 6. Migración desde v1

La conversión es mecánica: `course::pt::conjugation` → `course-code::pt-conjugation`, `unit::present` → `unit-code::pt-conjugation::present`, y a cada `mood::`, `tense::`, `ending::`, `flag::`, `family::` se le inserta `pt::`. Si ya aplicaste v1 en Anki, puedes hacerlo con *Notas → Buscar y reemplazar* con "En: Etiquetas" y expresiones regulares. Si todavía no, aplica directamente v2 desde tus etiquetas antiguas:

| Etiqueta antigua | v2 |
|---|---|
| `Verbos-Portugues::Presente::Presente-AR` | `course-code::pt-conjugation unit-code::pt-conjugation::present mood::pt::indicativo tense::pt::presente ending::pt::ar` |
| `Verbos-Portugues::Imperfeito::-AR` | `… unit-code::pt-conjugation::imperfect mood::pt::indicativo tense::pt::imperfeito ending::pt::ar` |
| `grammar::pt::verb::imperative` | `… unit-code::pt-conjugation::imperative mood::pt::imperativo tense::pt::presente` (más `ending::`) |
| `curso::en::C1.1` | `course-code::en-c1.1` |

Los datos que ya tienes en Mongo con `tense = "imperativo (presente)"` quedarían inconsistentes con `presente`. Como vas a regenerar la seed, lo más limpio es vaciar la colección e importar de nuevo.
