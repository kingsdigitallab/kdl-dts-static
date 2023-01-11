# Static Distributed Text Services (DTS) Generator

The principle is the same as a static web site generator but for [Distributed Text Services](https://distributed-text-services.github.io/specifications/). This server-side javascript app requests documents from a DTS server such as [kdl-dts-server](https://github.com/kingsdigitallab/kdl-dts-server) and saves the responses to the file system. The response files can be served by a static web server (e.g. Github pages) and consumed by a DTS client with some minor adaptations of the client code.

**STATUS**: this package is currently customised for the [Alice Thornton's Books research project](https://github.com/kingsdigitallab/alice-thornton). The intention is to generalise it so it works with other projects.

## Purpose

Because text collections and chunks can be served via a standard protocol (DTS) but without the need for a dynamic service, this approach increases the sustainability of the texts (i.e. remove applicative dependency) and reduces the technical barrier and cost to publish them (static web services are easier to set up and migrate, and cheaper to run). There are other advantages typically found with static output such as lowered security risks, faster delivery and more stable operations.

## Drawbacks

The main disadvantages of this approach are:

1. the potential inflation of the corpus size: because multiple derivative output formats are saved on disk;
2. the need to re-generate the entire static content to release changes;
3. the degraded compliance with DTS standard (which requires adaptations to the DTS clients);
4. the loss of support for certain DTS features;

# Usage

TODO

# Deviations from DTS standard

TODO

