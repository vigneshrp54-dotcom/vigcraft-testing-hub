# Entity Relationship Design — VigCraft Testing Hub

## 1. ERD Overview
This document describes the **logical Entity Relationship Design** of the VigCraft Testing Hub
database. It explains how entities relate to one another, the strategy behind those relationships,
and the principles a developer, database administrator, or future maintainer should follow when
introducing new entities or relationships. It is a logical-level document: it describes the shape
and reasoning behind the entity relationships, not their physical implementation.

This document assumes the entity inventory defined in `schema.md`
(`database/schema/schema.md`) and the design principles, naming conventions, primary key strategy,
audit fields strategy, and soft delete strategy defined in `database-design.md`
(`database/design/database-design.md`). Those topics are referenced here by name and are not
redefined. This document is concerned specifically with how entities relate to one another — the
subject `schema.md` intentionally left at a high level and `database-design.md` does not address.

## 2. Design Objectives
- **Clarity of Ownership**: Every relationship makes explicit which entity depends on which, so
  ownership and lifecycle responsibility are never ambiguous.
- **Correctness Over Convenience**: Relationships are modeled to reflect the real structure of the
  testing domain, rather than simplified for ease of querying at the expense of accuracy.
- **Alignment with the Layered Modular Monolith**: Entity relationships mirror the module boundaries
  and service-to-service communication rules that govern the backend, so the data model and the
  application architecture tell the same story.
- **Predictability**: A developer encountering an unfamiliar relationship should be able to infer its
  behavior from the principles in this document, without needing to inspect implementation details.
- **Extensibility Without Disruption**: The relationship model accommodates new entities and new
  relationships over time without requiring rework of existing, already-established relationships.

## 3. Entity Categories
The entities defined in `schema.md` are grouped into the following logical categories for the
purpose of relationship design:

| Category | Entities |
|---|---|
| Identity & Access | Users, Roles, Permissions |
| Project & Organization | Projects, Project Members |
| Test Design | Test Suites, Test Cases, Test Steps |
| Test Execution | Test Runs |
| Automation | Playwright Runs, Playwright Results |
| Defect Management | Defects |
| Notification | Notifications |
| Reporting | Reports |
| Audit | Audit Logs |

These categories are used throughout this document to describe relationship patterns at a level
above individual entities, since many relationships follow the same shape within and across a
category.

## 4. Relationship Strategy
- Every relationship between entities is explicit and intentional; there are no implicit or
  inferred relationships anywhere in the model.
- Relationships are modeled to reflect a clear **direction of ownership**: one entity is the parent
  in the relationship, and the other is the dependent, even where both entities are otherwise
  peers in their category.
- Where two entities have a natural many-to-many association — such as Users and Projects, or Roles
  and Permissions — the relationship is modeled through a dedicated association entity rather than
  a direct many-to-many link, consistent with the Primary Key Strategy in `database-design.md`,
  which treats association entities as first-class entities with their own identity.
- Relationships never cross the boundary of the relational model itself: every relationship is
  expressed within the same MySQL 8+ schema, consistent with MySQL being the platform's single
  system of record.
- Relationship design favors a small number of consistent, well-understood patterns (Section 5)
  over bespoke, one-off relationship shapes.

## 5. Relationship Types

### 5.1 One-to-One
One-to-One relationships are the least common pattern in this schema and are reserved for cases
where a dependent entity represents a mandatory, exclusive extension of exactly one parent record —
that is, the dependent entity has no independent identity or reuse potential outside its single
parent. This pattern is used deliberately and sparingly, since most relationships in the testing
domain naturally involve an entity being associated with multiple related records rather than
exactly one.

### 5.2 One-to-Many
One-to-Many is the dominant relationship pattern across the schema, reflecting the natural hierarchy
of the testing domain. Representative examples include:
- A Role is associated with many Users.
- A Project is associated with many Test Suites.
- A Test Suite is associated with many Test Cases.
- A Test Case is associated with many Test Steps.
- A Test Case is associated with many Test Runs, representing repeated manual executions over time.
- A Project is associated with many Playwright Runs.
- A Playwright Run is associated with many Playwright Results, one per automated test outcome.
- A User is associated with many Notifications.
- A Test Run or Playwright Result may be associated with many Defects raised against it.

In each case, the "many" side holds the reference back to the "one" side, consistent with the
Foreign Key Relationship Strategy in Section 7.

### 5.3 Many-to-Many
Many-to-Many relationships exist where two entities can each be associated with multiple instances
of the other. Representative examples include:
- Users and Projects: a User may be associated with many Projects, and a Project has many Users,
  modeled through the Project Members association entity.
- Roles and Permissions: a Role is associated with many Permissions, and a Permission may apply to
  many Roles, modeled through a dedicated Role-Permission association entity.

Every Many-to-Many relationship in the schema is resolved through an association entity rather than
a direct link between the two related entities, per the Relationship Strategy in Section 4.

## 6. Primary Key Relationship Strategy
- Every entity relationship is ultimately expressed as a reference from one entity's UUID primary key
  to another, consistent with the UUID Strategy defined in `database-design.md`.
- Because every entity — including association entities such as Project Members — has its own UUID
  primary key, relationships are always traceable to a specific, addressable record rather than to
  an anonymous row identified only by the combination of its related entities.
- No relationship in this schema is expressed through a composite or natural key; the UUID primary
  key is the sole basis for identifying any entity that participates in a relationship.
- This uniform approach means the pattern for resolving any relationship in the schema is identical,
  regardless of which entities or categories are involved.

