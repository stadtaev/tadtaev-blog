---
title: "The Missing Dimension of Software Quality"
date: "2026-10-12"
description: "An exploration of structural complexity, software boundaries, and whether design quality can be evaluated through explicit rules."
---

Consider two implementations of the same feature.

They have the same observable behaviour. Both pass their tests, satisfy the requirements, and perform adequately. By most conventional measures, they are equivalent.

Yet an experienced engineer examining both implementations might strongly prefer one over the other.

Perhaps one has clearly defined responsibilities, while the other distributes decisions across several components. Perhaps one keeps mutable state local, while the other allows it to escape into the surrounding system. Perhaps one makes its assumptions explicit through types, while the other relies on callers knowing what not to do.

The difference is real, even if nothing has failed yet.

What exactly are we recognising?

We might call one implementation cleaner, more elegant, or better structured. These descriptions are familiar, but they are not particularly useful for analysis. They communicate a judgement without explaining the properties behind it.

And if we cannot describe those properties, we have a problem. We cannot reliably compare them, communicate them, or determine whether they have been preserved as the system evolves.

So perhaps the interesting question is not what good code looks like.

It is **what properties of software structure make a system easier to reason about, and whether those properties can be identified independently of our preferences.**

## A different kind of complexity

Complexity is an overloaded word in software engineering.

We talk about algorithmic complexity, cyclomatic complexity, code complexity, architectural complexity. We apply the same word to rather different things and then wonder why reducing one kind doesn't necessarily improve another.

A function can be short and still introduce substantial complexity. A module can have a small public interface and still make assumptions about half the system. A project can contain dozens of neatly separated packages without having meaningful separation of responsibilities.

None of these observations is particularly surprising. What is interesting is what they have in common.

The difficulty is not necessarily in the individual parts. It is in what must be understood *together*.

Consider a function that performs a calculation. Its result depends on its arguments. We can examine the function and reason about it locally.

Now suppose the result also depends on mutable state held by another component, the current database contents, and some configuration that can change during execution.

The calculation may remain just as short. But reasoning about it now requires knowledge of several things that can vary independently.

We have introduced additional relationships into the problem.

That distinction seems important.

Counting components is not the same as understanding their dependencies. Separating code into modules is not necessarily the same as separating concerns. Hiding an implementation is not necessarily the same as removing the assumptions that other components make about it.

A boundary that conceals code but leaves its implicit dependencies intact has provided little isolation.

This suggests a more useful way to investigate structural complexity: rather than asking how many things a system contains, ask **which things must be considered together, and why**.

Some relationships are essential to the problem. Others are consequences of implementation choices.

Distinguishing the two might be one of the most valuable activities in software design.

## Following the boundaries

Once we start looking at relationships rather than files, several familiar programming decisions become more interesting.

Take validation.

A value arrives from outside the system. It may be absent, malformed, inconsistent, or simply unsuitable for a particular operation.

We validate it somewhere.

But what does validation actually establish? And who is entitled to rely on that guarantee?

If every component must independently check the same conditions, the system has not gained much from the first validation. The responsibility remains distributed. Each consumer must understand the uncertainty of the original input.

A meaningful boundary should change that.

On one side, a value may be untrusted. On the other, specific properties are guaranteed. The transition should be observable, and ideally represented in the types available to the rest of the system.

Similar questions arise with state.

A mutable variable confined to a function introduces a limited reasoning problem. The same variable shared across multiple modules introduces a different one. Its value now depends not only on the operation being examined, but also on what other parts of the system may have done.

The important property is not simply whether mutation exists. It is how far the consequences of mutation can reach.

Errors present another kind of boundary.

A business operation that cannot be completed because a rule rejects it is not the same as an operation that fails because the database is unavailable.

Both interrupt the expected execution path. But do they represent the same category of information? Should they have the same representation? Should the same component be responsible for interpreting them?

Using a single mechanism for both may be convenient, but convenience tells us little about the resulting structure.

These examples point towards a common theme.

**A module boundary is useful when it limits what one part of the system needs to know about another.**

A directory, namespace, class, or interface may help establish such a boundary. None guarantees it.

The question worth investigating is what actually crosses the boundary: values, mutable references, assumptions, error semantics, infrastructure details, or responsibilities.

That seems a more promising starting point for evaluating structure than the physical arrangement of source files.

## Towards structural evidence

There is a practical consequence to all this.

A system is not finished when its first implementation works. It must continue to accommodate changes, often made by people who did not participate in its original design.

The cost of those changes depends partly on how much of the existing system must be understood before anything can be modified safely.

That cost is rarely captured by conventional correctness measures.

Tests can establish that certain behaviours hold. Static analysis can identify particular classes of defects. Neither necessarily tells us whether a responsibility is located in the right module, whether a boundary carries unnecessary assumptions, or whether unrelated decisions have become inseparable.

These are structural properties, and they deserve their own means of examination.

Perhaps we can begin by representing modules, dependencies, types, state ownership, and contracts as something more explicit than an informal architectural diagram.

From there, certain questions become possible.

Can we identify dependency relationships that cross intended boundaries? Can we detect where an untrusted representation enters code that assumes stronger guarantees? Can we describe which effects or errors a module is permitted to expose? Can we evaluate how much of the system a change is likely to involve?

Not every structural property will admit a useful formal rule. Nor should every unusual dependency be considered a violation. Architecture involves trade-offs, and a model that ignores context would be of limited value.

But that does not mean structural evaluation must remain entirely subjective.

There is a difference between claiming to measure good design and identifying properties that provide evidence of it.

This is where the idea of elegance becomes interesting.

An elegant system is not necessarily the smallest or the one with the fewest abstractions. It is one in which responsibilities and relationships appear proportionate to the problem. The structure does not demand knowledge that the task itself does not require.

Such elegance is not proof of correctness. Nor is it a mathematical proof of sustainability. But it can be **evidence of a design whose complexity has been understood and deliberately constrained**.

And if sustainable evolution is an expectation of production software, structural quality should not remain an optional aesthetic concern. It belongs among the requirements we actively examine.

That leaves an interesting problem to investigate.

**How much of software structure can be represented formally, and which of its properties can be evaluated through explicit, verifiable rules?**

I want to approach this through the ordinary building blocks of software: modules, types, variable lifetimes, validation, error handling, dependencies, and boundaries.

Not to establish a universal architecture, but to understand which structural choices introduce necessary complexity, which introduce accidental complexity, and how we might tell the difference.

The goal is not to eliminate engineering judgement.

It is to give that judgement better evidence.
