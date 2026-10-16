# ADR-0001: Documentation conventions

**Status:** Accepted
**Decides:** The house style for every document, comment, and UI string: Simple English on the ASD-STE100 model.

## Context

This repo has four surfaces with written language: ADRs and docs, code comments, task and error output, and UI copy. Humans and LLMs read all of them. Many human readers do not speak English as a first language.

Style drifts most where it is a matter of taste. A rule here is a closed list or a limit, so a reviewer cites it and does not argue taste. Most of a house style is already published. So this ADR adopts standards, and only its deltas are normative.

## Decision

### Adopted standards

| Surface | Adopted standard | Local delta, normative |
| --- | --- | --- |
| Prose and docs | [ASD-STE100](https://www.asd-ste100.org) Simplified Technical English, as a model. [ISO 24495-1:2023](https://www.iso.org/standard/78907.html) plain language. [Google Developer Documentation Style Guide](https://developers.google.com/style): present tense, active voice | the Simple English profile, the banned constructs, and the genre paths below |
| Code comments | [Google Style Guides](https://google.github.io/styleguide/) for the language of the repo. [Fowler, *Refactoring*](https://martinfowler.com/books/refactoring.html) for the Comments smell | the Simple English profile, the three tests, and the five grounds below |
| UI copy, task descriptions, and error messages | the Simple English profile | none |

### Simple English

Every text in this repo uses Simple English. This covers docs, ADRs, comments, commit titles, task descriptions, error messages, and UI copy.

The profile follows ASD-STE100. STE is a controlled language for technical text read by people with limited English. It keeps general words simple and permits the technical words of the field. This profile takes its writing rules and replaces its fixed dictionary with a CEFR B1 word level.

#### Words

| Rule | Bad | Good |
| --- | --- | --- |
| General words are at CEFR B1. Use the most common word for the meaning | `utilize`, `leverage`, `facilitate`, `prior to`, `in order to`, `hence` | `use`, `use`, `help`, `before`, `to`, `so` |
| Technical names and technical verbs are always allowed. A technical term is never replaced with a general word that changes its meaning | `the server draws the page` | `the server renders the page` |
| One term names one concept everywhere | `seam` in one ADR and `boundary` in the next for the same thing | `seam` in both |
| A word has one meaning. It is not used in a second sense | `the build` as the compile step and as the output artifact | `the build` for the compile step only |
| A single verb replaces a phrasal verb when one exists. A phrasal verb that is the technical name stays | `kick off`, `figure out`, `carry out` | `start`, `find`, `do`. `set up` and `roll back` stay |
| No idioms. A figurative term is used only as [ADR-0000](0000-foundations.md) defines it | `a moving target`, `under the hood`, `out of the box` | `changes often`, `inside`, `by default` |
| No abbreviations of Latin phrases | `e.g.`, `i.e.`, `etc.`, `vs.` | `for example`, `that is`, a complete list, `or` |
| No contractions | `don't`, `it's`, `can't` | `do not`, `it is`, `cannot` |

#### Sentences

| Rule | Limit |
| --- | --- |
| One idea per sentence | one main clause, and at most one dependent clause |
| Sentence length in descriptive text: ADRs, reference, comments, output | 25 words |
| Sentence length in procedures: `docs/guide/` and numbered steps | 20 words, as in STE rule 5.1 |
| Voice and tense | active voice, present tense |
| Three or more parallel items or steps | a list, not a sentence |
| Three or more items that share two or more attributes | a table |
| A procedure step | one instruction, starting with the verb |

A table cell, a list item, and a heading each count as separate text. A code span counts as one word.

#### Punctuation

Prose uses a closed set. Anything not in the allowed row is banned.

| Status | Marks |
| --- | --- |
| Allowed | period `.`, comma `,`, colon `:`, apostrophe for the possessive `the repo's` |
| Banned | em dash, en dash, semicolon, parentheses, `?`, `!`, ellipsis, quote marks, `&`, and `/` in the sense of `or` or `and` |

The banned marks have a standard replacement:

| Instead of | Write |
| --- | --- |
| An em dash or a semicolon that joins two clauses | two sentences, or a colon when the second part explains the first |
| An em dash or parentheses around an aside | a separate sentence, or delete the aside |
| A citation in parentheses, `(ADR-0100)` | a link in the sentence: `[ADR-0100](0100-toolchain.md) sets the rule.` or `Every tool is pinned, per [ADR-0100](0100-toolchain.md).` |
| An en dash in a number range | `1 to 5` |
| A question | the answer, as a statement |
| Quote marks around literal text | backticks. Emphasis uses bold or italics |
| `and/or`, `A / B` | `A or B`, `A and B`, or a list |
| `&` | `and` |

These are not prose, and the punctuation rules do not apply to them:

- Markdown syntax: links, images, tables, emphasis, headings, and HTML comments.
- Code spans, code fences, paths, URLs, identifiers, and call syntax such as `run()`.
- A hyphen inside a word: `read-only`, `one-word`.
- The enforcement annotations `(CI: <task>)` and `(ref: <standard>)`.
- A text adopted verbatim from a third party, such as a licence.

**The em dash, en dash, ellipsis, and curly quotes are banned in every tracked text file, code included.** They have no use in code, and a copy-paste from prose is the only way they arrive.

**Emoji are banned in every text.** A heading, a list item, or a commit title carries its meaning in words.

### Genre decides the path

| Path | Holds |
| --- | --- |
| `docs/adr/` | one decision per file |
| `docs/guide/` | a procedure someone executes |
| `docs/reference/` | a lookup, a registry, or live state |
| `README.md` at the root | what the repo is, who it is for, and how to start. It follows the skeleton for the size of the repo in [readme-template](https://github.com/tabmadi/readme-template) |

### Banned constructs

The table governs every document and every code comment.

| Banned | Example | Write instead |
| --- | --- | --- |
| **Chronology**: how the decision came to be, or the former state | `we moved to X`, `previously Y`, `it turned out to be` | The standing fact: what is true now. Git holds the history |
| **Intensifiers** | `very`, `really`, `quite`, `extremely`, `actually`, `simply`, `just`, `of course`, `obviously`, `clearly` | Delete it. A claim that needs an intensifier is not established |
| **Hedges** | `arguably`, `essentially`, `basically`, `generally`, `typically`, `more or less`, `in practice` | Decide. A hedge is an unfinished decision |
| **Meta-commentary** | `It is worth knowing`, `Note that`, `This section explains` | State the thing |
| **Questions** | `But is the schema in step with the migration?` | The answer, as a statement |
| **Planned work**: a `Follow-ups` list, a `TODO`, a roadmap | `add a linter for the hedge list` | Nothing. State the law and stop, per [ADR-0000](0000-foundations.md) |
| **The implementation's status** | `not yet wired`, `for now`, `currently`, `so far` | The rule, with no qualifier. Whether the artefact exists is not the ADR's subject |
| **A link to an untracked file** | `[plan](plan.local.md)` | Nothing. The file is absent from every other clone |
| **A number that goes stale** | `~25 components` | A link to the registry, or the threshold with its conditions |

A number is stated when the number is the decision. One test settles it: if the number doubled, the decision would change. Such a number is a threshold, and it is stated with the conditions it was measured under. Any other number is decoration, and it goes stale.

### Line breaks and tables

**Markdown is not hard-wrapped.** Each paragraph, list item, or table row is one line. `MD013` is disabled in `.rumdl.toml` for this reason.

**Tables are compact, never padded.** Each pipe has one space inside it, and the delimiter is a bare `---` for any column width. `MD060` enforces it.

Both rules protect the diff. A reflowed paragraph or a wider column rewrites every line after it. A one-word edit then shows as a whole-file change.

### Code comments

The Simple English profile and the banned constructs apply to comments in every language of the repo, and in YAML, TOML, and JSON with comments.

**The reader is an expert with an LLM at hand.** The code shows what it does, how it is structured, and why a shape is idiomatic. A comment carries only what neither the code nor the ADR set shows.

The first step is always to change the code instead. Fowler states it in the Comments smell of [*Refactoring*](https://martinfowler.com/books/refactoring.html): *whenever we feel the need to comment something, we write a method instead*. A name carries the explanation to every call site and cannot fall out of step with what it names.

Three tests decide every comment that survives that step. A comment that fails one test is deleted.

| Test | What it asks | What fails it |
| --- | --- | --- |
| **Deletion** | Without it, would a reader make a wrong change | A comment that makes a reader faster but does not change what they would do. Doubt resolves to deletion |
| **Genre** | Would the sentence still be true if this file were deleted | A decision, a procedure, or a lookup. It belongs in an ADR, `docs/guide/`, or `docs/reference/`, and the comment cites it |
| **Length** | Is it one paragraph of at most three lines | A second paragraph, which is a document. One line is the norm |

A comment survives on one of five grounds:

- an external system's behaviour that its own documentation omits or contradicts
- a constraint that an ADR owns and the code cannot express, cited as `ADR-XXXX`
- an ordering or timing dependency that the call site does not show
- a deliberate omission: something a reader would otherwise add back
- on an exported identifier: units, null values, bounds, side effects, or error conditions

An exported identifier gets a doc comment only when the comment states a fact that the signature cannot. A doc comment that restates the signature is deleted. A doc comment is in present tense and full sentences.

| Banned | Reason |
| --- | --- |
| A comment that explains confusing code | It is a defect. Rewrite the code, as [Kernighan and Plauger](https://en.wikipedia.org/wiki/The_Elements_of_Programming_Style) state: do not comment bad code, rewrite it |
| A comment about a state that a later edit makes false: a placeholder to swap, a step for day one | The value already states it. Once the value changes, the comment is not stale but wrong |
| A comment that teaches a third-party tool what its own documentation teaches | The reader is an expert with an LLM at hand |
| A comment that restates a convention the path, file name, or identifier carries | The structure is the statement |
| Commented-out code | Git holds it |
| Changelog, author, or date comments | Git holds them |
| Decorative banners and section dividers | The file structure is the structure |
| A `TODO` with no issue or ADR behind it | It is planned work, and [ADR-0000](0000-foundations.md) keeps planned work out of the committed record |

## Consequences

A reader with B1 English reads every text in the repo. An LLM gets closed lists and limits, not taste.

Some ideas need two or three short sentences, not one long sentence. This is accepted: the reader reads faster and misreads less.

No task checks the profile, the banned constructs, or the comment rules. A document that passes `lint:md` can still violate this ADR. Review is the gate for the rest, and the closed lists give a reviewer a mechanical reason to reject a text.

## Rules

- Prose follows ISO 24495-1 plain language and the Google developer-docs voice: present tense and active. `(ref: ISO 24495-1, Google dev-docs)`
- Every text in the repo uses the Simple English profile: docs, ADRs, comments, commit titles, task descriptions, error messages, and UI copy. `(ref: ASD-STE100)`
- General words are at CEFR B1, with the most common word for the meaning. Technical names and technical verbs are always allowed, and are never replaced with a general word that changes the meaning.
- One term names one concept across the set, and a word keeps one meaning.
- A single verb replaces a phrasal verb when one exists. No idioms.
- Latin abbreviations and contractions are not used: no `e.g.`, `i.e.`, `etc.`, or `vs.`, and no `don't` or `it's`.
- A sentence has one idea and at most 25 words. A sentence under `docs/guide/` or in a numbered procedure has at most 20 words.
- Prose punctuation is period, comma, colon, and the possessive apostrophe. The em dash, en dash, semicolon, parentheses, `?`, `!`, ellipsis, quote marks, `&`, and `/` in the sense of `or` are not used in prose. Markdown syntax, code, paths, URLs, and enforcement annotations are not prose.
- The em dash, en dash, ellipsis, and curly quotes appear in no tracked text file, code included. A text adopted verbatim from a third party is exempt.
- Three or more items that share two or more attributes are a table. Three or more parallel items are a list.
- Chronology, intensifiers, hedges, meta-commentary, questions, planned work, and implementation status appear in no document and no comment.
- A number is stated only if doubling it would change the decision. Any other count becomes a link to its registry.
- No committed file links to an untracked one.
- A decision lives in `docs/adr/`, a procedure in `docs/guide/`, and a lookup in `docs/reference/`. The root `README.md` says what the repo is and how to start.
- No text uses emoji: not in a heading, a list, a commit title, or task output.
- Markdown is not hard-wrapped: one line per paragraph, list item, or table row.
- Tables are compact, never padded: one space inside each pipe and a bare `---` delimiter. `(CI: lint:md)`
- Markdown passes `rumdl`. `(CI: lint:md)`
- The first answer to the need for a comment is to extract a named function. `(ref: Fowler, Refactoring)`
- A comment carries only what an expert reader cannot derive from the code and the ADR set. Doubt resolves to deletion.
- A comment is one paragraph of at most three lines. One line is the norm.
- A fact that outlives the file it describes is an ADR or a doc, and the comment cites it instead of restating it.
- An exported identifier has a doc comment only when the comment states a fact the signature cannot. A doc comment that restates the signature is deleted.
- No comment describes a state that a later edit makes false. The value it describes states it.
- A comment does not teach a third-party tool what that tool documents, and does not restate a convention that the path or identifier carries.
- Commented-out code, changelog, author, or date comments, and decorative banners are not committed.
- A `TODO` cites an issue or an ADR.
- A comment that exists to explain confusing code is a defect. The code is rewritten.
