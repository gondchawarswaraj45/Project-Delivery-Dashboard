# Project Delivery Dashboard

## The Challenge

Customer delivery work—onboarding, implementation milestones, and ongoing tasks—is tracked internally across projects, milestones, and tasks. However, progress updates are scattered across chats, emails, and calls, making it difficult for customers and internal teams to get a unified view of project status.

## Why It Matters

Without a shared dashboard, customers depend on people for status updates. Teams must manually read unstructured messages and convert them into project status, creating unnecessary work and a visibility bottleneck.

## Solution

A unified **Project Delivery Dashboard** that converts unstructured updates into structured project status while providing separate internal and customer-facing views.

### Core Features

* Projects overview with **status and multiple owners**
* Project details with **milestones and tasks**
* Clear **Open, Blocked, and Done** states
* Separate **Internal** and **Customer** views
* Project issues with categories:

  * Bug
  * Feature Request
  * Question
  * Support
  * Implementation
* Activity feed that converts chat/email-style updates into **timestamped structured status entries**

### Bonus Features

* Kanban view for milestones and tasks
* Project document vault
* Stale-project detection and alerts
* Natural-language project queries such as *"Which projects are behind schedule?"*

## Data & Scope

The system uses **mock/synthetic project data**, including projects, milestones, tasks, owners, issues, and unstructured updates. No real customer data is used.

## Demo

The demo showcases the **Internal View and Customer View side by side**, demonstrating what data exists, how it is processed, and which information is exposed to each audience.

## Out of Scope

* Live integration with chat, email, or messaging platforms
* Production authentication
* Integration with FlytBase production systems
