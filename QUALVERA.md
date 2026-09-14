# Qualvera CRM

Qualvera CRM is Qualvera's internal, single-tenant CRM for sales and
operations. It is a release-only fork of
[Comp AI CRM](https://github.com/trycompai/crm). The Comp AI agent, evidence
ledger, tools, and skills stay in place.

**Nothing about a person is guessed.** A blank field is better than a
confidently wrong fact. Do not weaken
[`apps/agent/agent/skills/evidence.md`](./apps/agent/agent/skills/evidence.md),
[`identity-matching.md`](./apps/agent/agent/skills/identity-matching.md), or
[`data-boundaries.md`](./apps/agent/agent/skills/data-boundaries.md).

How Richard deploys and signs in: [`DEPLOY.md`](./DEPLOY.md).

## Separate from Company Knowledge

This repo is **not** Company Knowledge (`company-knowledge-app`).

- Keep the two products in separate repositories.
- Do not merge the codebases, databases, or Vercel projects.
- Do not reuse Company Knowledge deploy URLs for this CRM.
- A later link between an account and a CK org is a pointer, not a merge.

Company Knowledge holds establishments, NAICS, OSHA years, and ops people.
This CRM holds sales accounts, contacts, deals, and the agent that researches
them. Each product keeps its own source of truth.

## Data-model intent

This section is **documentation only**. It does not add schema, fields, or
migrations. Do not invent compliance status, health scores, or people data
until a real link exists.

| CRM record | Intended Company Knowledge counterpart | What may cross later |
| --- | --- | --- |
| Account / Company | A CK org | Domain, establishment, NAICS |
| Contact | An "Ask someone" / ops person | Name and role already on that person |

Rules for any future link:

1. **Match on observed identifiers**, not on a guessed company name. Domain
   and a stored CK org id are identifiers. A similar legal name is not.
2. **Copy only fields that exist on the linked CK record.** Do not fill a
   CRM field from a model guess.
3. **Account health is optional and later.** If Qualvera adds it, the only
   allowed input is OSHA year completeness on a **real** CK link. No CK
   link means no health value. Never invent "compliant", "at risk", or a
   score.
4. **People stay unguessed.** A contact is a person Qualvera already knows
   or observed. Do not invent a safety manager, "ask someone" name, or
   title to make the account look complete.

The existing agent already follows this: tools report what they observed,
and the ledger prices the evidence. Strong evidence writes. Weak evidence
becomes a suggestion a human settles.

## What this fork does not change

- Agent tools, skills, schedules, and the evidence ledger
- Single-tenant workspace (no org-per-customer model)
- Auth allow-list (`ALLOWED_SIGN_IN`)
- Intelligence stays in `apps/agent`, never in the API

## Local run

Same Bun + Docker flow as upstream. See [DEPLOY.md](./DEPLOY.md#local-quick-start)
or the [README quick start](./README.md#quick-start).
