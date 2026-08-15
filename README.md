The Challenge
Once a customer signs on, delivery work (onboarding, implementation milestones, ongoing project tasks) is tracked internally as projects, each broken into milestones and tasks, often with more than one owner. But progress updates arrive scattered across chat, email, and calls, with no single place where a customer or internal stakeholder can see full status. There is currently no unified view, internal or customer-facing, and no automatic way to turn an unstructured update into structured project status.

Why It Matters
Without a shared view, customers have no way to check status themselves, so they default to asking for it directly, which pulls a person into every status conversation. Every unstructured update that comes in over chat, email, or a call has to be manually read and translated into project state by that same person. That person becomes the bottleneck for anyone else who wants visibility, whether that is another internal team or the customer.

Success Looks Like
Build a project delivery dashboard that includes:

Must Have

A projects overview screen listing every project, its owners (a project can have more than one), and its current status at a glance.
A project detail view showing milestones and tasks, with clear open, blocked, and done states.
Two distinct views of the same project: an internal view with full detail, and a customer-facing view that shows only what a customer should see.
An issues panel on each project linking relevant tickets, using the provided issue category taxonomy (Bug / Feature Request / Question / Support / Implementation).
An updates or activity feed per project that ingests unstructured update text (chat- or email-style) and shows it as structured, timestamped status entries.
Bonus Points

Kanban-style view of milestones/tasks.
Document vault attached to a project, visible in the customer-facing view.
Flags projects with no status movement for an extended period.
Natural-language query over project state (e.g. "which projects are behind schedule").
Constraints & Scope
Technology Requirements

No specific technology stack, platform, or framework is required. Participants are free to build this however they choose.
Data Assumptions

Participants create their own mock/synthetic data for projects, milestones, tasks, owners, and the unstructured updates feed. Using an AI tool to generate this mock data is expected and fine.
No real FlytBase customer data may be used at any point.
Demo Requirements

Live demo: show the internal view and the customer view side by side, making clear how everything lives and where everything lives: what data exists, and which view it surfaces in.
Out of Scope (Optional Bonus)

Any live integration with real chat, email, or messaging systems.
Real authentication or integration with FlytBase's actual production systems.
