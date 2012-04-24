setImmediate.js
===============
**A NobleJS production**

Copyright © 2012 Barnesandnoble.com llc. Released under the [MIT license][mit].

Introduction
------------

A highly cross-browser implementation of the `setImmediate` and `clearImmediate` APIs, currently a
[W3C draft spec][spec] from the Web Performance Working Group. Allows scripts to yield to the browser, executing a
given operation asynchronously, in a manner that is typically more efficient and consumes less power than the usual
`setTimeout(..., 0)` pattern.

Runs at "full speed" in the following browsers, using various clever tricks:

 * Internet Explorer 6+
 * Firefox 3+
 * WebKit (exact cutoff unknown)
 * Opera 9.5+

In all other browsers we fall back to using `setTimeout`, so it's always safe to use.

Reference pages
---------------

 * [Efficient Script Yielding W3C Editor's Draft][spec]
 * [W3C mailing list post introducing the specification][list-post]
 * [IE Test Drive demo][demo]
 * [Introductory blog post by Nicholas C. Zakas][ncz]


[mit]: https://github.com/NobleJS/setImmediate/blob/master/MIT-LICENSE.txt
[spec]: https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/setImmediate/Overview.html
[list-post]: http://lists.w3.org/Archives/Public/public-web-perf/2011Jun/0100.html
[demo]: http://ie.microsoft.com/testdrive/Performance/setImmediateSorting/Default.html
[ncz]: http://www.nczonline.net/blog/2011/09/19/script-yielding-with-setimmediate/