## 7. Foreign Key Relationship Strategy
- In a One-to-Many relationship (Section 5.2), the foreign key is always placed on the "many" side,
  referencing the primary key of the "one" side — for example, a Test Case holds a reference to its
  parent Test Suite, not the reverse.
- In a Many-to-Many relationship (Section 5.3), the two foreign keys are held by the dedicated
  association entity, each referencing one of the two related entities; neither of the two related
  entities holds a direct reference to the other.
- Ownership direction is never duplicated or expressed redundantly — a relationship is represented by
  exactly one foreign key reference (or, for Many-to-Many, exactly one association entity), never by
  mirrored references on both sides.
- Foreign key placement always reflects the dependency direction established in Section 4: the
  dependent entity holds the reference to its parent, never the other way around.
- The naming and constraint-level conventions that implement this placement are defined in
  `schema.md` (Foreign Key Strategy) and are not repeated here; this section addresses where and why
  a foreign key exists, while `schema.md` addresses how it is named and constrained.

## 8. Referential Integrity Strategy
- Every relationship described in Section 5 is backed by an enforced foreign key constraint, so the
  database itself guarantees that a dependent record can never reference a parent that does not
  exist.
- Referential integrity is treated as a guarantee of the relational model itself, not merely a
  convenience: no relationship in this schema is left to be enforced solely by the Service layer.
- Referential integrity is preserved consistently across every category in Section 3; there is no
  category of entity that is exempt from enforced relationships.
- Where a parent entity is soft-deleted (per the Soft Delete Strategy in `database-design.md`),
  referential integrity to its dependent records is preserved rather than broken — the relationship
  remains structurally intact even though the parent is no longer active.

## 9. Cascade Strategy
Cascade behavior is determined by the nature of the relationship, not applied uniformly:
- Relationships where the dependent entity has **no independent meaning** apart from its parent —
  such as a Test Case's Test Steps, or a Playwright Run's Playwright Results — are eligible for
  cascading removal, since the dependent records exist only to describe their parent.
- Relationships where the dependent entity has **independent reporting, audit, or business value** —
  such as a Defect, a Test Run, or an Audit Log entry — are never cascaded. These entities are
  protected relationships, consistent with the Soft Delete Strategy in `database-design.md`: the
  parent entity is soft-deleted rather than removed, so the question of cascading a hard delete does
  not arise in ordinary operation.
- Many-to-Many association entities (Section 5.3) are removed when the association itself is no
  longer valid — for example, a Project Members record is removed when a User's association with a
  Project ends — without affecting either of the two related entities themselves.
- This distinction ensures that cascade behavior always reflects whether a dependent entity is a
  structural component of its parent or an independently significant record that happens to
  reference its parent.

## 10. Entity Dependency Principles
- Entities fall into two broad tiers: **root entities**, which do not depend on any other entity to
  exist meaningfully (Users, Roles, Permissions, Projects), and **dependent entities**, which require
  a parent entity to exist meaningfully (Test Suites depend on Projects; Test Cases depend on Test
  Suites; Test Steps depend on Test Cases; Playwright Results depend on Playwright Runs).
- Dependency flows in one direction only: a dependent entity may reference its parent, but a root or
  higher-tier entity never depends on a lower-tier entity for its own meaning.
- Within Test Design (Section 3), dependency forms a clear chain — Project → Test Suite → Test Case
  → Test Step — and each entity in the chain is only meaningful in the context of its parent.
- Entities that record an **event or outcome** — Test Runs, Playwright Runs, Playwright Results,
  Notifications, Audit Logs — depend on the entities they describe but are not themselves depended
  upon by other entities; they sit at the end of the dependency chain.
- Defects occupy a cross-cutting position: they depend on the Test Execution or Automation entity
  that revealed them, while remaining independently significant records in their own right, per the
  Cascade Strategy in Section 9.

## 11. Relationship Validation Guidelines
- Before a dependent record is created, the existence and active state of its referenced parent
  entity is confirmed; a dependent record is never created against a parent that does not exist or
  has been soft-deleted, except where an explicit administrative workflow permits it.
- Many-to-Many association records (Project Members; the Role-Permission association) are validated
  to prevent a duplicate association between the same pair of entities, so a given User–Project or
  Role–Permission pairing exists at most once.
- Relationship validation is performed at the Service layer, in addition to the referential integrity
  guaranteed at the database level (Section 8), consistent with the layered enforcement principle
  established for the platform.
- Any relationship that would leave a dependent entity without a valid parent — for example,
  reassigning a Test Case to a Test Suite in a different Project without also validating the new
  parent — is rejected before the change is committed.
- Validation guidelines are applied uniformly regardless of relationship type (Sections 5.1–5.3); a
  Many-to-Many association is validated with the same rigor as a One-to-Many reference.

## 12. Future Scalability Considerations
- The dependency-chain structure described in Section 10 allows new entities to be introduced by
  attaching them at the appropriate tier without requiring changes to existing relationships — for
  example, a new entity describing an additional testing artifact can be added as a dependent of an
  existing Test Design entity without altering the Project → Test Suite → Test Case → Test Step
  chain.
- The association-entity pattern used for Many-to-Many relationships (Section 5.3) is directly
  reusable for future many-to-many needs — such as associating Test Cases with descriptive labels —
  without introducing a new relationship pattern into the schema.
- Because every relationship is explicit and uniformly modeled (Sections 4, 6, 7), extending the
  schema does not require reinterpreting how existing relationships behave; new relationships simply
  apply the same principles already established in this document.
- The clear separation between root and dependent entities (Section 10) means new categories of
  functionality can be introduced as new root entities, new dependent chains, or new cross-cutting
  entities (in the pattern established by Defects) without disturbing the existing entity
  categories in Section 3.
