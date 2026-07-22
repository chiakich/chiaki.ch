---
title: "Why Blocto’s web team switched our JS SDK to Monorepo"
date: 2023-05-22
lang: en
excerpt: "Last month at Blocto’s SDK development, we underwent a significant architectural transform…"
tags: ["blockchain", "sdk-development", "front-end-development", "monorepo", "javascript"]
cover: /assets/blog/blocto-js-sdk-monorepo/01.jpeg
readingTime: 5
canonical: https://medium.portto.com/why-bloctos-web-team-switched-our-js-sdk-to-monorepo-435f6fc72722
---
![](/assets/blog/blocto-js-sdk-monorepo/01.jpeg)
*Photo by Yancy Min on Unsplash*

Last month at Blocto’s SDK development, we underwent a significant architectural transformation, migrating our [JavaScript software development kit](https://docs.blocto.app/blocto-sdk/) (SDK) repositories from a multi-repo setup to a Monorepo architecture. This shift allowed us to streamline the management of our JavaScript SDK packages. After encountering several challenges with our multi-repo setup, we concluded that adopting a Monorepo would be the ideal solution. This article delves into the issues we faced with our previous setup, explores the advantages of a Monorepo architecture, and outlines our journey from Multi-Repo to Monorepo.

At first, we need to clarify what we mean by “Multi-Repo” and “Monorepo”. “Multi-Repo” refers to source code modules with dependencies on each other, but they are in separate version control repositories. On the other hand, “Monorepo” refers to source code modules with dependencies on each other and are housed within a single version control repository.

## The Starting Point

Blocto started as a core JavaScript SDK that enables developers to interact with multiple blockchains, including Ethereum, Polygon, Aptos, Solana, and other EVM-compatible chains. We later created some adapters, such as [web3-react-connector](https://www.npmjs.com/package/@blocto/web3-react-connector), [aptos-wallet-adapter-plugin](https://www.npmjs.com/package/@blocto/aptos-wallet-adapter-plugin), and [rainbowkit-connector](https://www.npmjs.com/package/@blocto/rainbowkit-connector) to encourage developers to adopt our SDK with their familiar web3 libraries.

As our product portfolio grew, the number of adapters repositories multiplied, with each adapter having its dedicated repository. However, the core SDK is shared across adapters, despite their distinct functionalities and appearances. This arrangement became increasingly complex as we added support for different blockchains and tools, making package management challenging within the Multi-Repo structure. Several factors contributed to the scalability issues:

-   Updating core SDK version across multiple codebases became cumbersome.
-   Administrative tasks involving Git, such as branching, committing, merging, and reviewing, needed to be replicated across numerous repositories for each feature implementation.
-   Testing code in a multi-repo setup with different SDK versions posed challenges. We had to adjust test rules for each adapter.

As these issues accumulated, it became evident that we needed to seek a solution. After careful evaluation, we decided to embrace a Monorepo approach, which consolidates all the relevant packages into a single repository. This paradigm shift aimed to simplify the management of interdependent components and streamline the upgrade process for the adapters when the core SDK repository was updated.

## Advantages of a Monorepo

During our exploration of Monorepo architectures, we discovered that besides addressing our existing challenges, this approach offered numerous additional benefits, particularly concerning developer collaboration. Some notable advantages included:

-   Encouraging collaboration: By consolidating all code within a Monorepo and making it easily accessible, developers were incentivized to collaborate on projects they didn’t necessarily own. The visibility of all code facilitated implementing simple fixes independently, reducing the reliance on others and expediting development.
-   Enabling large-scale refactoring: The unified nature of a Monorepo allowed us to undertake significant refactoring efforts across different projects. With all interdependent source code residing in a single Git repository, locating and modifying code became predictable. This predictability facilitated the development of utilities for various tasks, such as environment configuration, dev-servers, builds, checks, automated symlink management, lockfile management, and more.

Excited by these prospects, we compiled our findings, including the Monorepo blueprint, into a presentation for the team. We gathered feedback, iterated on the concept, and ensured that the proposed setup would be well-received and suitable for everyone involved. The response was positive, and we decided to proceed with the migration.

## Evaluating Options

We explored different package managers, including npm, yarn, and pnpm, as well as semantic versioning with a hosted registry and different dependency installation approaches. After careful consideration, we opted for a minimalist approach. We chose [Yarn](https://yarnpkg.com/) and [Yarn Workspaces](https://yarnpkg.com/features/workspaces), employed a single lockfile in the root of the Monorepo, and omitted semantic versioning. These decisions were driven by our desire to minimize overhead, utilize mature tools, and leverage our team’s familiarity with them.

To facilitate the developing process of Monorepo, we choose [Turborepo](https://turbo.build/repo), a powerful tool developed by Vercel. Turborepo provides an efficient way to manage Monorepo by optimizing tasks such as testing, linting, and building packages. By utilizing Turborepo’s capabilities, we significantly improved the speed of these crucial development processes, leading to enhanced productivity and reduced time-to-market for new features and updates.

Managing package versions within a Monorepo architecture can also be complex. To simplify this process, we have implemented [changesets](https://github.com/changesets/changesets), a tool that assists in controlling package versioning. Changeset automatically tracks and manages dependencies between packages within the Monorepo. It ensures that upgrades or changes in one package are correctly propagated throughout the entire codebase. This helps avoid version conflicts and reduces manual effort. Additionally, changeset can automatically generate changelogs, add tags, and create releases on GitHub.

## Revamped CI/CD and Testing Flow

In addition to adopting Turborepo and changeset, we overhauled our continuous integration/continuous deployment (CI/CD) and testing flow. We redesigned the pipeline to align with the new Monorepo structure and ensure a smooth development experience for both internal and external contributors. The revamped CI/CD pipeline featured automated testing, linting, and deployment processes, reducing the burden on developers and enabling them to focus on writing code rather than managing infrastructure.

## Improved Open-Source Contribution Experience

By transitioning to a Monorepo and optimizing our development workflow, we made significant strides in improving the open-source contribution experience. Developers from outside our organization now find it much easier to contribute to the Blocto SDK. The Monorepo structure eliminates the need to navigate multiple repositories, simplifying the process of finding, understanding, and modifying code. With a streamlined development environment, we encourage and welcome contributions from the wider community, fostering collaboration and innovation.

## Life After the Migration

Due to the long history of the core SDK, we have encountered some issues while upgrading to newer build and testing tools. However, we consider it as an opportunity to tidy up and refactor our legacy code.

In addition to resolving our initial challenges, we discovered that the Monorepo architecture provided even more benefits than anticipated. Onboarding new team members to our codebase became much easier, thanks to the streamlined setup process for local development environments.

Moreover, by unifying our codebase into a single Git repository, we established a common language and standardized Git guidelines across different front-end feature teams. We also implemented universal configurations for our code format and lint tool, encompassing merge rules and other settings, which enhanced collaboration and administration processes.

In conclusion, the implementation of our Monorepo architecture has exceeded our expectations. It has proven to be a suitable solution for our needs and has significantly improved our developer experience and productivity. While it is not without its challenges, the benefits far outweigh the difficulties. We are confident that our Monorepo setup will continue to support our scaling efforts and facilitate the addition of new packages in the future.

## Last but not least

The GitHub repository discussed in this article is open source and can be found at [https://github.com/portto/blocto-sdk](https://github.com/portto/blocto-sdk). We’re really excited to have contributors like you, so don’t hesitate to get involved and talk to us if you have any questions. We’re always happy to help!

* * *

[Why Blocto’s web team switched our JS SDK to Monorepo](https://medium.portto.com/why-bloctos-web-team-switched-our-js-sdk-to-monorepo-435f6fc72722) was originally published in [Blocto](https://medium.portto.com) on Medium, where people are continuing the conversation by highlighting and responding to this story.
