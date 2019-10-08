/**
 * SPA navigation after client mount
 */

module.exports = class {
  setPathname(pathname) {
    this.setState("pathname", pathname);
  }

  bindAnchors() {
    const component = this;

    Array.from(document.getElementsByTagName("a"))
      // not external links
      .filter(anchor => anchor.getAttribute("target") === null)
      .filter(anchor => anchor.getAttribute("href").startsWith("/") === true)
      // not yet bound
      .filter(anchor => anchor.alreadyBound === undefined)
      .forEach(function(anchor) {
        const href = anchor.getAttribute("href");

        // mark it bound so we don't do it again
        anchor.alreadyBound = true;

        // bind the click event so we control navigation like an SPA
        anchor.addEventListener("click", function(evt) {
          // parse
          const { pathname /*, searchParams*/ } = new URL(
            href,
            window.location.origin
          );
          // const query = Object.fromEntries(searchParams);

          // html5 history
          history.pushState(null, null, href);

          // set component pathname
          component.setPathname(pathname);

          // bind local anchor click events
          setTimeout(() => component.bindAnchors(), 100);

          evt.preventDefault();
        });
      });
  }

  onCreate(input, out) {
    let pathname;

    if (typeof window !== "undefined") {
      pathname = window.location.pathname;
    }

    if (out && out.global && out.global.pathname) {
      pathname = out.global.pathname;
    }

    this.state = { pathname };
  }

  onMount() {
    this.bindAnchors();
  }
};
