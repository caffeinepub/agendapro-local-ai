# Specification

## Summary
**Goal:** Add an Automated Reminders module and enhance existing Agenda, Clients, Financials pages with structured insight panels.

**Planned changes:**
- Add a `generateReminders` backend query that returns two reminder records per upcoming appointment (24h before and 2h before), each with client name, appointment time, a friendly WhatsApp-ready message, and reminder type.
- Add a Reminders page accessible from the sidebar that fetches and displays reminders grouped into "24h Before" and "2h Before" sections, with each card showing client name, time, message, and a Copy-to-clipboard button with toast confirmation. Includes a loading skeleton and an insights panel noting reminders reduce no-shows.
- Enhance AgendaPage with a daily insights panel (computed client-side) showing today's appointments sorted by time, free time slots (gaps ≥ 30 min), overlapping appointment conflicts, and actionable insights for idle slots over 1 hour.
- Enhance ClientsPage with a CRM insights panel (computed client-side) showing three sections: Inactive clients (no visit in 30+ days with days since last visit), Frequent clients (ranked by visit count), and VIP clients (highest average spend per visit), each with a recommended action label.
- Enhance FinancialsPage with a financial insights panel (computed client-side) showing total revenue, average ticket value, top 3 income categories by transaction count, and an auto-generated insight highlighting the most profitable category.

**User-visible outcome:** Users can view and copy pre-written WhatsApp reminder messages for upcoming appointments, and all major pages (Agenda, Clients, Financials) now surface structured analytical insight panels to support better business decisions.
